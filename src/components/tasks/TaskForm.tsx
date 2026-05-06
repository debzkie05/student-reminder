import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Paperclip, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Task, Priority, Attachment } from "@/types/task";
import { toast } from "sonner";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

// Helper to add a timeout to promises
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const { categories, addTask, updateTask, addCategory } = useTaskContext();
  const isEditing = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<Priority>("medium");
  const [categoryId, setCategoryId] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // New Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1");

  // Attachments State
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(new Date(task.dueDate));
      setPriority(task.priority);
      setCategoryId(task.categoryId);
      setExistingAttachments(task.attachments || []);
      setFiles([]);
    } else {
      setTitle("");
      setDescription("");
      setDueDate(new Date());
      setPriority("medium");
      setExistingAttachments([]);
      setFiles([]);
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
    }
  }, [task, categories, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;
    
    setIsUploading(true);

    try {
      // Upload new files
      const newAttachments: Attachment[] = [];
      for (const file of files) {
        // Create unique path based on time and file name
        const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
        
        // Add a 10 second timeout because Firebase Storage SDK hangs indefinitely if the bucket isn't initialized
        const snapshot = await withTimeout(
          uploadBytes(fileRef, file), 
          10000, 
          "Storage not enabled. Please enable Firebase Storage in your Firebase Console."
        );
        
        const url = await getDownloadURL(snapshot.ref);
        
        newAttachments.push({
          name: file.name,
          url,
          type: file.type,
          size: file.size,
        });
      }

      const finalAttachments = [...existingAttachments, ...newAttachments];

      if (isEditing && task) {
        await updateTask(task.id, {
          title,
          description,
          dueDate,
          priority,
          categoryId,
          attachments: finalAttachments,
        });
        toast.success("Task updated successfully");
      } else {
        await addTask({
          title,
          description,
          dueDate,
          priority,
          categoryId,
          status: "pending",
          attachments: finalAttachments,
        });
        toast.success("Task created successfully");
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast.error(error.message || "Failed to save task. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    const newId = await addCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });
    
    setCategoryId(newId);
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    if (date) {
                      setDueDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                {!isAddingCategory && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="h-auto p-0 text-xs text-primary font-medium flex items-center gap-1"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    <Plus className="w-3 h-3" /> New
                  </Button>
                )}
              </div>
              
              {isAddingCategory ? (
                <div className="space-y-2 p-2 border rounded-md bg-muted/30">
                  <Input 
                    placeholder="Category name" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-2">
                    <input 
                      type="color" 
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer p-0 border-0"
                    />
                    <div className="flex gap-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs px-2"
                        onClick={() => setIsAddingCategory(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="h-7 text-xs px-2"
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-priority-high" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-priority-medium" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-priority-low" />
                      Low
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label>Attachments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Paperclip className="w-3.5 h-3.5" />
                Add Files
              </Button>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* File List */}
            {(existingAttachments.length > 0 || files.length > 0) && (
              <div className="space-y-2 border rounded-md p-3 bg-muted/20 max-h-32 overflow-y-auto">
                {existingAttachments.map((file, idx) => (
                  <div key={`existing-${idx}`} className="flex items-center justify-between bg-background border rounded px-2 py-1.5 text-sm">
                    <span className="truncate flex-1 pr-2">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeExistingAttachment(idx)}
                      disabled={isUploading}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                {files.map((file, idx) => (
                  <div key={`new-${idx}`} className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded px-2 py-1.5 text-sm">
                    <span className="truncate flex-1 pr-2 text-primary">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeFile(idx)}
                      disabled={isUploading}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center gap-3 sm:justify-end sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none mt-0"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !categoryId || isUploading}
              className="flex-1 sm:flex-none mt-0 min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

