/**
 * Translate Hex chain IDs into human-readable blockchain names.
 */
export function chainIdToName(chain?: string | null): string {
  switch (chain) {
    case "0x1":
      return "Ethereum";
    case "0x89":
      return "Polygon";
    default:
      return chain ?? "";
  }
}
