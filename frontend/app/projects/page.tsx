'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api, Project } from '@/lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.projects.findAll({ page, limit: 10 });
      setProjects(response.data);
      setMeta(response.meta);
    } catch {
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/change
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (id: string) => {
    try {
      await api.projects.remove(id);
      setDeleteTarget(null);
      loadProjects();
    } catch {
      setError('Failed to delete project');
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <Link
              href="/projects/new"
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-hover"
            >
              New Project
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No projects yet. Create your first project to get started.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div key={project._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="flex-1">
                    <Link href={`/projects/${project._id}/edit`} className="block">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600">{project.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {project.status}
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/projects/${project._id}/edit`} className="text-xs text-blue-500 hover:text-blue-700">Edit</Link>
                      <button onClick={() => setDeleteTarget(project._id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page === meta.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                Next
              </button>
            </div>
          )}

          <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:text-white">Cancel</button>
              <button onClick={() => deleteTarget && handleDelete(deleteTarget)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </Modal>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
