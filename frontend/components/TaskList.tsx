'use client';

import { Task } from '@/lib/api';
import Link from 'next/link';

interface TaskListProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (taskId: string) => void;
  onRestore?: (taskId: string) => void;
  showRestore?: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function TaskList({ tasks, onStatusChange, onDelete, onRestore, showRestore = false }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md dark:bg-gray-800">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <li key={task._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/tasks/${task._id}/edit`}
                      className="text-sm font-medium text-blue-600 truncate dark:text-blue-400 hover:text-blue-800"
                    >
                      {task.title}
                    </Link>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100'}`}>
                      {task.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority] || 'bg-gray-100'}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{task.description}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    {task.tags.length > 0 && (
                      <div className="flex gap-1">
                        {task.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {onStatusChange && !showRestore && (
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task._id, e.target.value as Task['status'])}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                  {showRestore && onRestore && (
                    <button
                      onClick={() => onRestore(task._id)}
                      className="text-sm text-green-600 hover:text-green-800 dark:text-green-400"
                    >
                      Restore
                    </button>
                  )}
                  {onDelete && !showRestore && (
                    <button
                      onClick={() => onDelete(task._id)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
