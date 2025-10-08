export function getTenantFromHost(host?: string): string | null {
  if (!host) return null;
  // host might be: store-a.yourdomain.com or yourdomain.com
  const parts = host.split('.');
  if (parts.length < 3) return 'primary'; // root domain → fallback tenant
  return parts[0]; // subdomain = tenant
}
