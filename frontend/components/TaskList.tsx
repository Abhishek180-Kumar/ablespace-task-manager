'use client';

import Link from 'next/link';
import { Task } from '@/lib/api';
import { STATUS_META, PRIORITY_META, STATUS_ORDER } from '@/lib/taskMeta';

interface TaskListProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (taskId: string) => void;
  onRestore?: (taskId: string) => void;
  showRestore?: boolean;
}

export default function TaskList({ tasks, onStatusChange, onDelete, onRestore, showRestore = false }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">No tasks found.</div>;
  }

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-6">
      {STATUS_ORDER.map(status => {
        if (!grouped[status] || grouped[status].length === 0) return null;
        return (
          <div key={status}>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {STATUS_META[status].label} ({grouped[status].length})
            </h3>
            <div className="space-y-2">
              {grouped[status].map(task => (
                <div key={task._id} className="p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-800 bg-white flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={showRestore ? '#' : `/tasks/${task._id}/edit`} className="block">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-500">{task.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{task.description || 'No description'}</p>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_META[task.priority].color}`}>
                      {PRIORITY_META[task.priority].label}
                    </span>
                    {!showRestore && onStatusChange && (
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task._id, e.target.value as Task['status'])}
                        className="text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-1"
                      >
                        {Object.entries(STATUS_META).map(([val, meta]) => (
                          <option key={val} value={val}>{meta.label}</option>
                        ))}
                      </select>
                    )}
                    {showRestore && onRestore && (
                      <button onClick={() => onRestore(task._id)} className="text-xs text-blue-500 hover:text-blue-700">Restore</button>
                    )}
                    {!showRestore && onDelete && (
                      <button onClick={() => onDelete(task._id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
