import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import type { Column, Task } from ".";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { useKanbanStore } from "./store";
import { Input } from "@/components/ui/input"; // 假设你有 shadcn Input

interface ColumnProps {
  columnId: Column["id"];
  columnTitle: string;
  tasks: Task[];
}

export function ColumnL({ columnId, columnTitle, tasks }: ColumnProps) {
  const addTask = useKanbanStore((state) => state.addTask);
  const taskIds = tasks.map((t) => t.id);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) {
      setIsAdding(false);
      return;
    }
    addTask(columnId, title.trim());
    setTitle("");
    setIsAdding(false);
  };

  return (
    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
      {/* 根容器：固定宽度 + 铺满父容器高度 + flex 纵向 */}
      <div className="w-80  flex flex-col bg-neutral-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        {/* 标题栏 */}
        <div className="p-4  border-b border-gray-700">
          <h3 className="font-semibold text-lg text-white">{columnTitle}</h3>
        </div>

        {/* 任务列表区域：flex-1 让它自动撑满剩余空间 */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              拖拽任务到这里
            </div>
          )}
        </div>

        {/* 添加任务按钮 / 输入区域 */}
        <div className="p-3 border-t border-gray-700 ">
          {isAdding ? (
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入任务标题..."
                autoFocus
                className="bg-gray-900 border-gray-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") {
                    setTitle("");
                    setIsAdding(false);
                  }
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} className="flex-1">
                  确定
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTitle("");
                    setIsAdding(false);
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50"
              onClick={() => setIsAdding(true)}
            >
              + 添加任务
            </Button>
          )}
        </div>
      </div>
    </SortableContext>
  );
}