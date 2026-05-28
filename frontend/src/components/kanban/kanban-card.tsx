'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import type { Lead } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Props {
  lead: Lead;
  isDragging?: boolean;
}

export function KanbanCard({ lead, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-90 shadow-lg rotate-2',
      )}
    >
      <Link href={`/leads/${lead.id}`} className="font-medium text-sm hover:text-primary" onClick={(e) => e.stopPropagation()}>
        {lead.fullName}
      </Link>
      {lead.company && <p className="text-xs text-muted-foreground mt-1">{lead.company}</p>}
      <div className="mt-2 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">{lead.priority}</Badge>
        {lead.assignedTo && (
          <span className="text-xs text-muted-foreground">{lead.assignedTo.name.split(' ')[0]}</span>
        )}
      </div>
    </div>
  );
}
