import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import type { Task, Category, TaskStats, Priority, TaskStatus } from "@/types/task";

const defaultCategories: Omit<Category, "id" | "userId">[] = [
  { name: "Mathematics", color: "#6366F1" },
  { name: "Science", color: "#10B981" },
  { name: "English", color: "#F59E0B" },
  { name: "History", color: "#EF4444" },
  { name: "Computer Science", color: "#8B5CF6" },
  { name: "General", color: "#64748B" },
];

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  stats: TaskStats;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, "id" | "userId">) => Promise<string>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getTasksByCategory: (categoryId: string) => Task[];
  getTasksByDate: (date: Date) => Task[];
  getTasksByPriority: (priority: Priority) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getCategoryById: (id: string) => Category | undefined;
  isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  // Firestore Listeners
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setCategories([]);
      setCategoriesLoaded(false);
      setTasksLoaded(false);
      return;
    }

    // Listen to Categories
    const qCategories = query(collection(db, "categories"), where("userId", "==", user.id));
    const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(cats);
      setCategoriesLoaded(true);
    });

    // Listen to Tasks
    const qTasks = query(collection(db, "tasks"), where("userId", "==", user.id));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const tsks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tsks.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          dueDate: data.dueDate?.toDate() || new Date(),
          priority: data.priority,
          status: data.status,
          categoryId: data.categoryId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
          userId: data.userId,
          attachments: data.attachments || [],
        });
      });
      setTasks(tsks);
      setTasksLoaded(true);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeTasks();
    };
  }, [user]);

  // Seed default categories if none exist on first load (only once)
  useEffect(() => {
    if (user && categoriesLoaded && categories.length === 0) {
      const storageKey = `taskflow_seeded_${user.id}`;
      const alreadySeeded = localStorage.getItem(storageKey);

      if (!alreadySeeded) {
        const seedCategories = async () => {
          const batch = writeBatch(db);
          defaultCategories.forEach((cat) => {
            const docRef = doc(collection(db, "categories"));
            batch.set(docRef, { ...cat, userId: user.id });
          });
          await batch.commit();
          // Mark as seeded so it doesn't happen again even if they delete all categories
          localStorage.setItem(storageKey, "true");
        };
        seedCategories();
      }
    }
  }, [user, categoriesLoaded, categories.length]);

  const stats = useMemo<TaskStats>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status !== "completed").length,
      overdue: tasks.filter(
        (t) => t.status !== "completed" && new Date(t.dueDate) < today
      ).length,
      dueToday: tasks.filter((t) => {
        const dueDate = new Date(t.dueDate);
        return (
          t.status !== "completed" &&
          dueDate >= today &&
          dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
        );
      }).length,
      dueThisWeek: tasks.filter((t) => {
        const dueDate = new Date(t.dueDate);
        return t.status !== "completed" && dueDate >= today && dueDate <= weekEnd;
      }).length,
    };
  }, [tasks]);

  const addTask = useCallback(
    async (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">) => {
      if (!user) return;
      await addDoc(collection(db, "tasks"), {
        ...task,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
    [user]
  );

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { ...updates, updatedAt: new Date() });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  }, []);

  const toggleTaskComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const isCompleted = task.status === "completed";
      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, {
        status: isCompleted ? "pending" : "completed",
        completedAt: isCompleted ? null : new Date(),
        updatedAt: new Date(),
      });
    },
    [tasks]
  );

  const addCategory = useCallback(
    async (category: Omit<Category, "id" | "userId">) => {
      if (!user) return "";
      const docRef = await addDoc(collection(db, "categories"), {
        ...category,
        userId: user.id,
      });
      return docRef.id; // Return the new ID so it can be selected in the form
    },
    [user]
  );

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const catRef = doc(db, "categories", id);
    await updateDoc(catRef, updates);
  }, []);

  const deleteCategory = useCallback(
    async (id: string) => {
      await deleteDoc(doc(db, "categories", id));
      
      // Move tasks to General category if deleted (find General category first)
      const generalCategory = categories.find((c) => c.name === "General");
      if (generalCategory) {
        const batch = writeBatch(db);
        const affectedTasks = tasks.filter((t) => t.categoryId === id);
        affectedTasks.forEach((t) => {
          batch.update(doc(db, "tasks", t.id), { categoryId: generalCategory.id });
        });
        await batch.commit();
      }
    },
    [tasks, categories]
  );

  const getTasksByCategory = useCallback(
    (categoryId: string) => tasks.filter((t) => t.categoryId === categoryId),
    [tasks]
  );

  const getTasksByDate = useCallback(
    (date: Date) => {
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      return tasks.filter((t) => {
        const dueDate = new Date(t.dueDate);
        return dueDate >= start && dueDate < end;
      });
    },
    [tasks]
  );

  const getTasksByPriority = useCallback(
    (priority: Priority) => tasks.filter((t) => t.priority === priority),
    [tasks]
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        stats,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addCategory,
        updateCategory,
        deleteCategory,
        getTasksByCategory,
        getTasksByDate,
        getTasksByPriority,
        getTasksByStatus,
        getCategoryById,
        isLoading: !categoriesLoaded || !tasksLoaded,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}

