export default function removeSpecificSymbolInLastPosition(targetString: string, targetSymbol: string): string {
  return targetString.endsWith(targetSymbol) ? targetString.slice(0, -1) : targetString;
}
