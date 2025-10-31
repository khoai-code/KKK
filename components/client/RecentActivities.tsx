'use client';

import { RecentActivity } from '@/lib/types/api.types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, AlertCircle, ExternalLink, Download } from 'lucide-react';

interface RecentActivitiesProps {
  data: RecentActivity[];
}

const complexityColors = {
  Light: 'bg-[#E8F34C]/20 text-[#C5D41A] border-[#E8F34C]/40 font-semibold shadow-sm',
  Medium: 'bg-[#4FC3F7]/20 text-[#0288D1] border-[#4FC3F7]/40 font-semibold shadow-sm',
  Heavy: 'bg-[#FF6B6B]/20 text-[#DC3545] border-[#FF6B6B]/40 font-semibold shadow-sm',
  'Extreme Heavy': 'bg-[#D946EF]/20 text-[#A21CAF] border-[#D946EF]/40 font-semibold shadow-sm',
};

export function RecentActivities({ data }: RecentActivitiesProps) {
  const handleDownloadCSV = () => {
    if (!data || data.length === 0) return;

    // Create CSV header
    const headers = [
      'ClickUp ID',
      'Fund Name',
      'Task Name',
      'Complexity Level'
    ];

    // Create CSV rows
    const rows = data.map(item => [
      item.clickup_id || '',
      item.fund_name || '',
      item.name || '',
      item.complexity_level || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recent_activities_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[hsl(var(--color-primary))]" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
            No recent activities found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
              <History className="h-5 w-5 text-[hsl(var(--color-primary-foreground))]" />
            </div>
            Recent Activities
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((activity, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted))] hover:bg-[hsl(var(--color-subtle,var(--color-muted)))] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`${complexityColors[activity.complexity_level]} font-semibold`}
                    >
                      {activity.complexity_level}
                    </Badge>
                    {activity.clickup_id && (
                      <a
                        href={`https://app.clickup.com/t/${activity.clickup_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary)_/_0.8)] hover:underline transition-colors font-medium"
                      >
                        View in ClickUp
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <h4 className="font-semibold text-base text-[hsl(var(--color-card-foreground))] leading-tight">{activity.name}</h4>
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))] font-medium">
                    {activity.fund_name}
                  </p>
                </div>
                {(activity.complexity_level === 'Heavy' || activity.complexity_level === 'Extreme Heavy') && (
                  <AlertCircle className="h-6 w-6 text-[#BB6464] flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
