'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  formType: 'login' | 'signup';
  onSubmit: (e: FormEvent<HTMLFormElement>, email: string, password: string) => void;
  error: string | null;
  isLoading: boolean;
}

export default function AuthForm({ formType, onSubmit, error, isLoading }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-tr from-[#0f172a] via-[#334155] to-[#1e293b] dark:from-[#020617] dark:via-[#1e293b] dark:to-[#0f172a]">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-sm">
            {formType === 'login' ? 'Welcome Back' : 'Join the Club'}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {formType === 'login'
              ? 'Enter your credentials to access your account.'
              : 'Start saving and summarizing your links today.'}
          </p>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={(e) => onSubmit(e, email, password)}>
          <div className="space-y-4">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 bg-white/20 dark:bg-slate-900/40 text-white placeholder:text-slate-300 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm transition"
            />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-white/20 dark:bg-slate-900/40 text-white placeholder:text-slate-300 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm transition"
            />
          </div>

          {error && <p className="text-sm text-center text-red-400 pt-1">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:from-green-500 hover:via-blue-600 hover:to-purple-600 shadow-lg transition disabled:opacity-50"
            >
              {isLoading
                ? 'Processing...'
                : formType === 'login'
                ? 'Log In'
                : 'Sign Up'}
            </button>
          </div>
        </form>

        {/* Switch link */}
        <div className="text-sm text-center pt-4 text-slate-300">
          {formType === 'login' ? (
            <>
              Don&rsquo;t have an account?{' '}
              <Link
                href="/signup"
                className="text-blue-400 hover:underline hover:text-blue-300 transition"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-400 hover:underline hover:text-blue-300 transition"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
