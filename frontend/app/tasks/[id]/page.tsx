'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import DatePicker from '@/components/DatePicker';
import { api, Task } from '@/lib/api';
import { STATUS_META, PRIORITY_META, STATUS_ORDER, PRIORITY_ORDER } from '@/lib/taskMeta';
import { ChevronDown, Plus, Trash2, Link as LinkIcon } from 'lucide-react';

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
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [resourceDraft, setResourceDraft] = useState({ title: '', url: '', description: '' });

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/change
    setLoading(true);
    setError('');
    api.tasks.findOne(id)
      .then((data) => {
        if (!cancelled) setTask(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load task');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const updateTask = async (data: Partial<Task>) => {
    if (!task) return;
    const updated = await api.tasks.update(task._id, data);
    setTask(updated);
  };

  const addSubtask = async () => {
    if (!subtaskText.trim() || !task) return;
    const updatedSubtasks = [...(task.subtasks || []), { title: subtaskText, completed: false }];
    await updateTask({ subtasks: updatedSubtasks } as Partial<Task>);
    setSubtaskText('');
  };

  const toggleSubtask = async (index: number) => {
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).map((st, i) => (i === index ? { ...st, completed: !st.completed } : st));
    await updateTask({ subtasks: updatedSubtasks } as Partial<Task>);
  };

  const deleteSubtask = async (index: number) => {
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).filter((_, i) => i !== index);
    await updateTask({ subtasks: updatedSubtasks } as Partial<Task>);
  };

  const addComment = async () => {
    if (!commentText.trim() || !task) return;
    const updatedComments = [...(task.comments || []), { userId: '', text: commentText, createdAt: new Date().toISOString() }];
    await updateTask({ comments: updatedComments } as Partial<Task>);
    setCommentText('');
  };

  const addResource = async () => {
    if (!resourceDraft.title.trim() || !resourceDraft.url.trim() || !task) return;
    const updatedResources = [...(task.resources || []), { ...resourceDraft }];
    await updateTask({ resources: updatedResources } as Partial<Task>);
    setResourceDraft({ title: '', url: '', description: '' });
    setResourceOpen(false);
  };

  const deleteResource = async (index: number) => {
    if (!task) return;
    const updatedResources = (task.resources || []).filter((_, i) => i !== index);
    await updateTask({ resources: updatedResources } as Partial<Task>);
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{task.title}</h1>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Subtasks</h3>
                {(task.subtasks || []).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No subtasks yet.</p>
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
                      <span className={`flex-1 text-sm ${st.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{st.title}</span>
                      <button onClick={() => deleteSubtask(idx)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                  />
                  <button onClick={addSubtask} className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent-hover">Add</button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Resources</h3>
                {(task.resources || []).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No resources yet.</p>
                )}
                <div className="space-y-2 mb-3">
                  {(task.resources || []).map((res, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 rounded-md border border-gray-100 p-2 dark:border-gray-700">
                      <div className="min-w-0">
                        <a href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-accent hover:underline truncate">
                          <LinkIcon className="h-4 w-4 shrink-0" /> {res.title}
                        </a>
                        {res.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{res.description}</p>}
                      </div>
                      <button onClick={() => deleteResource(idx)} className="text-gray-400 hover:text-red-600 shrink-0"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                {resourceOpen ? (
                  <form onSubmit={(e) => { e.preventDefault(); addResource(); }} className="space-y-2">
                    <input value={resourceDraft.title} onChange={(e) => setResourceDraft({ ...resourceDraft, title: e.target.value })} placeholder="Title" className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" required />
                    <input value={resourceDraft.url} onChange={(e) => setResourceDraft({ ...resourceDraft, url: e.target.value })} placeholder="https://..." className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" required />
                    <input value={resourceDraft.description} onChange={(e) => setResourceDraft({ ...resourceDraft, description: e.target.value })} placeholder="Description (optional)" className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" />
                    <div className="flex gap-2">
                      <button type="submit" className="px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-accent-hover">Save</button>
                      <button type="button" onClick={() => setResourceOpen(false)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md dark:border-gray-600">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setResourceOpen(true)} className="inline-flex items-center gap-2 text-sm text-accent hover:underline"><Plus className="h-4 w-4" /> Add resource</button>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Comments / Activity</h3>
                {(task.comments || []).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No comments yet.</p>
                )}
                <div className="space-y-3 mb-3">
                  {(task.comments || []).map((c, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-2 last:border-0 dark:border-gray-700">
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
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addComment(); } }}
                  />
                  <button onClick={addComment} className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent-hover">Add</button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Status</h3>
                <div className="relative">
                  <button onClick={() => { setStatusOpen((v) => !v); setPriorityOpen(false); }} className="inline-flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_META[task.status as keyof typeof STATUS_META]?.color || 'bg-gray-100'}`}>
                      {STATUS_META[task.status as keyof typeof STATUS_META]?.label || task.status}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {statusOpen && (
                    <div className="absolute left-0 right-0 z-20 mt-1 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {STATUS_ORDER.map((s) => (
                        <button key={s} onClick={() => { updateTask({ status: s }); setStatusOpen(false); }} className={`flex w-full items-center rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${task.status === s ? 'font-medium' : ''}`}>
                          {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Priority</h3>
                <div className="relative">
                  <button onClick={() => { setPriorityOpen((v) => !v); setStatusOpen(false); }} className="inline-flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_META[task.priority as keyof typeof PRIORITY_META]?.color || 'bg-gray-100'}`}>
                      {PRIORITY_META[task.priority as keyof typeof PRIORITY_META]?.label || task.priority}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {priorityOpen && (
                    <div className="absolute left-0 right-0 z-20 mt-1 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {PRIORITY_ORDER.map((p) => (
                        <button key={p} onClick={() => { updateTask({ priority: p }); setPriorityOpen(false); }} className={`flex w-full items-center rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${task.priority === p ? 'font-medium' : ''}`}>
                          {PRIORITY_META[p].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Dates</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                    <DatePicker
                      value={task.dueDate}
                      onChange={(value) => updateTask({ dueDate: value || undefined })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Members</h3>
                <p className="text-sm text-gray-900 dark:text-white">{task.owner?.name || 'Unassigned'}</p>
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
