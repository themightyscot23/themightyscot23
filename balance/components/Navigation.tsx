'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, List, Settings, LogIn, LogOut, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch {
      console.error('Logout failed');
    }
  };

  // Don't show nav items on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Balance</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {/* Main nav items - only show if not on auth page */}
            {!isAuthPage && navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Auth buttons */}
            {!loading && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                {user ? (
                  <>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{user.name || user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
