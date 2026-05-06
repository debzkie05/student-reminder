import { useEffect } from "react";
import { toast } from "sonner";
import { useTaskContext } from "@/contexts/TaskContext";
import { isPast, isToday } from "date-fns";

const SESSION_KEY = "taskflow_login_toast_shown";

/**
 * Fires a summary toast notification once per session on the first dashboard mount.
 * Uses sessionStorage to avoid re-firing on page navigations.
 */
export function useLoginNotification() {
  const { tasks } = useTaskContext();

  useEffect(() => {
    // Only fire once per session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Small delay so the dashboard renders first
    const timer = setTimeout(() => {
      const overdueTasks = tasks.filter(
        (t) =>
          t.status !== "completed" &&
          isPast(new Date(t.dueDate)) &&
          !isToday(new Date(t.dueDate))
      );

      const todayTasks = tasks.filter(
        (t) => t.status !== "completed" && isToday(new Date(t.dueDate))
      );

      const pendingTasks = tasks.filter((t) => t.status !== "completed");

      if (overdueTasks.length > 0) {
        toast.error("Overdue Tasks", {
          description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""} that need${overdueTasks.length === 1 ? "s" : ""} attention!`,
          duration: 5000,
        });
      } else if (todayTasks.length > 0) {
        toast.warning("Tasks Due Today", {
          description: `You have ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} due today. Stay focused!`,
          duration: 5000,
        });
      } else if (pendingTasks.length > 0) {
        toast.info("Welcome back!", {
          description: `You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? "s" : ""}. Keep up the great work!`,
          duration: 4000,
        });
      } else {
        toast.success("You're all caught up!", {
          description: "No pending tasks. Enjoy your free time! 🎉",
          duration: 4000,
        });
      }

      sessionStorage.setItem(SESSION_KEY, "true");
    }, 800);

    return () => clearTimeout(timer);
  }, [tasks]);
}
