export const STATUS_META = {
  'to-do': { label: 'To Do', color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  'doing': { label: 'Doing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
};

export const PRIORITY_META = {
  'none': { label: 'No Priority', color: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  'low': { label: 'Low', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  'medium': { label: 'Medium', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
  'high': { label: 'High', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
  'urgent': { label: 'Urgent', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
};

export const STATUS_ORDER = ['to-do', 'doing', 'on-hold', 'completed'];
export const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low', 'none'];
