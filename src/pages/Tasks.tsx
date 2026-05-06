import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { EmptyState } from "@/components/common/EmptyState";
import { useTaskContext } from "@/contexts/TaskContext";
import type { Task, Priority, TaskStatus } from "@/types/task";
import { isPast, isToday } from "date-fns";

type SortOption = "dueDate" | "priority" | "title" | "createdAt";
type FilterTab = "all" | "pending" | "completed" | "overdue";

export default function Tasks() {
  const { tasks, categories, toggleTaskComplete, deleteTask, getCategoryById } =
    useTaskContext();
  
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Filter by tab
    switch (activeTab) {
      case "pending":
        result = result.filter((t) => t.status !== "completed");
        break;
      case "completed":
        result = result.filter((t) => t.status === "completed");
        break;
      case "overdue":
        result = result.filter(
          (t) =>
            t.status !== "completed" &&
            isPast(new Date(t.dueDate)) &&
            !isToday(new Date(t.dueDate))
        );
        break;
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((t) => selectedCategories.includes(t.categoryId));
    }

    // Filter by priorities
    if (selectedPriorities.length > 0) {
      result = result.filter((t) => selectedPriorities.includes(t.priority));
    }

    // Sort
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "dueDate":
          comparison =
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "priority":
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchQuery, activeTab, sortBy, sortOrder, selectedCategories, selectedPriorities]);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setTaskFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setTaskFormOpen(open);
    if (!open) setSelectedTask(null);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriorities([]);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPriorities.length > 0 ||
    searchQuery.length > 0;

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const togglePriority = (priority: Priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Tasks"
        description="Manage all your academic tasks"
        action={
          <Button onClick={() => setTaskFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as FilterTab)}
            className="flex-1"
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Done</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            {/* Category & Priority Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                      {selectedCategories.length + selectedPriorities.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Categories</DropdownMenuLabel>
                {categories.map((cat) => (
                  <DropdownMenuCheckboxItem
                    key={cat.id}
                    checked={selectedCategories.includes(cat.id)}
                    onCheckedChange={() => toggleCategory(cat.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={selectedPriorities.includes("high")}
                  onCheckedChange={() => togglePriority("high")}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-priority-high" />
                    High
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedPriorities.includes("medium")}
                  onCheckedChange={() => togglePriority("medium")}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-priority-medium" />
                    Medium
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedPriorities.includes("low")}
                  onCheckedChange={() => togglePriority("low")}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-priority-low" />
                    Low
                  </div>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="createdAt">Created</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategories.map((catId) => {
              const cat = getCategoryById(catId);
              return cat ? (
                <Badge
                  key={catId}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => toggleCategory(catId)}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                  <X className="w-3 h-3" />
                </Badge>
              ) : null;
            })}
            {selectedPriorities.map((priority) => (
              <Badge
                key={priority}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80 capitalize"
                onClick={() => togglePriority(priority)}
              >
                {priority}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={hasActiveFilters ? "No matching tasks" : "No tasks yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your filters to see more tasks"
                : "Create your first task to get started with organizing your academic work"
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : "Create Task"}
            onAction={hasActiveFilters ? clearFilters : () => setTaskFormOpen(true)}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            </p>
            {filteredTasks.map((task, index) => (
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
          </>
        )}
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
