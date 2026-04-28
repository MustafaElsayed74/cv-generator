import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

export function SortableItem({ id, onRemove, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="item-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button {...attributes} {...listeners} className="drag-handle" style={{ cursor: 'grab', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
          <GripVertical size={18} />
        </button>
        <button className="remove-btn" style={{ position: 'static' }} onClick={() => onRemove(id)}>
          <Trash2 size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}
