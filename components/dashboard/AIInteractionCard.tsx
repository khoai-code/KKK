'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Sparkles, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInteractionCardProps {
  clientName?: string;
  folderId?: string;
  onProceed?: () => void;
  onRetry?: () => void;
}

export function AIInteractionCard({
  clientName,
  folderId,
  onProceed,
  onRetry,
}: AIInteractionCardProps) {
  if (!clientName || !folderId) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl p-8 shadow-xl border-[hsl(var(--color-border))] bg-gradient-to-br from-[hsl(var(--color-card))] to-[hsl(var(--color-muted)_/_0.3)]">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">Client Found</h3>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
            What would you like to do next?
          </p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-6 p-4 rounded-lg bg-[hsl(var(--color-muted)_/_0.5)] border border-[hsl(var(--color-border))]">
        <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-1">
          Client Name
        </p>
        <p className="text-lg font-semibold">{clientName}</p>
        <p className="text-xs text-[hsl(var(--color-muted-foreground))] mt-1">
          Folder ID: {folderId}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onRetry}
          className={cn(
            'w-full h-14 text-base font-medium shadow-md transition-all duration-300',
            'hover:scale-[1.02] hover:shadow-lg'
          )}
          variant="outline"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Search Again
        </Button>

        <Button
          onClick={onProceed}
          className={cn(
            'w-full h-14 text-base font-medium shadow-md transition-all duration-300',
            'bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] hover:opacity-90 hover:scale-[1.02] hover:shadow-lg'
          )}
        >
          <ArrowRight className="mr-2 h-5 w-5" />
          Proceed to View Details
        </Button>
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-6 border-t border-[hsl(var(--color-border))]">
        <p className="text-xs text-[hsl(var(--color-muted-foreground))] text-center">
          Reports are powered by AI and cached for 24 hours for faster access
        </p>
      </div>
    </Card>
  );
}
