import type { Task } from "@/."   // 假设你的 Task 类型在这里（或 "." 也行）

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="p-2 mx-2 rounded-xl bg-background border shadow-sm flex items-center justify-between gap-4  hover:shadow-md transition-shadow">
      <span className="font-medium">{task.title}</span>
      <span
        className={`
          px-2 py-1 text-xs rounded-full font-medium
          ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'}
        `}
      >
        {task.priority}
      </span>
    </div>
  )
}