import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { EmptyState } from "@/components/common/EmptyState";
import { NotificationBanners } from "@/components/dashboard/NotificationBanners";
import { useTaskContext } from "@/contexts/TaskContext";
import { useLoginNotification } from "@/hooks/useLoginNotification";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/types/task";
import { isPast, isToday, isTomorrow, isThisWeek } from "date-fns";

export default function Dashboard() {
  const { tasks, categories, stats, toggleTaskComplete, deleteTask, getCategoryById, isLoading } =
    useTaskContext();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fire login notification toast once per session
  useLoginNotification();

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  // Get upcoming tasks (not completed, sorted by due date)
  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Get overdue tasks
  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
  );

  // Get today's tasks
  const todayTasks = tasks.filter((t) => isToday(new Date(t.dueDate)));

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setTaskFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setTaskFormOpen(open);
    if (!open) setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full rounded-xl lg:col-span-1" />
          <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl mt-6" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your task overview."
        action={
          <Button onClick={() => setTaskFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Tasks"
          value={stats.total}
          icon={CheckCircle2}
          variant="primary"
        />
        <StatsCard
          title="Due Today"
          value={stats.dueToday}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatsCard
          title="This Week"
          value={stats.dueThisWeek}
          icon={Calendar}
          variant="default"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress Section */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Progress Overview
          </h2>
          <div className="flex flex-col items-center">
            <ProgressRing progress={completionRate} size={140} />
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {stats.completed}/{stats.total}
              </p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="flex gap-4 mt-4 w-full">
              <div className="flex-1 text-center p-3 bg-success/10 rounded-lg">
                <p className="text-lg font-semibold text-success">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="flex-1 text-center p-3 bg-warning/10 rounded-lg">
                <p className="text-lg font-semibold text-warning">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Upcoming Tasks</h2>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {upcomingTasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No upcoming tasks"
              description="You're all caught up! Add a new task to get started."
              actionLabel="Add Task"
              onAction={() => setTaskFormOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`animate-slide-up stagger-${Math.min(index + 1, 5)}`}
                  style={{ opacity: 0, animationFillMode: "forwards" }}
                >
                  <TaskCard
                    task={task}
                    category={getCategoryById(task.categoryId)}
                    onToggleComplete={toggleTaskComplete}
                    onEdit={handleEdit}
                    onDelete={deleteTask}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Notification Banners — Overdue, Today, Tomorrow, This Week */}
      <NotificationBanners />

      {/* Category Progress */}
      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-lg mb-4">Tasks by Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const categoryTasks = tasks.filter((t) => t.categoryId === category.id);
            const completed = categoryTasks.filter(
              (t) => t.status === "completed"
            ).length;
            const total = categoryTasks.length;

            return (
              <Link
                key={category.id}
                to={`/categories?id=${category.id}`}
                className="group"
              >
                <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all">
                  <div
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <p className="font-medium text-sm text-foreground truncate">
                    {category.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completed}/{total} tasks
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Task Form Modal */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={handleCloseForm}
        task={selectedTask}
      />
    </div>
  );
}
