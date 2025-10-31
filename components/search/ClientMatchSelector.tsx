'use client';

import { GoogleSheetRow } from '@/lib/types/api.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, FolderOpen } from 'lucide-react';

interface ClientMatch extends GoogleSheetRow {
  confidence_score: number;
}

interface ClientMatchSelectorProps {
  matches: ClientMatch[];
  onSelect: (match: GoogleSheetRow) => void;
}

// Helper function to get badge color based on confidence score
function getConfidenceBadgeColor(score: number): { className: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (score >= 0.9) {
    return {
      className: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50',
      variant: 'outline'
    };
  } else if (score >= 0.7) {
    return {
      className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50',
      variant: 'outline'
    };
  } else if (score >= 0.5) {
    return {
      className: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50',
      variant: 'outline'
    };
  } else {
    return {
      className: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50',
      variant: 'outline'
    };
  }
}

export function ClientMatchSelector({ matches, onSelect }: ClientMatchSelectorProps) {
  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Multiple Clients Found</h2>
        <p className="text-[hsl(var(--color-muted-foreground))]">
          We found {matches.length} potential matches. Please select the correct client:
        </p>
      </div>

      <div className="grid gap-3">
        {matches.map((match, index) => {
          const badgeStyle = getConfidenceBadgeColor(match.confidence_score);
          return (
            <Card
              key={`${match.folder_id}-${index}`}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect(match)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[hsl(var(--color-primary))]" />
                      {match.folder_name}
                    </CardTitle>
                    {match.space_name && (
                      <CardDescription className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        {match.space_name}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant={badgeStyle.variant}
                    className={`ml-2 ${badgeStyle.className}`}
                  >
                    {Math.round(match.confidence_score * 100)}% match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                    Folder ID: {match.folder_id}
                  </p>
                  <Button size="sm" variant="outline">
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
