export default function safeParseArray(value: unknown): string[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(value as string);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    // If it's already an array, just ensure all elements are strings
    if (Array.isArray(value)) {
      return value.map(String);
    }
    return [];
  }
}
