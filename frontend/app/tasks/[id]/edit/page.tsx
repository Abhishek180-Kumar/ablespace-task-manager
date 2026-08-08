'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import TaskForm from '@/components/TaskForm';
import { api, Task } from '@/lib/api';

export default function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadTask = async () => {
      try {
        const { id } = await params;
        setTaskId(id);
        const data = await api.tasks.findOne(id);
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task');
      } finally {
        setIsLoading(false);
      }
    };
    loadTask();
  }, [params]);

  const handleSubmit = async (data: import('@/lib/api').UpdateTaskDto) => {
    if (!taskId) return;
    await api.tasks.update(taskId, data);
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Task not found'}</div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Task</h1>
          <TaskForm onSubmit={handleSubmit} initialData={task} submitLabel="Update Task" />
        </main>
      </div>
    </AuthGuard>
  );
}
