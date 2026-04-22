import { useState } from 'react';
import { FlaskConical, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthActions } from '@/context/AuthContext';

interface SignupPageProps {
  onNavigateToLogin: () => void;
}

export default function SignupPage({ onNavigateToLogin }: SignupPageProps) {
  const { signUp } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password, displayName);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">PeptiPlan</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Peptide Manufacturing Planner</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Check your email</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              </p>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="mt-3 text-sm text-primary-500 hover:underline font-medium"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create your account</h2>

              {error && (
                <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Display name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {submitting ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-primary-500 hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
