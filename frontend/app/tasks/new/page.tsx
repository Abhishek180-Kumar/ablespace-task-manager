'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import TaskForm from '@/components/TaskForm';
import { api, CreateTaskDto } from '@/lib/api';

export default function NewTaskPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleCreate = async (data: CreateTaskDto) => {
    try {
      await api.tasks.create(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Task</h1>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-500 rounded">{error}</div>}
          <TaskForm onSubmit={handleCreate} submitLabel="Create Task" />
        </div>
      </AppShell>
    </AuthGuard>
  );
}
