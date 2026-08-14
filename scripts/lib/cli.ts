export function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

export function optionValue(name: string): string | undefined {
  const direct = process.argv.find((value) => value.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function intOption(name: string, fallback: number, range?: { min?: number; max?: number }): number {
  const raw = optionValue(name);
  const parsed = raw === undefined ? fallback : Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be an integer`);
  if (range?.min !== undefined && parsed < range.min) throw new Error(`${name} must be >= ${range.min}`);
  if (range?.max !== undefined && parsed > range.max) throw new Error(`${name} must be <= ${range.max}`);
  return parsed;
}

export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
