import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/common/PageHeader";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { EmptyState } from "@/components/common/EmptyState";
import { useTaskContext } from "@/contexts/TaskContext";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

export default function CalendarView() {
  const { tasks, toggleTaskComplete, deleteTask, getCategoryById } = useTaskContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(new Date(task.dueDate), date));
  };

  // Get tasks for selected date
  const selectedDateTasks = getTasksForDate(selectedDate);

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setTaskFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setTaskFormOpen(open);
    if (!open) setSelectedTask(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Calendar"
        description="View your tasks on a calendar"
        action={
          <Button onClick={() => setTaskFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 p-4 md:p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayTasks = getTasksForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const hasOverdue = dayTasks.some(
                (t) => t.status !== "completed" && isPast(new Date(t.dueDate)) && !isToday(day)
              );

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative aspect-square p-1 md:p-2 rounded-lg transition-all duration-200 flex flex-col items-center",
                    "hover:bg-accent",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                    !isCurrentMonth && "opacity-40",
                    isToday(day) && !isSelected && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Task Indicators */}
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayTasks.slice(0, 3).map((task, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            task.status === "completed"
                              ? "bg-success"
                              : hasOverdue
                              ? "bg-destructive"
                              : "bg-primary"
                          )}
                          style={
                            task.status !== "completed" && !hasOverdue
                              ? {
                                  backgroundColor: getCategoryById(task.categoryId)?.color,
                                }
                              : undefined
                          }
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span
                          className={cn(
                            "text-[10px]",
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                        >
                          +{dayTasks.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Date Tasks */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">
                {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "MMMM d, yyyy")}
              </p>
            </div>
            <Badge variant="secondary">{selectedDateTasks.length} tasks</Badge>
          </div>

          <ScrollArea className="h-[400px] lg:h-[500px]">
            {selectedDateTasks.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No tasks"
                description={`No tasks scheduled for ${format(selectedDate, "MMMM d")}`}
                actionLabel="Add Task"
                onAction={() => setTaskFormOpen(true)}
                className="py-8"
              />
            ) : (
              <div className="space-y-3 pr-4">
                {selectedDateTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={getCategoryById(task.categoryId)}
                    onToggleComplete={toggleTaskComplete}
                    onEdit={handleEdit}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={handleCloseForm}
        task={selectedTask}
      />
    </div>
  );
}
