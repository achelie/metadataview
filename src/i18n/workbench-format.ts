export function interpolate(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Missing translation parameter: ${key}`);
    return String(values[key]);
  });
}
