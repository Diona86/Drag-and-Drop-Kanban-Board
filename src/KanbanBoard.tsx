import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent,DragOverEvent } from "@dnd-kit/core";
import { ColumnL } from "./Column";
import { useKanbanStore } from "./store";
import type { Column, Task } from ".";
import { Button } from "./components/ui/button";
import {  useState } from "react";
import { TaskCard } from "./TaskCard";
import Header from './Header'

const KanbanBoard = () => {
  const columns = useKanbanStore((state) => state.columns);
  const tasksByColumn = useKanbanStore((state) => state.tasksByColumn);
  const moveTask = useKanbanStore((state) => state.moveTask);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<Column["id"] | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const handleDragOver = (event: DragOverEvent) => {
    const {  over } = event;
    if(!over){
      setOverColumnId(null);
      setPreviewIndex(null);
      useKanbanStore.getState().clearPrevivew();
      return;
    }
    const overColumnId = over.data.current?.sortable?.containerId as Column["id"]|undefined;
    if(!overColumnId){
      setOverColumnId(null);
      setPreviewIndex(null);
      useKanbanStore.getState().clearPrevivew();
      return;
    }else{
      setOverColumnId(overColumnId);
      const targetTasks = tasksByColumn[overColumnId] ?? [];
      let index = targetTasks.findIndex((t) => t.id === over.id as string);
      setPreviewIndex(index === -1 ? targetTasks.length : index);//v1 方法
      const react=over.rect;
      const mouseY=event.delta.y;
      index = react? (mouseY > (react.height / 2)+react.top ? index + 1 : index) : index;
      useKanbanStore.getState().setPrevivewPlaceholder({ columnId: overColumnId, index });
    }
    
  }
  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    useKanbanStore.getState().setTaskProps(activeId,"invisible absolute " );
    let task = useKanbanStore.getState().findTaskById(activeId);
    task={...task,props:"visible"}as Task; 
    setActiveTask(task);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    useKanbanStore.getState().clearPrevivew();
    setActiveTask(null);
    setOverColumnId(null);
    setPreviewIndex(null);
    const { active, over } = event;
    if (!over) return; // 没有拖放到有效目标上
    console.log("Drag ended:", { active, over });
    const activeId = active.id as string;
    useKanbanStore.getState().setTaskProps(activeId,"");
    const overId = over.id as string;
    if (activeId === overId) return;
    let targetColumnId = over.data.current?.sortable
      ?.containerId as Column["id"];
    if (!targetColumnId) {
      //查到末尾
      targetColumnId=over?.id as Column["id"];
      if(!targetColumnId){
        console.warn("Still no valid target column");
        return;
      }
      const newIndex = (tasksByColumn[targetColumnId] ?? []).length;
      moveTask(activeId, targetColumnId, newIndex);
      return;
    } // 目标不是列
    const targetTasks = tasksByColumn[targetColumnId] ?? [];
    let newIndex = targetTasks.findIndex((t) => t.id === overId);
    if (newIndex === -1) newIndex = targetTasks.length; // 如果没有找到，放在末尾
    console.log("拖拽成功:", { activeId, targetColumnId, newIndex });
    moveTask(activeId, targetColumnId, newIndex);
  };
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <Header/>
      <div className="flex flex-col md:flex-row gap-2 overflow-x-auto py-1 px-6 h-full">
        {columns.map((column) => (
          <ColumnL
            key={column.id}
            columnId={column.id}
            columnTitle={column.title}
            tasks={tasksByColumn[column.id] ?? []}
            overColumnId={overColumnId}
            previewIndex={previewIndex}
            dragId={activeTask?.id}
          />
        ))}
        {/* <Button
          variant="outline"
          className="h-10 self-start"
          onClick={() => {
            console.log(tasksByColumn);
          }}
        >
          打印tasks
        </Button>
        <Button
          variant="outline"
          className="h-10 self-start"
          onClick={useKanbanStore.getState().clearAll}
        >
          清空所有任务
        </Button> */}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
};

export { KanbanBoard };
