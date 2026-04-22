import { useState } from 'react';
import { Building2, ArrowRight, FlaskConical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthState, useAuthActions } from '@/context/AuthContext';

interface OrgSetupPageProps {
  onComplete: () => void;
  onSkip: () => void;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export default function OrgSetupPage({ onComplete, onSkip }: OrgSetupPageProps) {
  const { user } = useAuthState();
  const { refreshOrgs } = useAuthActions();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = slugify(name);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({ name: name.trim(), slug, created_by: user.id })
        .select()
        .single();
      if (orgErr) throw orgErr;

      const { error: memberErr } = await supabase
        .from('org_members')
        .insert({ org_id: org.id, user_id: user.id, role: 'owner' });
      if (memberErr) throw memberErr;

      await refreshOrgs();
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <div className="flex items-center justify-center w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-4 mx-auto">
            <Building2 className="w-6 h-6 text-primary-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-1">Set up your organization</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Create a team workspace to collaborate and share projects.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Organization name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Biotech"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              {slug && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Identifier: <span className="font-mono">{slug}</span>
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {submitting ? 'Creating…' : 'Create organization'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <button
            type="button"
            onClick={onSkip}
            className="hover:underline"
          >
            Skip for now — use personal projects
          </button>
        </p>
      </div>
    </div>
  );
}
