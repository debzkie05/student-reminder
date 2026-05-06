import { format, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import { Calendar, MoreVertical, Trash2, Edit, Clock, Paperclip, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Task, Category } from "@/types/task";

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({
  task,
  category,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== "completed";
  const isCompleted = task.status === "completed";

  const getDueDateLabel = () => {
    if (isToday(dueDate)) return "Today";
    if (isTomorrow(dueDate)) return "Tomorrow";
    if (isThisWeek(dueDate)) return format(dueDate, "EEEE");
    return format(dueDate, "MMM d");
  };

  const priorityColors = {
    high: "border-l-priority-high",
    medium: "border-l-priority-medium",
    low: "border-l-priority-low",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4",
        priorityColors[task.priority],
        isCompleted && "opacity-60",
        isOverdue && !isCompleted && "bg-destructive/5"
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div
            className={cn(
              "mt-0.5 transition-transform",
              isCompleted && "animate-check-bounce"
            )}
          >
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "font-medium text-card-foreground leading-tight",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {task.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors border max-w-[200px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Paperclip className="w-3 h-3 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                  </a>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center flex-wrap gap-2 mt-3">
              {/* Category Badge */}
              {category && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                  }}
                >
                  {category.name}
                </Badge>
              )}

              {/* Due Date */}
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue && !isCompleted
                    ? "text-destructive font-medium"
                    : "text-muted-foreground"
                )}
              >
                {isOverdue && !isCompleted ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                <span>{isOverdue && !isCompleted ? "Overdue" : getDueDateLabel()}</span>
              </div>

              {/* Priority Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "text-xs capitalize",
                  task.priority === "high" && "border-priority-high text-priority-high",
                  task.priority === "medium" && "border-priority-medium text-priority-medium",
                  task.priority === "low" && "border-priority-low text-priority-low"
                )}
              >
                {task.priority}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
