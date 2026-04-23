import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Sun, Moon, Monitor, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthState, useAuthActions } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/context/ThemeContext';

interface SettingsModalProps {
  onClose: () => void;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { user } = useAuthState();
  const { updateProfile, updatePassword } = useAuthActions();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [savedPw, setSavedPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  async function handleChangePassword() {
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return; }
    setPwError(null);
    setSavingPw(true);
    try {
      await updatePassword(newPassword);
      setSavedPw(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSavedPw(false), 2500);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function handleSaveName() {
    if (!displayName.trim()) { setNameError('Name cannot be empty'); return; }
    setNameError(null);
    setSaving(true);
    try {
      await updateProfile(displayName.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setNameError('Failed to save — please try again');
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Account */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Account</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600">
                  {user?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Display name
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => { setDisplayName(e.target.value); setNameError(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button
                    onClick={handleSaveName}
                    disabled={saving || displayName.trim() === user?.displayName}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-lg transition-colors shrink-0"
                  >
                    {saved ? <Check className="w-4 h-4" /> : saving ? '…' : 'Save'}
                  </button>
                </div>
                {nameError && (
                  <p className="mt-1.5 text-xs text-red-500">{nameError}</p>
                )}
              </div>
            </div>
          </section>

          {/* Change Password */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Change Password</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPwError(null); }}
                    placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm new password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPwError(null); }}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              <button
                onClick={handleChangePassword}
                disabled={savingPw || !newPassword || !confirmPassword}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                {savedPw ? <><Check className="w-4 h-4" /> Password updated</> : savingPw ? 'Saving…' : 'Update password'}
              </button>
            </div>
          </section>

          {/* Appearance */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Appearance</h3>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                    theme === value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
