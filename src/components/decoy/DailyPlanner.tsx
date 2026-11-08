"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Calendar, CheckSquare } from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";

interface PlannerTask {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

const DEFAULT_TASKS: PlannerTask[] = [
  {
    id: "task-1",
    text: "Review project milestones and deliverables",
    completed: false,
    priority: "high",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "task-2",
    text: "Organize workspace and clean up desk",
    completed: true,
    priority: "medium",
    createdAt: Date.now() - 7200000,
  },
  {
    id: "task-3",
    text: "Review weekly budget and expenses",
    completed: false,
    priority: "low",
    createdAt: Date.now() - 10800000,
  },
];

export function DailyPlanner({ onTriggerSecret }: { onTriggerSecret: () => void }) {
  const [tasks, setTasks] = useState<PlannerTask[]>(DEFAULT_TASKS);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  // Secret gesture state tracking
  const [titleTapCount, setTitleTapCount] = useState(0);
  const [isPrimed, setIsPrimed] = useState(false);
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const primeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // PWA install state
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window));
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator && Boolean((window.navigator as any).standalone))
    );

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result?.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  // Load saved planner tasks from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("olr_planner_tasks");
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    } catch {
      // Fallback to default tasks
    }
  }, []);

  const saveTasks = (updated: PlannerTask[]) => {
    setTasks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("olr_planner_tasks", JSON.stringify(updated));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: PlannerTask = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
      createdAt: Date.now(),
    };

    saveTasks([newTask, ...tasks]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  // Secret gesture step 1: Tap title 3 times (or tap again once primed)
  const handleTitleClick = () => {
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);

    if (isPrimed) {
      // If already primed, a tap immediately triggers the secret unlock
      setIsPrimed(false);
      onTriggerSecret();
      return;
    }

    const nextCount = titleTapCount + 1;
    if (nextCount >= APP_CONFIG.gesture.titleTapCount) {
      setTitleTapCount(0);
      setIsPrimed(true);

      // Primed state active for 6 seconds
      if (primeTimerRef.current) clearTimeout(primeTimerRef.current);
      primeTimerRef.current = setTimeout(() => {
        setIsPrimed(false);
      }, 6000);
    } else {
      setTitleTapCount(nextCount);
      titleTimerRef.current = setTimeout(() => {
        setTitleTapCount(0);
      }, 2500);
    }
  };

  // Secret gesture step 2: Long press the first task
  const handleTaskPointerDown = (index: number) => {
    if (index === 0 && isPrimed) {
      longPressTimerRef.current = setTimeout(() => {
        setIsPrimed(false);
        onTriggerSecret();
      }, APP_CONFIG.gesture.taskLongPressMs);
    }
  };

  const handleTaskPointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-screen bg-decoy-bg text-decoy-text flex flex-col font-sans select-none pb-12">
      {/* Header */}
      <header className="px-5 pt-8 pb-5 bg-white border-b border-decoy-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider text-decoy-muted uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {todayStr}
            </span>
            {/* Gesture Target 1: Title */}
            <h1
              onClick={handleTitleClick}
              className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5 cursor-pointer active:opacity-90 select-none transition-opacity"
            >
              {APP_CONFIG.decoyName}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            {progressPercent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-decoy-muted">
          <span>
            {completedCount} of {tasks.length} tasks completed
          </span>
          <span>{tasks.length - completedCount} remaining</span>
        </div>
      </header>

      {/* New Task Input */}
      <div className="p-4 bg-white border-b border-decoy-border">
        <form onSubmit={handleAddTask} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              className="px-3.5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition flex items-center justify-center"
              aria-label="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Priority:</span>
            {(["low", "medium", "high"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setNewTaskPriority(p)}
                className={`text-xs px-2.5 py-1 rounded-md capitalize transition ${
                  newTaskPriority === p
                    ? p === "high"
                      ? "bg-red-100 text-red-700 font-medium"
                      : p === "medium"
                      ? "bg-amber-100 text-amber-700 font-medium"
                      : "bg-emerald-100 text-emerald-700 font-medium"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Task List */}
      <main className="flex-1 p-4 space-y-2.5">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-2">
            <CheckSquare className="w-8 h-8 stroke-slate-300" />
            <p>No tasks for today. Enjoy your day!</p>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <div
              key={task.id}
              // Gesture Target 2: First task long-press
              onPointerDown={() => handleTaskPointerDown(idx)}
              onPointerUp={handleTaskPointerUp}
              onPointerLeave={handleTaskPointerUp}
              onTouchStart={() => handleTaskPointerDown(idx)}
              onTouchEnd={handleTaskPointerUp}
              className={`group flex items-center justify-between p-3.5 rounded-xl border bg-white shadow-sm transition active:scale-[0.99] ${
                task.completed ? "border-slate-100 opacity-60" : "border-slate-200/80"
              }`}
            >
              <div
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-3 flex-1 cursor-pointer min-w-0 pr-2"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400 shrink-0" />
                )}
                <span
                  className={`text-sm truncate ${
                    task.completed ? "line-through text-slate-400" : "text-slate-700 font-medium"
                  }`}
                >
                  {task.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${
                    task.priority === "high"
                      ? "bg-red-400"
                      : task.priority === "medium"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  title={`${task.priority} priority`}
                />
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-slate-300 hover:text-red-500 rounded transition"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Footer Info & PWA Install Button */}
      <footer className="py-4 px-4 text-xs text-slate-400 border-t border-slate-200 mt-auto flex flex-col items-center gap-2">
        {installPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-200"
          >
            <span>📥</span>
            <span>Install Planner App</span>
          </button>
        )}

        {isIos && !isStandalone && (
          <div className="text-[11px] text-slate-400 text-center">
            Tip: Tap Safari Share <span className="font-bold">⎋</span> → <span className="font-bold">"Add to Home Screen"</span> for offline access
          </div>
        )}

        <div className="text-[11px]">Planner v1.2 • Daily Task Synchronization</div>
      </footer>
    </div>
  );
}
