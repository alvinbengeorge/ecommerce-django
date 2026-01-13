'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { usePathname } from 'next/navigation';

interface User {
    user_id: number;
    username: string;
    role: 'OWNER' | 'STAFF' | 'CUSTOMER';
    tenant_id: number | null;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();

    const checkAuth = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<User>(token);
                // Check expiry if needed
                setUser(decoded);
            } catch (e) {
                console.error("Invalid token", e);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();

        // Listen for storage events (cross-tab)
        const handleStorage = () => checkAuth();
        window.addEventListener('storage', handleStorage);

        return () => window.removeEventListener('storage', handleStorage);
    }, [pathname]);

    // Apply background color effect
    useEffect(() => {
        // Reset classes
        document.body.classList.remove('bg-red-50', 'bg-blue-50', 'bg-gray-50');

        if (user?.role === 'OWNER' || user?.role === 'STAFF') {
            document.body.classList.add('bg-red-300');
        } else if (user?.role === 'CUSTOMER') {
            document.body.classList.add('bg-blue-300');
        } else {
            document.body.classList.add('bg-gray-300');
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
