/**
 * Centralized API Base URL Resolver
 * Ensures environment parity across local development, Docker, and production deployments.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side execution
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7880';
  }
  // Server-side execution
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7880';
}
