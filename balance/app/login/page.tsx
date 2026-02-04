'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Redirect to dashboard on success
      router.push('/');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#003d2a] via-[#006f4e] to-[#00956a] overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-[#00b36b]/10 rounded-full blur-2xl" />

      {/* Login form modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header with B logo and tagline in styled banner */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-[#006f4e]/8 via-[#00956a]/6 to-[#006f4e]/4 rounded-xl p-4">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-gradient-to-br from-[#006f4e] to-[#00956a] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <p className="text-gray-700 text-base font-medium leading-relaxed">
                  Join users who are tracking their finances with Balance
                </p>
              </div>
            </div>
          </div>

          {/* Subheader */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm">Sign in to your Balance account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006f4e] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006f4e] focus:border-transparent pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#006f4e] border-gray-300 rounded focus:ring-[#006f4e]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#006f4e] hover:text-[#005a3f]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#006f4e] to-[#00875e] text-white rounded-lg hover:from-[#005a3f] hover:to-[#006f4e] focus:outline-none focus:ring-2 focus:ring-[#006f4e] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#006f4e] hover:text-[#005a3f] font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
