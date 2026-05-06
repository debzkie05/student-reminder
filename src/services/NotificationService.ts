/**
 * NotificationService
 *
 * This module structures email notification logic. Currently it logs to console
 * as a stub. When Firebase is connected, replace the send function with a
 * Firebase Cloud Function call (e.g., via httpsCallable).
 *
 * To integrate with Firebase:
 * 1. Create a Cloud Function `sendTaskNotification`
 * 2. Use SendGrid / Mailgun / Firebase Email Extension
 * 3. Replace `sendNotificationEmail()` with:
 *    const fn = httpsCallable(functions, 'sendTaskNotification');
 *    await fn(payload);
 */

import type { Task, Category } from "@/types/task";

export type EmailFrequency = "daily" | "weekly" | "both";

export interface NotificationPreferences {
  emailEnabled: boolean;
  frequency: EmailFrequency;
  preferredTime: string; // "07:00", "08:00", etc.
  includeOverdue: boolean;
  includeDueToday: boolean;
  includeDueThisWeek: boolean;
  includeProgressSummary: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  emailEnabled: false,
  frequency: "daily",
  preferredTime: "07:00",
  includeOverdue: true,
  includeDueToday: true,
  includeDueThisWeek: true,
  includeProgressSummary: true,
};

export interface EmailPayload {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type: "daily_digest" | "weekly_summary" | "overdue_alert";
  tasks: {
    overdue: Task[];
    dueToday: Task[];
    dueThisWeek: Task[];
  };
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  categories: Category[];
}

/**
 * Build the email payload from current task state.
 */
export function buildEmailPayload(
  type: EmailPayload["type"],
  recipientEmail: string,
  recipientName: string,
  tasks: Task[],
  categories: Category[],
  preferences: NotificationPreferences
): EmailPayload {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const overdue = preferences.includeOverdue
    ? tasks.filter(
        (t) => t.status !== "completed" && new Date(t.dueDate) < today
      )
    : [];

  const dueToday = preferences.includeDueToday
    ? tasks.filter((t) => {
        const d = new Date(t.dueDate);
        return (
          t.status !== "completed" &&
          d >= today &&
          d < new Date(today.getTime() + 24 * 60 * 60 * 1000)
        );
      })
    : [];

  const dueThisWeek = preferences.includeDueThisWeek
    ? tasks.filter((t) => {
        const d = new Date(t.dueDate);
        return (
          t.status !== "completed" &&
          d > new Date(today.getTime() + 24 * 60 * 60 * 1000) &&
          d <= weekEnd
        );
      })
    : [];

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const subjects: Record<EmailPayload["type"], string> = {
    daily_digest: `📚 TaskFlow Daily Digest — ${overdue.length > 0 ? `${overdue.length} overdue!` : `${dueToday.length} due today`}`,
    weekly_summary: `📊 TaskFlow Weekly Summary — ${completed}/${total} completed`,
    overdue_alert: `🚨 ${overdue.length} Overdue Task${overdue.length > 1 ? "s" : ""} Need Attention`,
  };

  return {
    recipientEmail,
    recipientName,
    subject: subjects[type],
    type,
    tasks: { overdue, dueToday, dueThisWeek },
    categories,
    stats: {
      total,
      completed,
      pending: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
  };
}

/**
 * Send notification email.
 *
 * STUB: Currently logs to console.
 * Replace with Firebase Cloud Function call when ready.
 */
export async function sendNotificationEmail(
  payload: EmailPayload
): Promise<{ success: boolean; message: string }> {
  // TODO: Replace with Firebase Cloud Function call
  // Example:
  // const functions = getFunctions();
  // const sendEmail = httpsCallable(functions, 'sendTaskNotification');
  // const result = await sendEmail(payload);
  // return result.data;

  console.log("📧 [NotificationService] Email would be sent:", {
    to: payload.recipientEmail,
    subject: payload.subject,
    type: payload.type,
    overdueTasks: payload.tasks.overdue.length,
    todayTasks: payload.tasks.dueToday.length,
    weekTasks: payload.tasks.dueThisWeek.length,
  });

  return {
    success: true,
    message: "Email notification logged (Firebase not connected yet)",
  };
}
