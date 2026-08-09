'use client';

import Link from 'next/link';
import { Task } from '@/lib/api';
import { X } from 'lucide-react';
import { STATUS_META, PRIORITY_META, STATUS_ORDER, TaskStatus } from '@/lib/taskMeta';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskBoard({ tasks, onStatusChange, onDelete }: TaskBoardProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onStatusChange) {
      onStatusChange(taskId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUS_ORDER.map((status) => {
        const colTasks = tasks.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 min-h-[200px]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {STATUS_META[status].label}
              </h3>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {colTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  className="bg-white dark:bg-gray-900 rounded-md shadow-sm p-3 cursor-grab active:cursor-grabbing border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                      href={`/tasks/${task._id}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                    >
                      {task.title}
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(task._id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs shrink-0"
                        aria-label="Delete task"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_META[task.priority].color}`}
                    >
                      {PRIORITY_META[task.priority].label}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {task.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {colTasks.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                  No tasks
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
