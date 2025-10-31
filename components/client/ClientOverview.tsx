'use client';

import { useState, useEffect } from 'react';
import { ClientBasicInfo } from '@/lib/types/api.types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, TrendingUp, Briefcase, ExternalLink, Download } from 'lucide-react';

interface ClientOverviewProps {
  data: ClientBasicInfo[];
}

// Helper function to get complexity level color - Enhanced with neon/bold shades
function getComplexityColor(level: string): string {
  switch (level) {
    case 'Light':
      return 'bg-[#E8F34C]/20 text-[#C5D41A] border-[#E8F34C]/40 font-semibold shadow-sm';
    case 'Medium':
      return 'bg-[#4FC3F7]/20 text-[#0288D1] border-[#4FC3F7]/40 font-semibold shadow-sm';
    case 'Heavy':
      return 'bg-[#FF6B6B]/20 text-[#DC3545] border-[#FF6B6B]/40 font-semibold shadow-sm';
    case 'Extreme Heavy':
      return 'bg-[#D946EF]/20 text-[#A21CAF] border-[#D946EF]/40 font-semibold shadow-sm';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

// Helper function to render value (handles multiple values and null cases)
function renderValue(value: any): React.JSX.Element {
  if (!value || value === '' || value === null || value === undefined) {
    return <span className="text-sm text-[hsl(var(--color-muted-foreground))]">N/A</span>;
  }

  const stringValue = String(value);

  // Check if value contains multiple items (comma-separated)
  if (stringValue.includes(',')) {
    const items = stringValue.split(',').map(item => item.trim()).filter(item => item);
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="text-base text-[hsl(var(--color-card-foreground))] bg-[hsl(var(--color-muted))] px-2 py-1 rounded-md text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return <span className="text-base text-[hsl(var(--color-card-foreground))]">{stringValue}</span>;
}

export function ClientOverview({ data }: ClientOverviewProps) {
  const [currentYear, setCurrentYear] = useState<number>(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) return;

    // Create CSV header
    const headers = [
      'Entity to Create Fund',
      'ClickUp ID',
      'Fund Name',
      'Law Firm',
      'Fund Admin',
      'Partner',
      'Investment Type',
      'Fund Structure',
      'Fund Engagement',
      'Complexity Level',
      'Year Month'
    ];

    // Create CSV rows
    const rows = data.map(item => [
      item.entity_to_create_fund || '',
      item.clickup_id || '',
      item.fund_name || '',
      item.law_firm || '',
      item.fund_admin || '',
      item.partner || '',
      item.investment_type || '',
      item.fund_structure || '',
      item.fund_engagement || '',
      item.complexity_level || '',
      item.year_month || ''
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
    link.download = `client_overview_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Collect all unique records (each entity_to_create_fund entry)
  const allRecords = data && data.length > 0 ? data : [];
  const latest = allRecords[0] || null;

  // Calculate Digitization Version from all records
  const getDigitizationVersion = (): string => {
    if (!allRecords || allRecords.length === 0) return 'N/A';

    const versions = allRecords
      .map(r => r.digitization_process_version)
      .filter((v): v is string => !!v);

    if (versions.length === 0) return 'N/A';

    const hasChecklist = versions.some(v => v === 'Checklist');
    const hasBlueprint = versions.some(v => v === 'Blueprint');

    if (hasChecklist && hasBlueprint) return 'Checklist & Blueprint';
    if (hasBlueprint) return 'Blueprint';
    if (hasChecklist) return 'Checklist';

    return versions[0]; // Fallback to first version
  };

  // Only keep the 5 required fields + Digitization Version: Fund Admin, Law Firm, Partner, Investment Type, Fund Engagement, Digitization Version
  const infoItems = [
    { label: 'Fund Admin', value: latest?.fund_admin, icon: Building2 },
    { label: 'Law Firm', value: latest?.law_firm, icon: Users },
    { label: 'Partner', value: latest?.partner, icon: Users },
    { label: 'Investment Type', value: latest?.investment_type, icon: TrendingUp },
    { label: 'Fund Engagement', value: latest?.fund_engagement, icon: Briefcase },
    { label: 'Digitization Version', value: getDigitizationVersion(), icon: Briefcase },
  ];

  // Filter only 2025 data for Historical Data section
  const data2025 = allRecords.filter(item =>
    item.year_month && item.year_month.startsWith('2025')
  );

  return (
    <Card className="shadow-lg hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
              <Building2 className="h-5 w-5 text-[hsl(var(--color-primary-foreground))]" />
            </div>
            Client Overview
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))]">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              <div className="font-medium text-[hsl(var(--color-card-foreground))]">
                {renderValue(item.value)}
              </div>
            </div>
          ))}
        </div>

        {data2025.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[hsl(var(--color-border))]">
            <h4 className="text-sm font-semibold mb-4 text-[hsl(var(--color-card-foreground))]">
              Historical Data – {currentYear}
            </h4>
            <div className="space-y-4">
              {data2025.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-[hsl(var(--color-muted))] rounded-xl hover:bg-[hsl(var(--color-subtle,var(--color-muted)))] hover:shadow-md transition-all duration-200 border border-[hsl(var(--color-border))] gap-4 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="text-base text-[hsl(var(--color-card-foreground))] font-medium mb-2">
                      {item.fund_name || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.complexity_level && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getComplexityColor(item.complexity_level)}`}
                        >
                          {item.complexity_level}
                        </span>
                      )}
                      {item.digitization_process_version && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold shadow-sm ${
                          item.digitization_process_version === 'Blueprint'
                            ? 'bg-[#10B981]/20 text-[#059669] border-[#10B981]/40'
                            : 'bg-[#F59E0B]/20 text-[#D97706] border-[#F59E0B]/40'
                        }`}>
                          {item.digitization_process_version}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[hsl(var(--color-muted-foreground))] mt-2">
                      {item.year_month || 'N/A'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {item.clickup_id && (
                      <a
                        href={`https://app.clickup.com/t/${item.clickup_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-primary))] transition-colors"
                      >
                        ClickUp
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {item.form_link && (
                      <a
                        href={item.form_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-primary))] transition-colors"
                      >
                        Form Link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
