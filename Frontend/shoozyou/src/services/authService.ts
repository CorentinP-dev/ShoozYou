import { httpRequest } from './httpClient';

export type Role = 'admin' | 'seller' | 'client';

export type AuthUser = {
    id: string;
    name: string;
    role: Role;
    email: string;
    token: string;
    active: boolean;
    expiresAt?: number;
};

export type RegisterPayload = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};

const STORAGE_KEY = 'auth-user-v2';

const mapRole = (role: string): Role => {
    switch (role.toUpperCase()) {
        case 'ADMIN':
            return 'admin';
        case 'SELLER':
            return 'seller';
        default:
            return 'client';
    }
};

const decodeToken = (token: string): { exp?: number } => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { exp: typeof payload.exp === 'number' ? payload.exp * 1000 : undefined };
    } catch {
        return {};
    }
};

const saveSession = (session: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getStoredSession = (): AuthUser | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw) as AuthUser;
        if (session.expiresAt && Date.now() >= session.expiresAt) {
            clearSession();
            return null;
        }
        return session;
    } catch {
        clearSession();
        return null;
    }
};

export async function login(email: string, password: string): Promise<AuthUser> {
    const response = await httpRequest<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        authenticated: false,
    });

    const { user, token } = response;
    const { exp } = decodeToken(token);
    const session: AuthUser = {
        id: user.id,
        email: user.email,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
        role: mapRole(user.role),
        active: Boolean(user.active),
        token,
        expiresAt: exp,
    };

    saveSession(session);
    return session;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
    const response = await httpRequest<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: payload,
        authenticated: false,
    });

    const { user, token } = response;
    const { exp } = decodeToken(token);
    const session: AuthUser = {
        id: user.id,
        email: user.email,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
        role: mapRole(user.role),
        active: Boolean(user.active),
        token,
        expiresAt: exp,
    };

    saveSession(session);
    return session;
}

export function logout(): void {
    clearSession();
}

export async function refreshSession(): Promise<AuthUser | null> {
    const session = getStoredSession();
    if (!session) {
        return null;
    }

    if (session.expiresAt && Date.now() >= session.expiresAt) {
        clearSession();
        return null;
    }

    try {
        const profile = await httpRequest<{ id: string; email: string; firstName: string; lastName: string; role: string; active: boolean }>('/users/me');
        const updated: AuthUser = {
            ...session,
            id: profile.id,
            email: profile.email,
            name: `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.email,
            role: mapRole(profile.role),
            active: profile.active,
        };
        saveSession(updated);
        return updated;
    } catch {
        clearSession();
        return null;
    }
}
