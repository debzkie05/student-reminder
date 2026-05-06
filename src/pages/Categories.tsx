import { useState } from "react";
import { Plus, Edit2, Trash2, FolderOpen, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTaskContext } from "@/contexts/TaskContext";
import type { Category, Task } from "@/types/task";
import { cn } from "@/lib/utils";

const colorOptions = [
  "#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B",
  "#10B981", "#06B6D4", "#3B82F6", "#64748B", "#84CC16",
];

export default function Categories() {
  const {
    categories,
    tasks,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleTaskComplete,
    deleteTask,
    getCategoryById,
  } = useTaskContext();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState(colorOptions[0]);

  const isEditing = !!selectedCategory;

  const openForm = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setName(category.name);
      setColor(category.color);
    } else {
      setSelectedCategory(null);
      setName("");
      setColor(colorOptions[0]);
    }
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && selectedCategory) {
      updateCategory(selectedCategory.id, { name, color });
    } else {
      addCategory({ name, color });
    }

    setFormOpen(false);
  };

  const handleDelete = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      if (expandedCategory === selectedCategory.id) {
        setExpandedCategory(null);
      }
    }
  };

  const confirmDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskFormOpen(true);
  };

  const handleCloseTaskForm = (open: boolean) => {
    setTaskFormOpen(open);
    if (!open) setSelectedTask(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Categories"
        description="Organize your tasks by subject or course"
        action={
          <Button onClick={() => openForm()} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Category</span>
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories yet"
          description="Create categories to organize your tasks by subject or course"
          actionLabel="Create Category"
          onAction={() => openForm()}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const categoryTasks = tasks.filter((t) => t.categoryId === category.id);
            const completedTasks = categoryTasks.filter(
              (t) => t.status === "completed"
            ).length;
            const progress =
              categoryTasks.length > 0
                ? (completedTasks / categoryTasks.length) * 100
                : 0;
            const isExpanded = expandedCategory === category.id;

            return (
              <Card
                key={category.id}
                className={cn(
                  "transition-all duration-200",
                  isExpanded && "md:col-span-2"
                )}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : category.id)
                  }
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <FolderOpen
                        className="w-6 h-6"
                        style={{ color: category.color }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {category.name}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openForm(category);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(category);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {completedTasks} of {categoryTasks.length} tasks completed
                      </p>

                      <div className="mt-3">
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Tasks */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-muted/30 animate-fade-in">
                    {categoryTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tasks in this category
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {categoryTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            category={category}
                            onToggleComplete={toggleTaskComplete}
                            onEdit={handleEditTask}
                            onDelete={deleteTask}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      color === c && "ring-2 ring-offset-2 ring-foreground"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete "{selectedCategory?.name}" and move all its tasks
              to the General category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Form Modal */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={handleCloseTaskForm}
        task={selectedTask}
      />
    </div>
  );
}
