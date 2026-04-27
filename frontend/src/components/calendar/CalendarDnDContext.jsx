import React from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { useDispatch } from 'react-redux';
import { updateCalendarItem } from '../../store/calendarSlice';

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

const CalendarDnDContext = ({ children, items }) => {
  const dispatch = useDispatch();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over) {
      const activeItem = items.find(i => i._id === active.id || `${i._id}_${i.iterations}` === active.id);
      
      const activeData = active.data.current;
      
      if (activeItem && over.id.startsWith('slot-')) {
        const parts = over.id.split('-'); // slot, yyyy, mm, dd, hh, mm
        const newDate = new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5]);
        
        if (activeData.type === 'resize') {
          const update = { id: activeItem._id };
          if (activeData.position === 'top') {
            update.startTime = newDate.toISOString();
          } else {
            update.endTime = newDate.toISOString();
          }
          dispatch(updateCalendarItem(update));
        } else {
          // Move logic
          const duration = new Date(activeItem.endTime) - new Date(activeItem.startTime);
          const newEndTime = new Date(newDate.getTime() + duration);

          dispatch(updateCalendarItem({
            id: activeItem._id,
            startTime: newDate.toISOString(),
            endTime: newEndTime.toISOString()
          }));
        }
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
};

export default CalendarDnDContext;
