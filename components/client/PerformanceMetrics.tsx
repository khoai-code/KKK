'use client';

import { PerformanceMetric } from '@/lib/types/api.types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/lib/context/ThemeContext';
import { THEMES } from '@/lib/utils/themeUtils';

interface PerformanceMetricsProps {
  data: PerformanceMetric[];
}

interface MetricSummary {
  label: string;
  value: number | null;
  unit: string;
  description: string;
  trend: number | null;
  inverse?: boolean; // True if lower is better
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const { theme } = useTheme();

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) return;

    // Create CSV header
    const headers = [
      'Entity to Create Fund',
      'Year Month',
      'Avg Effort New Form (hours)',
      'Avg Days New Form',
      'Avg Days Update'
    ];

    // Create CSV rows
    const rows = data.map(item => [
      item.entity_to_create_fund || '',
      item.year_month || '',
      item.avg_effort_new_form?.toString() || '',
      item.avg_days_new_form?.toString() || '',
      item.avg_days_update?.toString() || ''
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
    link.download = `performance_metrics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Theme-aware colors - Modern, accessible color schemes
  const colors = theme === THEMES.ASIAN ? {
    // Asian mode - warm, earthy tones with higher saturation
    effort: '#D9901A',      // Rich golden amber for Effort
    daysNew: '#6B9B37',     // Vibrant olive green for New Form
    daysUpdate: '#4A7BA7',  // Warm blue for Update
    gridColor: '#D9CEC0',
    axisColor: '#8B7563',
    textSecondary: '#5C4639',
    textMuted: '#8B7563',
    tooltipBackground: '#FBF9F5',
    tooltipBorder: '#D9CEC0',
    tooltipText: '#524035',
  } : theme === THEMES.DARK ? {
    // Dark mode - luminous, high-contrast colors
    effort: '#F5A623',      // Bright amber
    daysNew: '#7ED321',     // Vivid green
    daysUpdate: '#6BA4F6',  // Bright blue (matches primary)
    gridColor: '#2D323A',
    axisColor: '#687283',
    textSecondary: '#A8B2C1',
    textMuted: '#8D99AB',
    tooltipBackground: '#1F2228',
    tooltipBorder: '#2D323A',
    tooltipText: '#FAFAFA',
  } : {
    // Light mode - vibrant, professional colors
    effort: '#F5A623',      // Vibrant amber
    daysNew: '#7ED321',     // Fresh green
    daysUpdate: '#3478F6',  // Modern blue (matches accent)
    gridColor: '#E3E4E8',
    axisColor: '#687283',
    textSecondary: '#333333',
    textMuted: '#687283',
    tooltipBackground: '#FFFFFF',
    tooltipBorder: '#E3E4E8',
    tooltipText: '#171717',
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[hsl(var(--color-primary))]" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
            No performance data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Filter only 2025 data
  const data2025 = data.filter(item =>
    item.year_month && item.year_month.startsWith('2025')
  );

  // Calculate yearly averages for 2025
  const calculateAverage = (field: keyof PerformanceMetric): number | null => {
    const validValues = data2025
      .map(item => item[field])
      .filter((val): val is number => typeof val === 'number' && val !== null);

    if (validValues.length === 0) return null;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  };

  const avgEffort = calculateAverage('avg_effort_new_form');
  const avgDaysNew = calculateAverage('avg_days_new_form');
  const avgDaysUpdate = calculateAverage('avg_days_update');

  // Calculate trends (for now, just use difference from first to last month)
  const calculateTrend = (field: keyof PerformanceMetric): number | null => {
    const validData = data2025.filter(item => item[field] !== null && item[field] !== undefined);
    if (validData.length < 2) return null;

    const first = validData[0][field] as number;
    const last = validData[validData.length - 1][field] as number;

    return ((last - first) / first) * 100; // Percentage change
  };

  const metrics: MetricSummary[] = [
    {
      label: 'Effort per New Form',
      value: avgEffort,
      unit: 'hours',
      description: 'Average effort hours per new form',
      trend: calculateTrend('avg_effort_new_form'),
      inverse: true, // Lower is better
    },
    {
      label: 'Days to Deliver New Form',
      value: avgDaysNew,
      unit: 'days',
      description: 'Average delivery time for new forms',
      trend: calculateTrend('avg_days_new_form'),
      inverse: true, // Lower is better
    },
    {
      label: 'Days to Deliver Update',
      value: avgDaysUpdate,
      unit: 'days',
      description: 'Average delivery time for updates',
      trend: calculateTrend('avg_days_update'),
      inverse: true, // Lower is better
    },
  ];

  // Prepare chart data (only non-null months) and sort by date
  const chartData = data2025
    .filter(
      item =>
        item.avg_effort_new_form !== null ||
        item.avg_days_new_form !== null ||
        item.avg_days_update !== null
    )
    .sort((a, b) => {
      // Sort by year_month in chronological order (YYYY-MM format)
      const dateA = a.year_month || '';
      const dateB = b.year_month || '';
      return dateA.localeCompare(dateB);
    })
    .map(item => ({
      month: item.year_month ? item.year_month.split('-')[1] : '', // Extract month
      effort: item.avg_effort_new_form,
      daysNew: item.avg_days_new_form,
      daysUpdate: item.avg_days_update,
    }));

  // Render trend icon
  const renderTrendIcon = (metric: MetricSummary) => {
    if (metric.trend === null || metric.trend === 0) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }

    const isImprovement = metric.inverse
      ? metric.trend < 0 // For inverse metrics, negative trend is good
      : metric.trend > 0; // For normal metrics, positive trend is good

    if (isImprovement) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    }
  };

  const renderTrendText = (metric: MetricSummary) => {
    if (metric.trend === null) return null;

    const isImprovement = metric.inverse
      ? metric.trend < 0
      : metric.trend > 0;

    const colorClass = isImprovement ? 'text-green-500' : 'text-red-500';

    return (
      <span className={`text-sm font-semibold ${colorClass}`}>
        {Math.abs(metric.trend).toFixed(1)}%
      </span>
    );
  };

  return (
    <Card className="shadow-lg hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
              <Activity className="h-5 w-5 text-[hsl(var(--color-primary-foreground))]" />
            </div>
            Performance Metrics (2025)
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric, index) => {
            // Define colors for each metric to match chart - theme-aware
            const metricColors = [
              { color: colors.effort, name: 'Effort' },
              { color: colors.daysNew, name: 'Days New' },
              { color: colors.daysUpdate, name: 'Days Update' },
            ];
            const metricColor = metricColors[index].color;

            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-[hsl(var(--color-muted))] border border-[hsl(var(--color-border))] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: metricColor }}
                    />
                    <div className="text-sm font-semibold text-[hsl(var(--color-text-strong,var(--color-foreground)))]">
                      {metric.label}
                    </div>
                  </div>
                  {renderTrendIcon(metric)}
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: metricColor }}
                  >
                    {metric.value !== null ? metric.value.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-[hsl(var(--color-text-subtle,var(--color-muted-foreground)))]">
                    {metric.unit}
                  </div>
                </div>

                <div className="text-xs text-[hsl(var(--color-text-subtle,var(--color-muted-foreground)))]">
                  {metric.description}
                </div>

                {metric.trend !== null && metric.trend !== 0 && (
                  <div className="mt-3 pt-3 border-t border-[hsl(var(--color-border))]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[hsl(var(--color-text-subtle,var(--color-muted-foreground)))]">
                        vs. start of year
                      </span>
                      {renderTrendText(metric)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Line Chart */}
        {chartData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-4 text-[hsl(var(--color-card-foreground))]">
              Monthly Trends (2025)
            </h4>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 50, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
                <XAxis
                  dataKey="month"
                  stroke={colors.axisColor}
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  label={{
                    value: 'Month',
                    position: 'insideBottom',
                    offset: -10,
                    fill: colors.textMuted,
                    fontSize: 13,
                  }}
                />
                <YAxis
                  stroke={colors.axisColor}
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  label={{
                    value: 'Value',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: colors.textMuted,
                    fontSize: 13,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.tooltipBackground,
                    border: `1px solid ${colors.tooltipBorder}`,
                    borderRadius: '8px',
                    color: colors.tooltipText,
                    padding: '8px 12px',
                  }}
                  formatter={(value: any) =>
                    value !== null ? value.toFixed(2) : 'N/A'
                  }
                />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{
                    color: colors.textSecondary,
                    paddingTop: '20px',
                    fontSize: '13px',
                  }}
                  iconType="line"
                  iconSize={18}
                />
                <Line
                  type="monotone"
                  dataKey="daysNew"
                  name="Days (New Form)"
                  stroke={colors.daysNew}
                  strokeWidth={2}
                  dot={{ fill: colors.daysNew, r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="daysUpdate"
                  name="Days (Update)"
                  stroke={colors.daysUpdate}
                  strokeWidth={2}
                  dot={{ fill: colors.daysUpdate, r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="effort"
                  name="Effort (hours)"
                  stroke={colors.effort}
                  strokeWidth={2}
                  dot={{ fill: colors.effort, r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
