export const CHAT_EVALUATION_STATUSES = {
  PENDING: 'Pending',
  PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

export const CHAT_MESSAGE_STATUSES = [
  { status: 'CORRECT', label: 'Correct', icon: 'chat-check-line' },
  { status: 'INCORRECT', label: 'Incorrect', icon: 'chat-delete-line' },
];

export const CHAT_MESSAGE_SUPPORT_STATUSES = [
  { status: 'SUPPORTED', label: 'Supported', icon: 'chat-check-fill' },
  { status: 'NOT_SUPPORTED', label: 'Not supported', icon: 'chat-delete-fill' },
];
