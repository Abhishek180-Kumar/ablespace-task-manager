'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api, Task, UpdateTaskDto } from '@/lib/api';
import { STATUS_META, PRIORITY_META } from '@/lib/taskMeta';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subtaskText, setSubtaskText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.tasks.findOne(id);
      setTask(data);
    } catch {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/change
    loadTask();
  }, [loadTask]);

  const addSubtask = async () => {
    if (!subtaskText.trim() || !task) return;
    const updated = await api.tasks.update(task._id, {
      subtasks: [...(task.subtasks || []), { title: subtaskText, completed: false }],
    } as UpdateTaskDto);
    setTask(updated as Task);
    setSubtaskText('');
  };

  const toggleSubtask = async (index: number) => {
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).map((st, i) => (i === index ? { ...st, completed: !st.completed } : st));
    const updated = await api.tasks.update(task._id, { subtasks: updatedSubtasks } as UpdateTaskDto);
    setTask(updated as Task);
  };

  const addComment = async () => {
    if (!commentText.trim() || !task) return;
    const updated = await api.tasks.update(task._id, {
      comments: [...(task.comments || []), { userId: '', text: commentText, createdAt: new Date().toISOString() }],
    } as UpdateTaskDto);
    setTask(updated as Task);
    setCommentText('');
  };

  const handleDelete = async () => {
    try {
      await api.tasks.remove(task!._id);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  if (!task) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Task not found.</div>
        </AppShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description || 'No description'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/tasks/${task._id}/edit`)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_META[task.status as keyof typeof STATUS_META]?.color || 'bg-gray-100'}`}>
                {STATUS_META[task.status as keyof typeof STATUS_META]?.label || task.status}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Priority</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_META[task.priority as keyof typeof PRIORITY_META]?.color || 'bg-gray-100'}`}>
                {PRIORITY_META[task.priority as keyof typeof PRIORITY_META]?.label || task.priority}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Due Date</h3>
              <p className="text-sm text-gray-900 dark:text-white">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Created</h3>
              <p className="text-sm text-gray-900 dark:text-white">{new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Subtasks</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              {(task.subtasks || []).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No subtasks yet.</p>
              )}
              <div className="space-y-2 mb-3">
                {(task.subtasks || []).map((st, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(idx)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${st.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{st.title}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subtaskText}
                  onChange={(e) => setSubtaskText(e.target.value)}
                  placeholder="Add subtask..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
                <button onClick={addSubtask} className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent-hover">Add</button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Comments / Activity</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              {(task.comments || []).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No comments yet.</p>
              )}
              <div className="space-y-3 mb-3">
                {(task.comments || []).map((c, idx) => (
                  <div key={idx} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                    <p className="text-sm text-gray-900 dark:text-white">{c.text}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
                <button onClick={addComment} className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent-hover">Add</button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Task">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete this task?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:text-white">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </Modal>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
