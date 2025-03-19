export function convertToCoinGeckoDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}
