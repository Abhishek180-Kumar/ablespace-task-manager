'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ListFilter } from 'lucide-react';
import { Task } from '@/lib/api';
import { STATUS_META, PRIORITY_META } from '@/lib/taskMeta';

interface TaskListProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (taskId: string) => void;
  onRestore?: (taskId: string) => void;
  showRestore?: boolean;
}

type FieldKey = 'priority' | 'members' | 'dueDate' | 'labels' | 'status' | 'reporter';

const FIELD_LABELS: Record<FieldKey, string> = {
  priority: 'Priority',
  members: 'Members',
  dueDate: 'Due Date',
  labels: 'Labels',
  status: 'Status',
  reporter: 'Reporter',
};

const DEFAULT_FIELDS: Record<FieldKey, boolean> = {
  priority: true,
  members: true,
  dueDate: true,
  labels: true,
  status: true,
  reporter: false,
};

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function TaskList({ tasks, onStatusChange, onDelete, onRestore, showRestore = false }: TaskListProps) {
  const [fields, setFields] = useState<Record<FieldKey, boolean>>(DEFAULT_FIELDS);
  const [fieldsOpen, setFieldsOpen] = useState(false);

  if (!tasks || tasks.length === 0) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">No tasks found.</div>;
  }

  const toggleField = (key: FieldKey) => {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      <div className="relative flex justify-end">
        <button
          type="button"
          onClick={() => setFieldsOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ListFilter className="h-3.5 w-3.5" /> Fields
        </button>
        {fieldsOpen && (
          <div className="absolute right-0 top-9 z-10 w-44 rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {(Object.keys(FIELD_LABELS) as FieldKey[]).map((key) => (
              <label key={key} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={fields[key]}
                  onChange={() => toggleField(key)}
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                {FIELD_LABELS[key]}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Title</th>
              {fields.status && <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>}
              {fields.priority && <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Priority</th>}
              {fields.members && <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Members</th>}
              {fields.dueDate && <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Due Date</th>}
              {fields.labels && <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Labels</th>}
              {fields.reporter && <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Reporter</th>}
              <th className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 max-w-xs">
                  <Link href={showRestore ? '#' : `/tasks/${task._id}/edit`} className="block">
                    <div className="truncate font-medium text-gray-900 hover:text-blue-500 dark:text-white">{task.title}</div>
                    <div className="truncate text-xs text-gray-500 dark:text-gray-400">{task.description || 'No description'}</div>
                  </Link>
                </td>
                {fields.status && (
                  <td className="px-4 py-3">
                    {!showRestore && onStatusChange ? (
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task._id, e.target.value as Task['status'])}
                        className="rounded border-gray-300 bg-transparent text-xs dark:border-gray-600 dark:text-white"
                      >
                        {Object.entries(STATUS_META).map(([val, meta]) => (
                          <option key={val} value={val}>{meta.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`rounded-full px-2 py-1 text-xs ${STATUS_META[task.status].color}`}>{STATUS_META[task.status].label}</span>
                    )}
                  </td>
                )}
                {fields.priority && (
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${PRIORITY_META[task.priority].color}`}>{PRIORITY_META[task.priority].label}</span>
                  </td>
                )}
                {fields.members && (
                  <td className="px-4 py-3">
                    {task.members && task.members.length > 0 ? (
                      <div className="flex -space-x-1.5">
                        {task.members.slice(0, 4).map((m, i) => (
                          <span
                            key={`${m}-${i}`}
                            title={m}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-accent text-[10px] font-semibold text-white dark:border-gray-900"
                          >
                            {initials(m)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                )}
                {fields.dueDate && (
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </td>
                )}
                {fields.labels && (
                  <td className="px-4 py-3">
                    {task.tags && task.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((t) => (
                          <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">{t}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                )}
                {fields.reporter && (
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{task.reporter || '—'}</td>
                )}
                <td className="px-4 py-3 text-right">
                  {showRestore && onRestore && (
                    <button onClick={() => onRestore(task._id)} className="text-xs text-blue-500 hover:text-blue-700">Restore</button>
                  )}
                  {!showRestore && onDelete && (
                    <button onClick={() => onDelete(task._id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
