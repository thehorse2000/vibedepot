import keytar from 'keytar';

const SERVICE = 'vibedepot';

export async function setApiKey(
  provider: string,
  key: string
): Promise<void> {
  await keytar.setPassword(SERVICE, provider, key);
}

export async function getApiKey(provider: string): Promise<string | null> {
  return keytar.getPassword(SERVICE, provider);
}

export async function deleteApiKey(provider: string): Promise<boolean> {
  return keytar.deletePassword(SERVICE, provider);
}

export async function listConfiguredProviders(): Promise<string[]> {
  const creds = await keytar.findCredentials(SERVICE);
  return creds.map((c) => c.account);
}

export async function hasApiKey(provider: string): Promise<boolean> {
  const key = await getApiKey(provider);
  return key !== null;
}
