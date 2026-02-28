import {DndContext} from "@dnd-kit/core"
import { ColumnL } from "./Column"
import { useKanbanStore } from "./store"

const KanbanBoard=()=>{
    const columns=useKanbanStore(state=>state.columns);
    const tasksByColumn=useKanbanStore(state=>state.tasksByColumn)
    return<DndContext>
      <div className="flex gap-2 overflow-x-auto py-32 px-6 bg-neutral-900 h-full">
        {columns.map((column) => (
          <ColumnL
            key={column.id}
            columnId={column.id}
            columnTitle={column.title}
            tasks={tasksByColumn[column.id] ?? []}
          />
        ))}
      </div>
    </DndContext>
}

export {KanbanBoard}