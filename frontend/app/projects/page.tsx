'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Check, Columns3, Filter, MoreHorizontal, Plus, Search, UserRound } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api, Project } from '@/lib/api';
import { PRIORITY_META, PRIORITY_ORDER, TaskPriority } from '@/lib/taskMeta';

function formatDate(date?: string) {
  if (!date) return 'No date';
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

function PriorityText({ priority }: { priority: TaskPriority }) {
  const color =
    priority === 'urgent' || priority === 'high'
      ? 'text-red-500'
      : priority === 'medium'
        ? 'text-orange-500'
        : 'text-gray-400';
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <span className="text-[10px]">▥</span>
      {PRIORITY_META[priority]?.label || priority}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleFields, setVisibleFields] = useState(() => ({
    priority: true,
    lead: true,
    dueDate: true,
    status: false,
  }));
  const [draftOpen, setDraftOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    priority: 'none' as TaskPriority,
    lead: '',
    dueDate: '',
  });

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.projects.findAll({ limit: 100 });
      setProjects(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial API load for the projects route
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !normalized ||
        project.name.toLowerCase().includes(normalized) ||
        (project.description || '').toLowerCase().includes(normalized);
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [projects, search, priorityFilter]);

  const createProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    try {
      const created = await api.projects.create({
        name: draft.name.trim(),
        description: draft.description.trim(),
        priority: draft.priority,
        lead: draft.lead.trim(),
        dueDate: draft.dueDate || undefined,
      });
      setProjects((current) => [created, ...current]);
      setDraftOpen(false);
      setDraft({ name: '', description: '', priority: 'none', lead: '', dueDate: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const deleteProject = async () => {
    if (!deleteTarget) return;
    try {
      await api.projects.remove(deleteTarget._id);
      setProjects((current) => current.filter((project) => project._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-[15px] font-semibold text-gray-950 dark:text-gray-50">Projects</h1>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="h-9 w-56 rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
              <div className="relative">
                <button onClick={() => setFieldsOpen((v) => !v)} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                  <Columns3 className="h-4 w-4" /> Fields
                </button>
                {fieldsOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    {Object.entries({ priority: 'Priority', lead: 'Lead', dueDate: 'Due Date', status: 'Status' }).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setVisibleFields((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))}
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {label}
                        <span className={`h-4 w-4 rounded ${visibleFields[key as keyof typeof visibleFields] ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {visibleFields[key as keyof typeof visibleFields] && <Check className="h-4 w-4" />}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setFilterOpen((v) => !v)} className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                  <Filter className="h-4 w-4" />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 z-20 mt-2 flex rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <div className="w-40 p-2 text-sm">
                      <div className="rounded bg-gray-100 px-2 py-2 dark:bg-gray-800">Priority</div>
                      <div className="px-2 py-2 text-gray-500">Status</div>
                      <div className="px-2 py-2 text-gray-500">Members</div>
                      <div className="px-2 py-2 text-gray-500">Due Date</div>
                    </div>
                    <div className="w-40 border-l border-gray-200 p-2 text-sm dark:border-gray-700">
                      <button onClick={() => setPriorityFilter('all')} className="flex w-full items-center justify-between rounded px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">No filter {priorityFilter === 'all' && <Check className="h-4 w-4" />}</button>
                      {PRIORITY_ORDER.map((priority) => (
                        <button key={priority} onClick={() => setPriorityFilter(priority)} className="flex w-full items-center justify-between rounded px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <PriorityText priority={priority} />
                          {priorityFilter === priority && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setDraftOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-gray-950 px-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
                <Plus className="h-4 w-4" /> Add Project
              </button>
            </div>
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div>}

          {loading ? (
            <div className="h-48 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">No projects yet. Create your first project to get started.</div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-gray-50 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  <tr>
                    <th className="px-3 py-3">Projects</th>
                    {visibleFields.priority && <th className="px-3 py-3">Priority</th>}
                    {visibleFields.lead && <th className="px-3 py-3">Lead</th>}
                    {visibleFields.dueDate && <th className="px-3 py-3">Due Date</th>}
                    {visibleFields.status && <th className="px-3 py-3">Status</th>}
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-3">
                        <Link href={`/projects/${project._id}/edit`} className="font-medium hover:text-accent">{project.name}</Link>
                      </td>
                      {visibleFields.priority && <td className="px-3 py-3"><PriorityText priority={(project.priority || 'none') as TaskPriority} /></td>}
                      {visibleFields.lead && <td className="px-3 py-3"><span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-gray-400" />{project.lead || 'Unassigned'}</span></td>}
                      {visibleFields.dueDate && <td className="px-3 py-3"><span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" />{formatDate(project.dueDate)}</span></td>}
                      {visibleFields.status && <td className="px-3 py-3 capitalize">{project.status}</td>}
                      <td className="px-3 py-3 text-right">
                        <button onClick={() => setDeleteTarget(project)} aria-label="Delete project"><MoreHorizontal className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal open={draftOpen} onClose={() => setDraftOpen(false)} title="Add Project">
          <form onSubmit={createProject} className="space-y-3">
            <label className="block text-sm font-medium">Name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" required /></label>
            <label className="block text-sm font-medium">Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" rows={3} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Priority<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskPriority })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">{PRIORITY_ORDER.map((priority) => <option key={priority} value={priority}>{PRIORITY_META[priority].label}</option>)}</select></label>
              <label className="block text-sm font-medium">Due Date<input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" /></label>
            </div>
            <label className="block text-sm font-medium">Lead<input value={draft.lead} onChange={(event) => setDraft({ ...draft, lead: event.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" /></label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDraftOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Cancel</button>
              <button type="submit" className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-950">Create</button>
            </div>
          </form>
        </Modal>

        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Delete “{deleteTarget?.name}”? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteTarget(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Cancel</button>
            <button onClick={deleteProject} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
          </div>
        </Modal>
      </AppShell>
    </AuthGuard>
  );
}
