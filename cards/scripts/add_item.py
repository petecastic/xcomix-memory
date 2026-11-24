#!/usr/bin/env python3
"""Append one minted card to cards/data/catalog.json and write a lean webp thumb.

Usage examples are in cards/README.md. Refuses to add prices. Does not mint or deploy.
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]  # cards/
CATALOG = ROOT / "data" / "catalog.json"
THUMBS = ROOT / "thumbs"
THUMB_W = 360
QUALITY = 72

EXPLORERS = {
    "solana": "https://solscan.io/token/{asset}",
    "base": "https://basescan.org/nft/{contract}/{token_id}",
    "doge": "https://thedoginalsexplorer.com/inscription/{asset}",
}


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def make_thumb(src: Path, dest: Path) -> None:
    im = Image.open(src)
    if im.mode == "RGBA":
        bg = Image.new("RGB", im.size, (20, 14, 40))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")
    w, h = im.size
    if w > THUMB_W:
        im = im.resize((THUMB_W, max(1, int(h * THUMB_W / w))), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=QUALITY, method=4)


def now_et() -> str:
    dt = datetime.now(ZoneInfo("America/New_York"))
    return dt.strftime("%Y-%m-%d %-I:%M %p ET")


def recount(data: dict) -> None:
    items = data["items"]
    by = {}
    for it in items:
        by[it["collection"]] = by.get(it["collection"], 0) + 1
    data["counts"] = {
        "total": len(items),
        "solana": sum(1 for i in items if i["chain"] == "solana"),
        "base": sum(1 for i in items if i["chain"] == "base"),
        "doge": sum(1 for i in items if i["chain"] == "doge"),
        "cards": sum(1 for i in items if i.get("kind") != "support"),
        "support": sum(1 for i in items if i.get("kind") == "support"),
        "by_collection": by,
    }


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--chain", required=True, choices=("solana", "base", "doge"))
    p.add_argument("--collection", required=True, help="catalog collection id, e.g. series1")
    p.add_argument("--name", required=True)
    p.add_argument("--image", required=True, type=Path, help="front or preview image")
    p.add_argument("--num", default="")
    p.add_argument("--id", default="", help="stable id; default is derived")
    p.add_argument("--asset", default="", help="Solana asset or Doge inscription id")
    p.add_argument("--contract", default="", help="Base contract (with --token-id)")
    p.add_argument("--token-id", default="", dest="token_id")
    p.add_argument("--kind", default="card", choices=("card", "support"))
    args = p.parse_args()

    if re.search(r"(price|\$\d|invest|floor|buy now)", args.name, re.I):
        raise SystemExit("Refusing a name that looks like a price or sale pitch.")

    if not args.image.is_file():
        raise SystemExit(f"Image not found: {args.image}")

    if args.chain == "base":
        if not args.contract or args.token_id == "":
            raise SystemExit("Base items need --contract and --token-id")
        asset = f"{args.contract}/{args.token_id}"
        explorer = EXPLORERS["base"].format(contract=args.contract, token_id=args.token_id)
    else:
        if not args.asset:
            raise SystemExit(f"{args.chain} items need --asset")
        asset = args.asset
        explorer = EXPLORERS[args.chain].format(asset=args.asset)

    data = json.loads(CATALOG.read_text())
    col_ids = {c["id"] for c in data["collections"]}
    if args.collection not in col_ids:
        raise SystemExit(
            f"Unknown collection {args.collection!r}. Add it to catalog.json collections first, or pick one of: "
            + ", ".join(sorted(col_ids))
        )

    prefix = {"solana": "sol", "base": "base", "doge": "doge"}[args.chain]
    item_id = args.id or f"{prefix}-{slug(args.collection)}-{slug(args.num or args.name)}"
    if any(i["id"] == item_id for i in data["items"]):
        raise SystemExit(f"id {item_id} already exists")
    if any(i.get("asset") == asset for i in data["items"]):
        raise SystemExit(f"asset {asset} already exists")

    thumb_rel = f"thumbs/{item_id}.webp"
    make_thumb(args.image, ROOT / thumb_rel)

    item = {
        "id": item_id,
        "chain": args.chain,
        "collection": args.collection,
        "num": args.num,
        "name": args.name,
        "kind": args.kind,
        "asset": asset,
        "explorer": explorer,
        "thumb": thumb_rel,
        "minted": True,
    }
    data["items"].append(item)
    data["updated_et"] = now_et()
    recount(data)
    CATALOG.write_text(json.dumps(data, indent=2) + "\n")
    print(f"Added {item_id}")
    print(f"Thumb  {thumb_rel}")
    print(f"Total  {data['counts']['total']} (solana {data['counts']['solana']}, base {data['counts']['base']}, doge {data['counts']['doge']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
