export function resolvePort(
  portOptions: string | number | undefined,
  portEnv: string | undefined,
): number {
  const portInput = portOptions ?? portEnv;
  if (portInput === undefined) {
    return 3000;
  }
  return typeof portInput === "number"
    ? portInput
    : Number.parseInt(portInput, 10);
}
