import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// A0 baseline Auth.js config. User verification remains in app-level auth integration.
export function buildAuthJsConfig(): NextAuthConfig {
  return {
    trustHost: true,
    session: { strategy: 'jwt' },
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize() {
          return null
        },
      }),
    ],
  }
}
