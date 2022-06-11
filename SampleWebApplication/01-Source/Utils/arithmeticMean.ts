export default function arithmeticMean(...numbers: Array<number>): number {
  return numbers.reduce((previous: number, current: number): number => previous + current) / numbers.length;
}
