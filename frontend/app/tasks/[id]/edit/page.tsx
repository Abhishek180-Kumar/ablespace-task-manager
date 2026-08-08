'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import TaskForm from '@/components/TaskForm';
import { api, Task } from '@/lib/api';

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTask = async () => {
      try {
        const data = await api.tasks.findOne(id);
        setTask(data);
      } catch (err) {
        setError('Failed to load task');
      }
    };
    loadTask();
  }, [id]);

  const handleUpdate = async (data: any) => {
    try {
      await api.tasks.update(id, data);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Task</h1>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-500 rounded">{error}</div>}
          {task ? <TaskForm initialData={task} onSubmit={handleUpdate} submitLabel="Update Task" /> : <div>Loading...</div>}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
