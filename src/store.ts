import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Column, Task } from ".";


export interface KanbanStore {
  columns: Column[];
  tasksByColumn: Record<Column["id"], Task[]>;

  findTaskById: (taskId: string) => Task | null;
  addTask: (columnId: Column["id"], title: string) => void;
  moveTask: (
    taskId: string,
    targetColumnId: Column["id"],
    newIndex: number,
  ) => void;
}

const defaultColumns: Column[] = [
  { id: "todo", title: "To Do", position: 0 },
  { id: "in-progress", title: "In Progress", position: 1 },
  { id: "done", title: "Done", position: 2 },
];

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      columns: defaultColumns,
      tasksByColumn: {
        todo: [] as Task[],
        "in-progress": [] as Task[],
        done: [] as Task[],
      },

      findTaskById: (taskId) => {
        const { tasksByColumn } = get();
        for (const tasks of Object.values(tasksByColumn)) {
          const task = tasks.find((t) => t.id === taskId);
          if (task) return task;
        }
        return null;
      },

      addTask: (columnId, title) => {
        set((state) => {
          const tasks = state.tasksByColumn[columnId] ?? [];
          const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            columnId,
            orderInColumn: tasks.length,
            priority: "medium",
          };
          return {
            tasksByColumn: {
              ...state.tasksByColumn,
              [columnId]: [...tasks, newTask],
            },
          };
        });
      },

      moveTask: (taskId, targetColumnId, newIndex) => {
        set((state) => {
          const task = get().findTaskById(taskId);
          if (!task) return state;

          const sourceColumnId = task.columnId;

          const newSourceTasks = (state.tasksByColumn[sourceColumnId] ?? [])
            .filter((t) => t.id !== taskId)
            .map((t, idx) => ({ ...t, orderInColumn: idx }));

          let newTargetTasks = [...(state.tasksByColumn[targetColumnId] ?? [])];
          const movedTask = { ...task, columnId: targetColumnId, orderInColumn: newIndex };
          newTargetTasks.splice(newIndex, 0, movedTask);
          newTargetTasks = newTargetTasks.map((t, idx) => ({ ...t, orderInColumn: idx }));

          return {
            tasksByColumn: {
              ...state.tasksByColumn,
              [sourceColumnId]: newSourceTasks,
              [targetColumnId]: newTargetTasks,
            },
          };
        });
      },
    }),

    {
      name: "kanban-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        columns: state.columns,
        tasksByColumn: state.tasksByColumn,
      }),
    }
  )
);