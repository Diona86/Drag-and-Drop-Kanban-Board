import type { Task } from "@/."; // 你的类型路径
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskModal } from "./TaskModal";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";
import { Checkbox } from "./components/ui/checkbox";
import { useKanbanStore } from "./store";
interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,0.25)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-3 rounded-lg bg-background border border-border
        shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200
        flex items-center gap-2.5 cursor-default ${task.props}
        ${isDragging ? "ring-2 ring-primary/40 scale-[1.02]" : ""}
      `}
      {...attributes}
    >
      {/* 拖拽手柄：细长竖条，只在 hover 时明显 */}
      <div
        className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-80 transition-opacity flex-shrink-0"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* 卡片主体：点击打开 Modal */}
      <TaskModal task={task}>
        <div className="flex-1 cursor-pointer min-w-0">
          {/* 主标题 + 优先级 一行排布 */}
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium text-sm truncate flex-1">
              {task.title}
            </div>

            {/* 优先级标签：小圆点 + 文字 */}
            <span
              className={`
                inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0
                ${
                  task.priority === "high"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                    : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                }
              `}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              {task.priority}
            </span>
            {/**完成 */}

            {task.columnId!=='done'&&task.columnId!=='todo'&&<Checkbox
              checked={false}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={(checked) => {
                useKanbanStore.getState().updateTask(task.id, {
                  isCompleted: !!checked,
                });
                if (checked) {
                  // 自动移到 Done 列（假设 Done 的 id 是 'done'）
                  useKanbanStore.getState().moveTask(task.id, "done", 0);
                }
              }}
              className="border-muted-foreground"
            />}
          </div>

          {/* 描述：第二行，截断显示 */}
          {task.description && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {task.description}
            </div>
          )}

          {/* 截止日期：第三行或与描述并排 */}
          {task.dueDate && (
            <div
              className={`
                text-xs mt-1
                ${new Date(task.dueDate) < new Date() ? "text-red-500 font-medium" : "text-muted-foreground"}
              `}
            >
              {format(new Date(task.dueDate), "M月d日")}
            </div>
          )}
        </div>
      </TaskModal>
    </div>
  );
}
