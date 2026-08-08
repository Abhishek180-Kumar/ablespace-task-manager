'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import TaskList from '@/components/TaskList';
import { api, Task } from '@/lib/api';

export default function TrashPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDeletedTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.tasks.findDeleted();
      setTasks(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trash');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard async data-fetch-on-mount pattern
    loadDeletedTasks();
  }, []);

  const handleRestore = async (taskId: string) => {
    try {
      await api.tasks.restore(taskId);
      loadDeletedTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore task');
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trash</h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Deleted tasks are kept here until you restore them.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <TaskList tasks={tasks} onRestore={handleRestore} showRestore />
        )}
      </AppShell>
    </AuthGuard>
  );
}
