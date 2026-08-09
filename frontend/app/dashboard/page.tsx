'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import TaskList from '@/components/TaskList';
import TaskBoard from '@/components/TaskBoard';
import TaskForm from '@/components/TaskForm';
import { api, Task, QueryTaskDto } from '@/lib/api';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<QueryTaskDto>({ page: 1, limit: 10 });
  const [view, setView] = useState<'list' | 'board'>('list');

  const loadTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.tasks.findAll(filters);
      setTasks(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/change
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.status, filters.priority]);

  const handleCreateTask = async (data: { title: string; description?: string; status?: string; priority?: string; dueDate?: string; tags?: string[] }) => {
    await api.tasks.create(data);
    setShowForm(false);
    loadTasks();
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await api.tasks.update(taskId, { status });
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.tasks.remove(taskId);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <div className="flex items-center gap-3">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-sm font-medium ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView('board')}
                className={`px-3 py-1.5 text-sm font-medium border-l border-gray-300 dark:border-gray-600 ${
                  view === 'board'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Board
              </button>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'New Task'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6">
            <TaskForm onSubmit={handleCreateTask} submitLabel="Create Task" />
          </div>
        )}

        <div className="mb-4 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {view === 'list' ? (
              <TaskList tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} />
            ) : (
              <TaskBoard tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} />
            )}

            {view === 'list' && meta && meta.totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => goToPage(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => goToPage(meta.page + 1)}
                  disabled={meta.page === meta.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </AppShell>
    </AuthGuard>
  );
}
