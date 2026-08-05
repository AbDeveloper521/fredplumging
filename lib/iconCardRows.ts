/**
 * Splits the Icon Card section's cards into display rows, per the owner's
 * balancing rule: at most `maxPerRow` cards per row, rows as even as
 * possible, earlier rows taking the extra card — five cards become 3 + 2,
 * never the greedy 4 + 1 a plain flex-wrap would give.
 */
export function chunkBalancedRows<T>(items: T[], maxPerRow = 4): T[][] {
  if (items.length === 0) return [];
  const rowCount = Math.ceil(items.length / maxPerRow);
  const base = Math.floor(items.length / rowCount);
  let extra = items.length % rowCount;
  const rows: T[][] = [];
  for (let start = 0; start < items.length; ) {
    const size = extra > 0 ? base + 1 : base;
    if (extra > 0) extra -= 1;
    rows.push(items.slice(start, start + size));
    start += size;
  }
  return rows;
}
