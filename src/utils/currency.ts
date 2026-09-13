export const USD_TO_UGX_RATE = 3700;

export function convertUSDToUGX(numericUSD: number): number {
  return Math.round(numericUSD * USD_TO_UGX_RATE);
}

export function formatUGX(numericUSD: number): string {
  const ugxAmount = convertUSDToUGX(numericUSD);
  return `UGX ${ugxAmount.toLocaleString()}`;
}


