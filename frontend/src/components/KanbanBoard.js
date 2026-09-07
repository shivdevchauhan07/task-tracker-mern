import "./KanbanBoard.css";
import TaskCard from "./TaskCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function KanbanBoard({
  columns,
  onDragEnd,
  onComplete,
  onEdit,
  onDelete
}) {

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">

        {Object.entries(columns).map(([status,tasks])=>(

          <Droppable droppableId={status} key={status}>
            {(provided)=>(
              <div
                className="column"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >

                <div className="column-header">
                  <span className="column-title">{status}</span>

                  <span className="task-count">
                    {tasks.length}
                  </span>
                </div>

                <div className="drop-zone">

                  {tasks.map((task,index)=>(

                    <Draggable
                      draggableId={task._id}
                      index={index}
                      key={task._id}
                    >
                      {(provided)=>(
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard
                            task={task}
                            onComplete={onComplete}
                            onEdit={onEdit}
                            onDelete={onDelete}
                          />
                        </div>
                      )}
                    </Draggable>

                  ))}

                  {provided.placeholder}

                </div>

              </div>
            )}
          </Droppable>

        ))}

      </div>
    </DragDropContext>
  );
}