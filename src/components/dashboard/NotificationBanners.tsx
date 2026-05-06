import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CalendarClock,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import { isPast, isToday, isTomorrow, isThisWeek, format } from "date-fns";
import type { Task } from "@/types/task";

interface BannerConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  iconBgClass: string;
  borderClass: string;
  btnVariant: "destructive" | "default" | "outline" | "secondary";
  filterPath: string;
  tasks: Task[];
  message: (count: number) => string;
}

export function NotificationBanners() {
  const { tasks, getCategoryById } = useTaskContext();
  const [expandedBanner, setExpandedBanner] = useState<string | null>(null);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Categorize tasks
  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
  );

  const todayTasks = tasks.filter(
    (t) => t.status !== "completed" && isToday(new Date(t.dueDate))
  );

  const tomorrowTasks = tasks.filter(
    (t) => t.status !== "completed" && isTomorrow(new Date(t.dueDate))
  );

  const thisWeekTasks = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    return (
      t.status !== "completed" &&
      isThisWeek(dueDate, { weekStartsOn: 1 }) &&
      !isToday(dueDate) &&
      !isTomorrow(dueDate) &&
      !isPast(dueDate)
    );
  });

  const banners: BannerConfig[] = [
    {
      id: "overdue",
      label: "Overdue",
      icon: AlertTriangle,
      colorClass: "text-red-600 dark:text-red-400",
      bgClass: "bg-red-50 dark:bg-red-950/30",
      iconBgClass: "bg-red-100 dark:bg-red-900/40",
      borderClass: "border-red-200 dark:border-red-800/50",
      btnVariant: "destructive",
      filterPath: "/tasks?filter=overdue",
      tasks: overdueTasks,
      message: (count) =>
        `You have ${count} overdue task${count > 1 ? "s" : ""} that need${count === 1 ? "s" : ""} immediate attention`,
    },
    {
      id: "today",
      label: "Due Today",
      icon: Clock,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-950/30",
      iconBgClass: "bg-amber-100 dark:bg-amber-900/40",
      borderClass: "border-amber-200 dark:border-amber-800/50",
      btnVariant: "default",
      filterPath: "/tasks?filter=today",
      tasks: todayTasks,
      message: (count) =>
        `${count} task${count > 1 ? "s" : ""} due today — stay on track!`,
    },
    {
      id: "tomorrow",
      label: "Due Tomorrow",
      icon: CalendarClock,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950/30",
      iconBgClass: "bg-blue-100 dark:bg-blue-900/40",
      borderClass: "border-blue-200 dark:border-blue-800/50",
      btnVariant: "outline",
      filterPath: "/tasks?filter=tomorrow",
      tasks: tomorrowTasks,
      message: (count) =>
        `${count} task${count > 1 ? "s" : ""} due tomorrow — plan ahead!`,
    },
    {
      id: "week",
      label: "Due This Week",
      icon: Calendar,
      colorClass: "text-slate-600 dark:text-slate-400",
      bgClass: "bg-slate-50 dark:bg-slate-950/30",
      iconBgClass: "bg-slate-100 dark:bg-slate-800/40",
      borderClass: "border-slate-200 dark:border-slate-700/50",
      btnVariant: "secondary",
      filterPath: "/tasks?filter=week",
      tasks: thisWeekTasks,
      message: (count) =>
        `${count} more task${count > 1 ? "s" : ""} coming up this week`,
    },
  ];

  const activeBanners = banners.filter((b) => b.tasks.length > 0);

  if (activeBanners.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedBanner((prev) => (prev === id ? null : id));
  };

  return (
    <div className="notification-banners-container mt-6 space-y-3">
      {activeBanners.map((banner, index) => {
        const isExpanded = expandedBanner === banner.id;
        const Icon = banner.icon;

        return (
          <Card
            key={banner.id}
            className={cn(
              "notification-banner overflow-hidden transition-all duration-300",
              banner.bgClass,
              banner.borderClass,
              `animate-slide-up`
            )}
            style={{
              animationDelay: `${index * 80}ms`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            {/* Banner header */}
            <div className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", banner.iconBgClass)}>
                <Icon className={cn("w-5 h-5", banner.colorClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn("font-semibold text-sm", banner.colorClass)}>
                  {banner.tasks.length} {banner.label}
                  {banner.id === "overdue" ? ` Task${banner.tasks.length > 1 ? "s" : ""}` : ""}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {banner.message(banner.tasks.length)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Expand toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(banner.id)}
                  className="h-8 w-8 p-0"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {/* Review link */}
                <Link to={banner.filterPath}>
                  <Button variant={banner.btnVariant} size="sm" className="gap-1">
                    Review
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Expanded task list */}
            <div
              className={cn(
                "notification-banner-list transition-all duration-300 overflow-hidden",
                isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="px-4 pb-4">
                <div className="border-t border-border/50 pt-3 space-y-2">
                  {banner.tasks.slice(0, 5).map((task) => {
                    const category = getCategoryById(task.categoryId);
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-background/60 border border-border/30"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: category?.color || "#64748B",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {category?.name || "General"} •{" "}
                            {format(new Date(task.dueDate), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                            task.priority === "high" &&
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            task.priority === "medium" &&
                              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                            task.priority === "low" &&
                              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          )}
                        >
                          {task.priority}
                        </span>
                      </div>
                    );
                  })}
                  {banner.tasks.length > 5 && (
                    <Link
                      to={banner.filterPath}
                      className="block text-center text-sm text-primary font-medium pt-1 hover:underline"
                    >
                      +{banner.tasks.length - 5} more task
                      {banner.tasks.length - 5 > 1 ? "s" : ""}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
