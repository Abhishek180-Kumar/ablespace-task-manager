'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ChevronDown,
  Check,
  Columns3,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  X,
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api, Task } from '@/lib/api';
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER, TaskPriority, TaskStatus } from '@/lib/taskMeta';

type FilterCategory = 'status' | 'priority' | 'members' | 'dueDate' | 'teams' | 'labels' | 'reporter';
const FILTER_CATEGORIES: FilterCategory[] = ['status', 'priority', 'members', 'dueDate', 'teams', 'labels', 'reporter'];
type ViewMode = 'board' | 'list';
type FieldKey = 'priority' | 'members' | 'dueDate' | 'labels' | 'status' | 'reporter';

const FIELD_LABELS: Record<FieldKey, string> = {
  priority: 'Priority',
  members: 'Members',
  dueDate: 'Due Date',
  labels: 'Labels',
  status: 'Status',
  reporter: 'Reporter',
};

function initialFields(): Record<FieldKey, boolean> {
  if (typeof window === 'undefined') {
    return { priority: true, members: true, dueDate: true, labels: false, status: false, reporter: false };
  }
  const stored = localStorage.getItem('task-visible-fields');
  return stored
    ? JSON.parse(stored)
    : { priority: true, members: true, dueDate: true, labels: false, status: false, reporter: false };
}

function formatDate(date?: string) {
  if (!date) return 'No date';
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

function initials(name?: string) {
  return (name || 'U').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function TaskActionMenu({ task, open, onToggle, onNavigate, onStatusChange, onDelete }: { task: Task; open: boolean; onToggle: (id: string) => void; onNavigate: (href: string) => void; onStatusChange: (id: string, status: Task['status']) => void; onDelete: (task: Task) => void }) {
  return (
    <div className="relative" data-dropdown>
      <button onClick={() => onToggle(task._id)} className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <button onClick={() => onNavigate(`/tasks/${task._id}`)} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800">View</button>
          <button onClick={() => onNavigate(`/tasks/${task._id}/edit`)} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800">Edit</button>
          <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
          <button onClick={() => onStatusChange(task._id, 'to-do')} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800">Mark as To Do</button>
          <button onClick={() => onStatusChange(task._id, 'doing')} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800">Mark as Doing</button>
          <button onClick={() => onStatusChange(task._id, 'completed')} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800">Mark as Completed</button>
          <button onClick={() => onStatusChange(task._id, 'on-hold')} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800">Mark as On Hold</button>
          <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
          <button onClick={() => onDelete(task)} className="block w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800">Delete</button>
        </div>
      )}
    </div>
  );
}

