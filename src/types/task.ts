export type Priority = "high" | "medium" | "low";

export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  userId?: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: Priority;
  status: TaskStatus;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId?: string;
  attachments?: Attachment[];
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}
