'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Check, StickyNote } from 'lucide-react';

interface SpecialNoteProps {
  clientFolderId: string;
  clientName: string;
}

export function SpecialNote({ clientFolderId, clientName }: SpecialNoteProps) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing note when component mounts or client changes
  useEffect(() => {
    async function loadNote() {
      try {
        const res = await fetch(
          `/api/client-notes?clientFolderId=${encodeURIComponent(clientFolderId)}`
        );
        const data = await res.json();
        setNote(data.note || '');
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error loading note:', error);
        setIsInitialLoad(false);
      }
    }
    loadNote();
  }, [clientFolderId]);

  // Debounced auto-save when note changes
  useEffect(() => {
    // Skip saving during initial load or if note hasn't been loaded yet
    if (isInitialLoad) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save (1 second)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await fetch('/api/client-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientFolderId,
            clientName,
            note,
          }),
        });
        setSaving(false);
        setShowSaved(true);
      } catch (error) {
        console.error('Error saving note:', error);
        setSaving(false);
      }
    }, 1000);

    // Cleanup function to clear timeout
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [note, clientFolderId, clientName, isInitialLoad]);

  // Hide "Saved" checkmark after 2 seconds
  useEffect(() => {
    if (showSaved) {
      const timeout = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [showSaved]);

  return (
    <Card className="shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <span className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
              <StickyNote className="h-5 w-5 text-[hsl(var(--color-primary-foreground))]" />
            </div>
            Special Note
          </span>
          <span className="text-xs font-normal">
            {saving && (
              <span className="text-[hsl(var(--color-muted-foreground))]">
                Saving...
              </span>
            )}
            {showSaved && !saving && (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note for this client (e.g., 'Handle with priority', 'Client prefers email updates')"
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-[hsl(var(--color-muted-foreground))] mt-2">
          Notes are automatically saved and private to your account.
        </p>
      </CardContent>
    </Card>
  );
}
