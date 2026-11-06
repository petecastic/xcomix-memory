// Discovers every $DKORN Jupiter Lock (VestingEscrow) on Solana mainnet and refreshes vault-clock/locks.json.
// Read-only: one getProgramAccounts call. No keys, no signing. Run: node scripts/sync-dkorn-locks.mjs
import fs from 'node:fs';
const RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const PROGRAM = 'LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn';
const MINT = 'A1gRAicaLnYRmKQwRbQCaEEp6iYfu5q5X5gTFAPBeVk';
const DISC = [244, 119, 183, 4, 73, 116, 135, 195];
const FILE = new URL('../vault-clock/locks.json', import.meta.url);
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(bytes) { let n = 0n; for (const b of bytes) n = n * 256n + BigInt(b); let s = ''; while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n; } for (const b of bytes) { if (b) break; s = '1' + s; } return s; }
const u64 = (d, o) => d.readBigUInt64LE(o);
function parse(pubkey, data) {
  const d = Buffer.from(data, 'base64');
  if (d.length < 208 || DISC.some((v, i) => d[i] !== v)) return null;
  if (b58(d.subarray(40, 72)) !== MINT) return null;
  const cliff = u64(d, 144), freq = u64(d, 152), cliffAmt = u64(d, 160), per = u64(d, 168), n = u64(d, 176), claimed = u64(d, 184), start = u64(d, 192), cancelledAt = u64(d, 200);
  const total = cliffAmt + per * n;
  return {
    escrow: pubkey, recipient: b58(d.subarray(8, 40)), creator: b58(d.subarray(72, 104)),
    cancelMode: d[138], updateRecipientMode: d[137],
    cliffTime: Number(cliff), frequency: Number(freq), numberOfPeriod: Number(n),
    vestingStartTime: Number(start), finalUnlock: Number(n > 0n ? cliff + freq * n : cliff),
    totalCommitted: Number(total) / 1e6, remainingLocked: Number(total - claimed) / 1e6,
    cancelled: cancelledAt > 0n
  };
}
const body = { jsonrpc: '2.0', id: 1, method: 'getProgramAccounts', params: [PROGRAM, { encoding: 'base64', filters: [{ memcmp: { offset: 0, bytes: b58(DISC) } }, { memcmp: { offset: 40, bytes: MINT } }] }] };
const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const j = await r.json();
if (j.error) { console.error('RPC error', j.error); process.exit(1); }
const found = j.result.map(a => parse(a.pubkey, a.account.data[0])).filter(Boolean).filter(x => !x.cancelled);
const cur = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const byEsc = Object.fromEntries(cur.locks.map(l => [l.escrow, l]));
let added = 0;
const locks = found.map(f => { const old = byEsc[f.escrow]; if (!old) added++; return { ...(old || { name: 'Fan Time-Capsule', tag: 'FAN', label: 'COMMUNITY CAPSULE' }), ...f }; });
for (const l of cur.locks) if (!locks.find(x => x.escrow === l.escrow) && l.pinned) locks.push(l);
locks.sort((a, b) => b.finalUnlock - a.finalUnlock || b.remainingLocked - a.remainingLocked);
const out = { ...cur, locks };
const before = JSON.stringify(cur.locks), after = JSON.stringify(locks);
if (before !== after) { out.syncedAt = new Date().toISOString(); fs.writeFileSync(FILE, JSON.stringify(out, null, 2) + '\n'); }
console.log(`found ${found.length} DKORN locks (${added} new); ${before === after ? 'no change' : 'locks.json updated'}`);
found.forEach(f => console.log(f.escrow, f.remainingLocked, new Date(f.finalUnlock * 1000).toISOString(), 'cancelMode', f.cancelMode));
