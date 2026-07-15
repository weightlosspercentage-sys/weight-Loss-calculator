export function getLocalizedHref(path: string, region: string): string {
  if (region === 'us') {
    return path;
  }
  return `/${region}${path}`;
}
