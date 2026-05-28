'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Lead, LeadStatus } from '@/types';
import { KanbanCard } from './kanban-card';
import { cn } from '@/lib/utils';

interface Props {
  id: LeadStatus;
  title: string;
  color: string;
  leads: Lead[];
}

export function KanbanColumn({ id, title, color, leads }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30',
        isOver && 'ring-2 ring-primary',
      )}
    >
      <div className="flex items-center gap-2 border-b p-3">
        <div className={cn('h-2 w-2 rounded-full', color)} />
        <h3 className="font-medium text-sm">{title}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">{leads.length}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2 min-h-[200px] max-h-[calc(100vh-220px)]">
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
