'use client';

import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import TaskForm from '@/components/TaskForm';
import { api } from '@/lib/api';

export default function NewTaskPage() {
  const router = useRouter();

  const handleSubmit = async (data: { title: string; description?: string; status?: string; priority?: string; dueDate?: string; tags?: string[] }) => {
    await api.tasks.create(data);
    router.push('/dashboard');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Task</h1>
          <TaskForm onSubmit={handleSubmit} submitLabel="Create Task" />
        </main>
      </div>
    </AuthGuard>
  );
}
