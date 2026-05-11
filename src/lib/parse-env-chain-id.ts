/** Parse `NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID` (decimal or `0x` hex). */
export function parseEnvChainId(raw: string | undefined): number {
  if (!raw?.trim()) return 8453;
  const t = raw.trim();
  if (t.startsWith('0x') || t.startsWith('0X')) return parseInt(t, 16);
  return parseInt(t, 10);
}
