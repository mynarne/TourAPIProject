import type { AuthUser } from '../../api/authApi';
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
export type AuthState = { status: AuthStatus; user: AuthUser | null; csrfToken: string | null; hydrate: () => Promise<void>; setAuthenticated: (user: AuthUser, csrfToken?: string) => void; signOut: () => Promise<void> };
