export function buildPRUrl(
  manifest: Record<string, unknown>,
  checksum: string
): string {
  const name = manifest.name as string;
  const version = manifest.version as string;
  const id = manifest.id as string;
  const description = (manifest.description as string) || '';
  const permissions = (manifest.permissions as string[]) || [];

  const title = encodeURIComponent(`Add ${name} v${version}`);
  const body = encodeURIComponent(
    `## New App: ${name}\n\n` +
    `**ID:** ${id}\n` +
    `**Version:** ${version}\n` +
    `**Description:** ${description}\n` +
    `**Permissions:** ${permissions.join(', ')}\n` +
    `**Checksum:** \`${checksum}\`\n\n` +
    `---\n\n` +
    `Please review and merge to make this app available in the VibeDepot store.`
  );

  return `https://github.com/thehorse2000/vibedepot-registry/compare/main...main?expand=1&title=${title}&body=${body}`;
}
