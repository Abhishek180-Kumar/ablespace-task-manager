'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Settings, Palette, Type } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api, User } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [name, setName] = useState(authUser?.name || '');
  const [email, setEmail] = useState(authUser?.email || '');
  const [position, setPosition] = useState(authUser?.position || '');
  const [username, setUsername] = useState(authUser?.username || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [leaveOpen, setLeaveOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.users.getMe();
        setUser(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setPosition(data.position || '');
        setUsername(data.username || '');
      } catch {
        setMessage('Failed to load profile');
      }
    };
    void load();
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await api.users.updateProfile({ name, email, position, username });
      setUser(updated);
      updateUser(updated);
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isGuest = user?.isGuest;

  return (
    <AuthGuard>
      <AppShell>
        <div className="grid gap-8 lg:grid-cols-[192px_1fr]">
          <aside className="space-y-1 text-sm">
            <Link href="/dashboard" className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to app
            </Link>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <Search className="h-4 w-4" />
            </div>
            <div className="rounded-md bg-gray-100 px-3 py-2 font-medium dark:bg-gray-800">Profile</div>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <Palette className="h-4 w-4" /> Theme
            </div>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <Type className="h-4 w-4" /> Color
            </div>
            <Link href="/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </aside>

          <main className="mx-auto w-full max-w-2xl space-y-8">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h1>
            {message && <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900">{message}</div>}

            <form onSubmit={saveProfile} className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <span className="text-sm font-medium">Profile picture</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">{(name || 'U').charAt(0).toUpperCase()}</span>
              </div>
              <label className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 text-sm dark:border-gray-800">
                <span>Email</span>
                <span className="flex flex-1 items-center justify-end gap-2">
                  <input type="email" value={email} disabled={isGuest} onChange={(event) => setEmail(event.target.value)} className="w-full max-w-56 rounded-md bg-gray-100 px-3 py-2 text-right outline-none dark:bg-gray-800" />
                </span>
              </label>
              <label className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 text-sm dark:border-gray-800">
                <span>Full name</span>
                <input value={name} disabled={isGuest} onChange={(event) => setName(event.target.value)} className="w-full max-w-56 rounded-md bg-gray-100 px-3 py-2 text-right outline-none dark:bg-gray-800" />
              </label>
              <label className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 text-sm dark:border-gray-800">
                <span>Title</span>
                <input value={position} disabled={isGuest} onChange={(event) => setPosition(event.target.value)} className="w-full max-w-56 rounded-md bg-gray-100 px-3 py-2 text-right outline-none dark:bg-gray-800" />
              </label>
              <label className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                <span>Username</span>
                <input value={username} disabled={isGuest} onChange={(event) => setUsername(event.target.value)} className="w-full max-w-56 rounded-md bg-gray-100 px-3 py-2 text-right outline-none dark:bg-gray-800" />
              </label>
              <div className="border-t border-gray-100 px-5 py-4 text-right dark:border-gray-800">
                <button disabled={saving || isGuest} className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-gray-950">{saving ? 'Saving...' : 'Save changes'}</button>
              </div>
            </form>

            <section className="space-y-4">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Workspace access</h2>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-500">Remove yourself from the workspace</p>
                <button onClick={() => setLeaveOpen(true)} className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/40">Leave Workspace</button>
              </div>
            </section>
          </main>
        </div>

        <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)} title="Leave Workspace">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">This demo workspace cannot remove users locally. In production this should call a workspace membership endpoint after confirmation.</p>
          <div className="flex justify-end">
            <button onClick={() => setLeaveOpen(false)} className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-950">Close</button>
          </div>
        </Modal>
      </AppShell>
    </AuthGuard>
  );
}
