'use client';

import { ProjectCounts } from '@/lib/types/api.types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Plus, RefreshCw, Download, Upload, Blocks, Link } from 'lucide-react';

interface ProjectVolumeProps {
  data: ProjectCounts | null;
}

export function ProjectVolume({ data }: ProjectVolumeProps) {
  const metrics = [
    {
      label: 'New Builds',
      description: 'Digitized forms',
      value: Number(data?.new_build_count) || 0,
      icon: Plus,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Updates',
      description: 'Form updates',
      value: Number(data?.update_count) || 0,
      icon: RefreshCw,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Exports',
      description: 'Export templates',
      value: Number(data?.export_count) || 0,
      icon: Download,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Imports',
      description: 'Import templates',
      value: Number(data?.import_count) || 0,
      icon: Upload,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'IDM',
      description: 'IDM setups',
      value: Number(data?.idm_count) || 0,
      icon: Blocks,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      label: 'Integrations',
      description: 'Integration flows',
      value: Number(data?.integration_count) || 0,
      icon: Link,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  const total = metrics.reduce((sum, m) => sum + m.value, 0);

  return (
    <Card className="shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <span className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
              <BarChart3 className="h-5 w-5 text-[hsl(var(--color-primary-foreground))]" />
            </div>
            Project Volume
          </span>
          <div className="text-right">
            <div className="text-sm font-medium text-[hsl(var(--color-text-subtle,var(--color-muted-foreground)))]">Total Projects</div>
            <div className="text-2xl font-bold text-[hsl(var(--color-text-strong,var(--color-foreground)))]">
              {total}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="group relative p-4 rounded-lg bg-[hsl(var(--color-muted))] border border-[hsl(var(--color-border))] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <span className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </span>
              </div>
              <div className="text-sm font-semibold text-[hsl(var(--color-text-strong,var(--color-foreground)))] mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-[hsl(var(--color-text-subtle,var(--color-muted-foreground)))]">
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
