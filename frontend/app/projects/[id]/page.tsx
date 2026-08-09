'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import Modal from '@/components/Modal';
import { api, Project } from '@/lib/api';
import { PRIORITY_META, TaskPriority } from '@/lib/taskMeta';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.projects.findOne(id);
        setProject(data);
      } catch {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.projects.remove(id);
      router.push('/projects');
    } catch {
      setError('Failed to delete project');
    } finally {
      setDeleteOpen(false);
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

  if (!project) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Project not found.</div>
        </AppShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><ArrowLeft className="h-5 w-5" /></button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{project.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push(`/projects/${project._id}/edit`)} className="px-4 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Edit</button>
              <button onClick={() => setDeleteOpen(true)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Priority</h3>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_META[(project.priority as TaskPriority) || 'none']?.color || 'bg-gray-100'}`}>
                {PRIORITY_META[(project.priority as TaskPriority) || 'none']?.label || project.priority}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Lead</h3>
              <p className="text-sm text-gray-900 dark:text-white">{project.lead || 'Unassigned'}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Due Date</h3>
              <p className="text-sm text-gray-900 dark:text-white">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Project">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Delete &quot;{project.name}&quot;? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:text-white">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </Modal>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