function PriorityText({ priority }: { priority: TaskPriority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.none;
  const color =
    priority === 'urgent' || priority === 'high'
      ? 'text-red-500'
      : priority === 'medium'
        ? 'text-orange-500'
        : 'text-gray-400';
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <span className="text-[10px]">▥</span>
      {meta.label}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => (typeof window === 'undefined' ? 'board' : (localStorage.getItem('task-view-mode') as ViewMode) || 'board'));
  const [fields, setFields] = useState(() => initialFields());
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<FilterCategory>('status');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [draftOpen, setDraftOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    status: 'to-do' as TaskStatus,
    priority: 'none' as TaskPriority,
    dueDate: '',
    tags: '',
  });

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setQuery(searchInput), 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchInput]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.tasks.findAll({ limit: 100 });
      setTasks(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial API load for the dashboard route
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    localStorage.setItem('task-visible-fields', JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem('task-view-mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!fieldsOpen && !filterOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setFieldsOpen(false);
        setFilterOpen(false);
        setActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [fieldsOpen, filterOpen]);

  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !normalized ||
        task.title.toLowerCase().includes(normalized) ||
        (task.description || '').toLowerCase().includes(normalized);
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, query, priorityFilter, statusFilter]);

  const updateTask = async (id: string, data: Partial<Task>) => {
    const previous = tasks;
    setTasks((current) => current.map((task) => (task._id === id ? { ...task, ...data } : task)));
    try {
      const updated = await api.tasks.update(id, data);
      setTasks((current) => current.map((task) => (task._id === id ? updated : task)));
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : 'Task update failed');
    }
  };

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    try {
      const created = await api.tasks.create({
        title: draft.title.trim(),
        description: draft.description.trim(),
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate || undefined,
        tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      setTasks((current) => [created, ...current]);
      setDraftOpen(false);
      setDraft({ title: '', description: '', status: 'to-do', priority: 'none', dueDate: '', tags: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const deleteTask = async () => {
    if (!deleteTarget) return;
    try {
      await api.tasks.remove(deleteTarget._id);
      setTasks((current) => current.filter((task) => task._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const Toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-[15px] font-semibold text-gray-950 dark:text-gray-50">Tasks</h1>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search"
            className="h-9 w-56 rounded-md border border-gray-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900"
          />
          {searchInput && (
            <button type="button" onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          )}
        </label>
        <div className="relative">
          <button onClick={() => setFieldsOpen((v) => !v)} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
            <Columns3 className="h-4 w-4" /> Fields
          </button>
          {fieldsOpen && (
            <div data-dropdown className="absolute right-0 z-20 mt-2 w-64 rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <div className="grid grid-cols-2 overflow-hidden rounded-md border border-gray-200 text-xs dark:border-gray-700">
                <button onClick={() => setViewMode('list')} className={`flex items-center justify-center gap-1 py-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}><List className="h-3.5 w-3.5" /> List</button>
                <button onClick={() => setViewMode('board')} className={`flex items-center justify-center gap-1 py-2 ${viewMode === 'board' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}><LayoutGrid className="h-3.5 w-3.5" /> Board</button>
              </div>
              <div className="mt-3 space-y-1">
                {(Object.keys(FIELD_LABELS) as FieldKey[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => setFields((current) => ({ ...current, [field]: !current[field] }))}
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {FIELD_LABELS[field]}
                    <span className={`h-4 w-4 rounded ${fields[field] ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}>{fields[field] && <Check className="h-4 w-4" />}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setFilterOpen((v) => !v); setActiveFilterCategory('status'); }} className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
            <Filter className="h-4 w-4" />
          </button>
          {filterOpen && (
            <div data-dropdown className="absolute right-0 z-20 mt-2 flex rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <div className="w-40 p-1.5 text-sm">
                {FILTER_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFilterCategory(category)}
                    className={`flex w-full items-center justify-between rounded px-2 py-2 text-left capitalize hover:bg-gray-100 dark:hover:bg-gray-800 ${activeFilterCategory === category ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  >
                    {category === 'dueDate' ? 'Due Date' : category}
                    <ChevronDown className="h-3 w-3 -rotate-90" />
                  </button>
                ))}
              </div>
              <div className="w-40 border-l border-gray-200 p-2 text-sm dark:border-gray-700">
                {activeFilterCategory === 'status' && (
                  <>
                    <button onClick={() => setStatusFilter('all')} className="flex w-full items-center justify-between rounded px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">All {statusFilter === 'all' && <Check className="h-4 w-4" />}</button>
                    {STATUS_ORDER.map((status) => (
                      <button key={status} onClick={() => setStatusFilter(status)} className="flex w-full items-center justify-between rounded px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                        {STATUS_META[status].label}
                        {statusFilter === status && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </>
                )}
                {activeFilterCategory === 'priority' && (
                  <>
                    <button onClick={() => setPriorityFilter('all')} className="flex w-full items-center justify-between rounded px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">All {priorityFilter === 'all' && <Check className="h-4 w-4" />}</button>
                    {PRIORITY_ORDER.map((priority) => (
                      <button key={priority} onClick={() => setPriorityFilter(priority)} className="flex w-full items-center justify-between rounded px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <PriorityText priority={priority} />
                        {priorityFilter === priority && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </>
                )}
                {(activeFilterCategory === 'members' || activeFilterCategory === 'teams' || activeFilterCategory === 'labels' || activeFilterCategory === 'reporter') && (
                  <div className="px-2 py-2 text-xs text-gray-500">Coming soon</div>
                )}
                {activeFilterCategory === 'dueDate' && (
                  <div className="px-2 py-2 text-xs text-gray-500">Use the task form due date field</div>
                )}
              </div>
            </div>
          )}
        </div>
        <button onClick={() => setDraftOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-gray-950 px-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6">
          {Toolbar}
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div>}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">No tasks found.</div>
          ) : viewMode === 'board' ? (
            <div className="overflow-x-auto pb-3">
              <div className="grid min-w-[980px] grid-cols-4 gap-4">
                {STATUS_ORDER.map((status) => {
                  const columnTasks = filteredTasks.filter((task) => task.status === status);
                  return (
                    <section
                      key={status}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        const taskId = event.dataTransfer.getData('text/plain');
                        if (taskId) updateTask(taskId, { status });
                      }}
                      className="rounded-md bg-gray-100 p-2 dark:bg-gray-800"
                    >
                      <div className="mb-2 flex items-center justify-between px-1 py-1">
                        <h2 className="text-xs font-semibold text-gray-900 dark:text-gray-100">{STATUS_META[status].label}</h2>
                        <span className="text-gray-500">+</span>
                      </div>
                      <div className="space-y-2">
                        {columnTasks.map((task) => (
                          <article key={task._id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', task._id)} className="rounded-md border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-950">
                            <div className="flex items-start justify-between gap-2">
                              <Link href={`/tasks/${task._id}`} className="text-sm font-medium text-gray-950 hover:text-accent dark:text-gray-50">{task.title}</Link>
                              <TaskActionMenu
                                task={task}
                                open={actionMenuId === task._id}
                                onToggle={(id) => setActionMenuId(actionMenuId === id ? null : id)}
                                onNavigate={(href) => { router.push(href); setActionMenuId(null); }}
                                onStatusChange={(id, status) => { updateTask(id, { status }); setActionMenuId(null); }}
                                onDelete={(t) => { setDeleteTarget(t); setActionMenuId(null); }}
                              />
                            </div>
                            {fields.members && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">{initials(task.owner?.name)}</span>
                                {task.owner?.name || 'Member'}
                              </div>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {fields.dueDate && task.dueDate && <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs text-red-500"><Calendar className="h-3 w-3" /> {formatDate(task.dueDate)}</span>}
                              {fields.priority && <PriorityText priority={task.priority as TaskPriority} />}
                            </div>
                            {fields.labels && task.tags?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {task.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800"><Tag className="h-3 w-3" />{tag}</span>)}
                              </div>
                            )}
                          </article>
                        ))}
                        <button onClick={() => { setDraft((current) => ({ ...current, status })); setDraftOpen(true); }} className="w-full rounded px-3 py-2 text-left text-xs hover:bg-white dark:hover:bg-gray-900">+ Add Task</button>
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              {STATUS_ORDER.map((status) => {
                const rows = filteredTasks.filter((task) => task.status === status);
                if (rows.length === 0) return null;
                return (
                  <section key={status} className="border-b border-gray-200 last:border-b-0 dark:border-gray-700">
                    <button className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm font-medium"><ChevronDown className="h-4 w-4" /> {STATUS_META[status].label}</button>
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <tr>
                          <th className="px-3 py-2">Task</th>
                          {fields.priority && <th className="px-3 py-2">Priority</th>}
                          {fields.members && <th className="px-3 py-2">Members</th>}
                          {fields.dueDate && <th className="px-3 py-2">Due Date</th>}
                          {fields.status && <th className="px-3 py-2">Status</th>}
                          <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((task) => (
                          <tr key={task._id} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="px-3 py-3"><Link href={`/tasks/${task._id}`} className="font-medium hover:text-accent">{task.title}</Link></td>
                            {fields.priority && <td className="px-3 py-3"><PriorityText priority={task.priority as TaskPriority} /></td>}
                            {fields.members && <td className="px-3 py-3"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">{initials(task.owner?.name)}</span></td>}
                            {fields.dueDate && <td className="px-3 py-3">{formatDate(task.dueDate)}</td>}
                            {fields.status && <td className="px-3 py-3">{STATUS_META[task.status as TaskStatus]?.label}</td>}
                            <td className="px-3 py-3 text-right">
                              <TaskActionMenu
                                task={task}
                                open={actionMenuId === task._id}
                                onToggle={(id) => setActionMenuId(actionMenuId === id ? null : id)}
                                onNavigate={(href) => { router.push(href); setActionMenuId(null); }}
                                onStatusChange={(id, status) => { updateTask(id, { status }); setActionMenuId(null); }}
                                onDelete={(t) => { setDeleteTarget(t); setActionMenuId(null); }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={() => { setDraft((current) => ({ ...current, status })); setDraftOpen(true); }} className="px-3 py-2 text-xs">+ Add Task</button>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <Modal open={draftOpen} onClose={() => setDraftOpen(false)} title="Add Task">
          <form onSubmit={createTask} className="space-y-3">
            <label className="block text-sm font-medium">Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" required /></label>
            <label className="block text-sm font-medium">Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" rows={3} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">{STATUS_ORDER.map((status) => <option key={status} value={status}>{STATUS_META[status].label}</option>)}</select></label>
              <label className="block text-sm font-medium">Priority<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskPriority })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">{PRIORITY_ORDER.map((priority) => <option key={priority} value={priority}>{PRIORITY_META[priority].label}</option>)}</select></label>
            </div>
            <label className="block text-sm font-medium">Due Date<input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" /></label>
            <label className="block text-sm font-medium">Labels<input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="Design, Deployment" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" /></label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDraftOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Cancel</button>
              <button type="submit" className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-950">Create</button>
            </div>
          </form>
        </Modal>

        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Task">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Move “{deleteTarget?.title}” to trash?</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteTarget(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Cancel</button>
            <button onClick={deleteTask} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
          </div>
        </Modal>
      </AppShell>
    </AuthGuard>
  );
}
