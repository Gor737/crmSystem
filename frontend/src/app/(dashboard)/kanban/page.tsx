'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import type { Lead, LeadStatus } from '@/types';
import { LEAD_STATUSES } from '@/lib/constants';
import { KanbanColumn } from '@/components/kanban/kanban-column';
import { KanbanCard } from '@/components/kanban/kanban-card';
import { Skeleton } from '@/components/ui/skeleton';

type KanbanData = Record<LeadStatus, Lead[]>;

export default function KanbanPage() {
  const [columns, setColumns] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchKanban = async () => {
    try {
      const res = await api.get('/leads/kanban');
      setColumns(res.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKanban(); }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const leadId = event.active.id as string;
    for (const status of Object.keys(columns || {}) as LeadStatus[]) {
      const lead = columns?.[status]?.find((l) => l.id === leadId);
      if (lead) { setActiveLead(lead); break; }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over || !columns) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    let sourceStatus: LeadStatus | null = null;
    for (const status of Object.keys(columns) as LeadStatus[]) {
      if (columns[status].some((l) => l.id === leadId)) {
        sourceStatus = status;
        break;
      }
    }

    if (!sourceStatus || sourceStatus === newStatus) return;

    const lead = columns[sourceStatus].find((l) => l.id === leadId)!;
    const updatedColumns = { ...columns };
    updatedColumns[sourceStatus] = updatedColumns[sourceStatus].filter((l) => l.id !== leadId);
    updatedColumns[newStatus] = [{ ...lead, status: newStatus }, ...updatedColumns[newStatus]];
    setColumns(updatedColumns);

    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      toast.success(`Moved to ${LEAD_STATUSES.find((s) => s.value === newStatus)?.label}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      fetchKanban();
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-72 shrink-0" />)}
      </div>
    );
  }

  if (!columns) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
        <p className="text-muted-foreground">Drag leads between stages</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STATUSES.map((status) => (
            <KanbanColumn
              key={status.value}
              id={status.value}
              title={status.label}
              color={status.color}
              leads={columns[status.value] || []}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <KanbanCard lead={activeLead} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
