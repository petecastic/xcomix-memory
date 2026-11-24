# On-chain Cards catalog

This folder is the arcade’s display catalog of **minted** X-Comix cards on Solana, Base, and Doge. It is not a store. Do not add prices, listings, or unminted art.

Live path (after Pete approves a deploy): `/cards/`.

## Data file

All minted items live in [`data/catalog.json`](data/catalog.json).

- `schema` — currently `1`.
- `updated_et` — last update, America/New_York.
- `counts` — totals by chain and collection (refresh these when you add items, or let `scripts/add_item.py` do it).
- `collections` — filter chips. Add a new object here only when a new collection is minted.
- `items` — one object per minted asset, token, or inscription.

Item shape:

```json
{
  "id": "sol-s1-110",
  "chain": "solana",
  "collection": "series1",
  "num": "110",
  "name": "#110 Example Title",
  "kind": "card",
  "asset": "<mint or inscription id>",
  "explorer": "https://solscan.io/token/<mint>",
  "thumb": "thumbs/sol-s1-110.webp",
  "minted": true
}
```

`kind` is `"card"` for collectible pages, or `"support"` for sprites, libraries, and strip wrappers. Support files are hidden until “Show support files” is turned on.

Explorer URL patterns:

- Solana: `https://solscan.io/token/<asset>`
- Base: `https://basescan.org/nft/<contract>/<tokenId>`
- Doge: `https://thedoginalsexplorer.com/inscription/<inscriptionId>`

Collection ids already in the file: `founder`, `series1`, `series1_cw`, `series1_bg`, `motion`, `collector`, `series2_orbit`, `base_edition`, `base_locked`, `series2_harbor`, `doge_strip`, `doge_dig`, `doge_game`, `doge_show`, `doge_pause`, `doge_arc1`, `doge_yard_issue`.

## Adding a daily-arc (or any newly minted) card

Do this **after** the mint receipt is written, and only for cards that actually minted. Drawn-only cards (for example a Base day that did not mint) stay out of this file.

1. Copy the front image (or a preview PNG of a Doge HTML card) onto the box.
2. From the repo root:

```bash
python3 cards/scripts/add_item.py \
  --chain solana \
  --collection series1 \
  --num 110 \
  --name "#110 The New Title" \
  --asset <ASSET_ADDRESS> \
  --image /path/to/front.png
```

For Base:

```bash
python3 cards/scripts/add_item.py \
  --chain base \
  --collection base_edition \
  --num BE-44 \
  --name "BE-44 · Title" \
  --contract 0xF4CB33F4b15c45194a53A8aEBF5178b3f267cCdf \
  --token-id 44 \
  --image /path/to/front.png
```

For Doge:

```bash
python3 cards/scripts/add_item.py \
  --chain doge \
  --collection doge_arc1 \
  --num A1-07 \
  --name "The New Title" \
  --asset <inscription_id ending in i0> \
  --image /path/to/preview_front.png
```

The script writes a 360 px wide `.webp` thumb, appends the item, and updates `counts` and `updated_et`.

3. Or append the JSON object by hand and drop `thumbs/<id>.webp` yourself (360 px wide, quality ~72). Then fix the `counts` object so the page header stays honest.
4. Commit on a **branch**. Do not merge to `main` or deploy until Pete has looked at the page and said yes.

## Do not add

- Held or unminted Series 1 numbers: #005, #012, #022, #023, #026, and any later drawn-only numbers (#085–#100, #103, BE-42/BE-43 until they mint).
- Prices, caps, USD estimates, “buy,” “invest,” or floor-price talk.
- Banned words (Kong, APE, “next Bitcoin,” unruggable) or third-party logos.

## Regenerating thumbs

Thumbs were built from the box mint-art archive. If you need to rebuild the whole set, the one-off builder used for the first catalog lived on the box at `/workspace/petecastic/releases/cards_build/build_catalog.py`. Day-to-day updates should use `add_item.py` only.
