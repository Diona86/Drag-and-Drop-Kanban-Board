import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import type { Task } from ".";
import { useKanbanStore } from "./store";
import { useEffect, useRef, useState } from "react";
import { DialogHeader } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
// icon for trigger button
import { CalendarIcon } from "lucide-react";
// date picker component (custom wrapper around react-day-picker)
import { Calendar } from "./components/ui/calendar";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
interface TaskModalProps {
  task: Task;
  children: React.ReactNode;
}

export function TaskModal({ task, children }: TaskModalProps) {
  const updateTask = useKanbanStore((state) => state.updateTask);
  const deleteTask =useKanbanStore((state)=>state.deleteTask);
  const [open, setOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({ ...task });

  const handleSave = () => {
    updateTask(task.id, editedTask);
    setOpen(false);
  };
  const handleDelete=()=>{
    deleteTask(task.id);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="fixed w-auto max-h-[80vh] z-50 flex flex-col  bg-gray-200 shadow-2xl backdrop-blur-sm
             p-4 rounded-lg transition-all duration-300"
             onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-blue-600 font-bold ">编注</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col justify-between gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={editedTask.description || ""}
                onChange={(e) => {
                  setEditedTask({ ...editedTask, description: e.target.value });
                }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div className="grid gap-2">
              <Label>截至日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-auto p-0">
                    <CalendarIcon />
                    {editedTask.dueDate
                      ? format(new Date(editedTask.dueDate), "MM-dd")
                      : "选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={
                      editedTask.dueDate
                        ? new Date(editedTask.dueDate)
                        : undefined
                    }
                    onSelect={(date: Date | undefined) => {
                      setEditedTask({
                        ...editedTask,
                        dueDate: date?.toISOString() || "",
                      });
                      console.log(date?.toISOString());
                      console.log(format(date as Date, "ppp"));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>优先级</Label>

              <RadioGroup
                value={editedTask.priority}
                className="flex justify-between"
                onValueChange={(value:Task['priority'])=>setEditedTask({...editedTask,priority:value})}
              >
                <Label
                  htmlFor="r1"
                  className="flex items-center space-x-2 py-1 px-2 rounded-sm bg-green-300 cursor-pointer"
                >
                  <RadioGroupItem value="low" id="r1" />
                  <span>低</span>
                </Label>

                <Label
                  htmlFor="r2"
                  className="flex items-center space-x-2 py-1 px-2 rounded-sm bg-yellow-200 cursor-pointer"
                >
                  <RadioGroupItem value="medium" id="r2" />
                  <span>中</span>
                </Label>

                <Label
                  htmlFor="r3"
                  className="flex items-center space-x-2 py-1 px-2 rounded-sm bg-red-400 cursor-pointer"
                >
                  <RadioGroupItem value="high" id="r3" />
                  <span>高</span>
                </Label>
              </RadioGroup>
            </div>
          </div>
        </div>
        <div className="flex justify-center-safe gap-4">
          <Button onClick={handleDelete}>删除任务</Button>
          <Button onClick={handleSave}>应用修改</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
