import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Column, Task } from ".";


export interface KanbanStore {
  columns: Column[];
  tasksByColumn: Record<Column["id"], Task[]>;
  previvewPlaceholder: { columnId: Column["id"]; index: number } | null;

  setPrevivewPlaceholder: (payload:{ columnId: Column["id"]; index: number }|null) => void;
  clearPrevivew: () => void;
  findTaskById: (taskId: string) => Task | null;
  addTask: (columnId: Column["id"], title: string) => void;
  moveTask: (
    taskId: string,
    targetColumnId: Column["id"],
    newIndex: number,
  ) => void;
  deleteTask:( taskId:string)=>void
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  clearAll: () => void;
  setTaskProps: (taskId: string, props: string) => void;
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
      previvewPlaceholder: null as { columnId: Column["id"]; index: number } | null,

      setPrevivewPlaceholder: (payload:{ columnId: Column["id"]; index: number }|null) => {
        set({ previvewPlaceholder: payload });
      },
      clearPrevivew:()=>{ set({ previvewPlaceholder: null }); },
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
            props: "",
            createdAt: new Date().toISOString(),
          };
          return {
            tasksByColumn: {
              ...state.tasksByColumn,
              [columnId]: [...tasks, newTask],
            },
          };
        });
      },
      deleteTask: (taskId) => {
        set((state: KanbanStore) => {
          const task = get().findTaskById(taskId);
          if (!task) {
            return state;
          }

          // remove the task and re‑index the column
          const columnId = task.columnId;
          const newTasks = state.tasksByColumn[columnId]
            .filter((t) => t.id !== taskId)
            .map((t, idx) => ({ ...t, orderInColumn: idx }));

          return {
            tasksByColumn: {
              ...state.tasksByColumn,
              [columnId]: newTasks,
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
          if (sourceColumnId !== targetColumnId) {
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
          }else{
            newIndex=newIndex>task.orderInColumn? newIndex--:newIndex; // 如果在同一列内向下移动，目标索引会因为先删除原任务而提前一位
            const movedTask = { ...task, columnId: targetColumnId, orderInColumn: newIndex };
            newSourceTasks.splice(newIndex,0,movedTask); // 直接在原列内移动
            return {
              tasksByColumn: {
                ...state.tasksByColumn,
                [sourceColumnId]: newSourceTasks,
              },
            };

          }
          

          
        });
      },
      updateTask: (taskId, updates) => {
        set(state=>{
          const tasksByColumn = {...state.tasksByColumn};
          for(const columnId of Object.keys(tasksByColumn) as Column["id"][]){
            tasksByColumn[columnId] = tasksByColumn[columnId].map(t=>t.id===taskId?{...t,...updates}:t);
          }
          return { tasksByColumn };
        })
      },
      clearAll: () => {
        set(() => {
          return {
            columns: defaultColumns,
            tasksByColumn: {
        todo: [] as Task[],
        "in-progress": [] as Task[],
        done: [] as Task[],
      }
          }
        });
      },
      setTaskProps: (taskId, props) => {
        set((state) => {
          const task = state.findTaskById(taskId);
          
          if (!task) return state;
          console.log("为", task.title,"设置属性:", props);
          return {
            tasksByColumn: {
              ...state.tasksByColumn,
              [task.columnId]: state.tasksByColumn[task.columnId].map((t) =>
                t.id === taskId ? { ...t, props } : t
              ),
            },
          };
        });
      }
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