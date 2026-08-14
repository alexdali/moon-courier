export function nowIso(): string {
  return new Date().toISOString();
}

export function minutesToClock(totalMinutes: number): string {
  const normalized = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(normalized / 60) % 24;
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function dayAndMinute(totalMinutes: number): { day: number; minuteOfDay: number } {
  const normalized = Math.max(0, Math.round(totalMinutes));
  return { day: Math.floor(normalized / 1_440) + 1, minuteOfDay: normalized % 1_440 };
}

export function addMinutesIso(isoTimestamp: string, minutes: number): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ISO timestamp: ${isoTimestamp}`);
  return new Date(date.getTime() + minutes * 60_000).toISOString();
}
