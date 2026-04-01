import { Label } from "@radix-ui/react-label";
import { useKanbanStore } from "./store";

export default function Header() {
  const tasksByColumn = useKanbanStore((state) => state.tasksByColumn);
  const total = Object.values(tasksByColumn).flat().length;
  Object.values(tasksByColumn).flat().map(t=>(console.log(t.dueDate)))
  const todayDue = Object.values(tasksByColumn).flat().filter(t => t.dueDate?.split('T')[0] === new Date().toISOString().split('T')[0]).length;
  return (
    <div className="w-auto h-min-20">
      <div className="p-6 my-2 mx-6 bg-cyan-600 rounded-2xl">
        <div className="p-2 m-2 text-2xl">
          <Label>总任务:</Label> <span>{total}</span>
        </div>
        <div className="p-2 m-2 text-2xl">
          <Label>今日到期:</Label> <span>{todayDue}</span>
        </div>
        <div className="p-2 m-2 text-2xl"> 
          <Label>总任务:</Label> <span>{total}</span>
        </div>
      </div>
    </div>
  );
}
