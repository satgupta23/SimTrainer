'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

export type HistoryFeedback = {
  empathy?: number;
  curiosity?: number;
  structure?: number;
  summary?: string;
};

export type HistoryConversation = {
  id: string;
  scenarioTitle: string;
  trackId: string;
  startedAt: string;
  feedback: HistoryFeedback | null;
};

type HistoryListProps = {
  initialConversations: HistoryConversation[];
};

export default function HistoryList({ initialConversations }: HistoryListProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<'deleteSelected' | 'clearAll' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const allSelected = selectedIds.size > 0 && selectedIds.size === conversations.length;

  const handleSelectAllToggle = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(conversations.map((c) => c.id)));
    }
  };

  const runDeleteRequest = async (body: Record<string, unknown>) => {
    const response = await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? 'Failed to update history');
    }

    return response.json() as Promise<{ deleted: number }>;
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setPendingAction('deleteSelected');
    setError(null);
    try {
      await runDeleteRequest({ ids: Array.from(selectedIds) });
      setConversations((prev) => {
        const remaining = prev.filter((c) => !selectedIds.has(c.id));
        return remaining;
      });
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete selected items.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleClearAll = async () => {
    if (conversations.length === 0) return;
    setPendingAction('clearAll');
    setError(null);
    try {
      await runDeleteRequest({ clearAll: true });
      setConversations([]);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history.');
    } finally {
      setPendingAction(null);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">{selectedCount} selected</p>
          <p className="text-xs text-slate-400">
            Use the Select buttons to pick specific runs to remove, or clear everything.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSelectAllToggle}
            disabled={conversations.length === 0}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
          >
            {allSelected ? 'Clear selection' : 'Select all'}
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0 || pendingAction !== null}
            className="rounded-md border border-rose-500/70 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
          >
            {pendingAction === 'deleteSelected' ? 'Deleting...' : 'Delete selected'}
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={conversations.length === 0 || pendingAction !== null}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-50 transition hover:border-amber-400 hover:text-amber-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
          >
            {pendingAction === 'clearAll' ? 'Clearing...' : 'Clear history'}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-rose-500/70 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}

      {conversations.length === 0 ? (
        <p className="text-sm text-slate-400">You haven&apos;t saved any conversations yet.</p>
      ) : (
        <ul className="space-y-3">
          {conversations.map((c) => {
            const isSelected = selectedIds.has(c.id);
            return (
              <li
                key={c.id}
                className={`rounded-lg border px-4 py-3 text-sm transition ${
                  isSelected ? 'border-sky-500 bg-slate-900' : 'border-slate-800 bg-slate-900/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Link
                    href={`/history/${c.id}`}
                    className="flex-1 space-y-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-50">{c.scenarioTitle}</p>
                        <p className="text-xs text-slate-400">
                          <time suppressHydrationWarning dateTime={c.startedAt}>
                            {new Date(c.startedAt).toLocaleString()}
                          </time>
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                        {c.trackId}
                      </span>
                    </div>
                    {c.feedback ? (
                      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                        <span>Empathy: {c.feedback.empathy ?? 'N/A'}/5</span>
                        <span>Curiosity: {c.feedback.curiosity ?? 'N/A'}/5</span>
                        <span>Structure: {c.feedback.structure ?? 'N/A'}/5</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">No feedback saved for this run.</p>
                    )}
                    <p className="text-[11px] text-slate-400">Click to reopen and continue this conversation.</p>
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleSelection(c.id)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
                      isSelected
                        ? 'border-sky-500/70 bg-sky-500/10 text-sky-100'
                        : 'border-slate-700 text-slate-200 hover:border-slate-500'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
