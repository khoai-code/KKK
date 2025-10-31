'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  Trash2,
  Calendar,
  FolderOpen,
  Loader2,
  LogOut,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface ReportHistoryItem {
  id: string;
  client_name: string;
  folder_id: string;
  report_type: string;
  report_content: string;
  generated_at: string;
  file_name: string | null;
}

interface ReportsClientProps {
  user: User;
}

export function ReportsClient({ user }: ReportsClientProps) {
  const router = useRouter();
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<ReportHistoryItem | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('reports_history')
        .select('*')
        .order('generated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleDownload = (report: ReportHistoryItem) => {
    const blob = new Blob([report.report_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = report.file_name || `${report.client_name.replace(/[^a-z0-9]/gi, '_')}_${new Date(report.generated_at).toISOString().split('T')[0]}.txt`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(reportId);
      const supabase = createClient();

      const { error: deleteError } = await supabase
        .from('reports_history')
        .delete()
        .eq('id', reportId);

      if (deleteError) {
        throw deleteError;
      }

      // Remove from local state
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Error deleting report:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getReportTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      full: {
        label: 'Full Report',
        className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50',
      },
      summary: {
        label: 'Summary',
        className: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50',
      },
      custom: {
        label: 'Custom',
        className: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/50',
      },
    };

    const badge = badges[type] || badges.custom;
    return (
      <Badge variant="outline" className={badge.className}>
        {badge.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--color-background))] to-[hsl(var(--color-muted)_/_0.2)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar onSignOut={handleSignOut} onCollapseChange={setSidebarCollapsed} />
      </div>

      {/* Top Bar - Hidden on mobile */}
      <div className="hidden lg:block">
        <TopBar user={user} sidebarCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b bg-[hsl(var(--color-card))]/95 backdrop-blur-sm px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo size="sm" className="rounded-lg" />
          <h1 className="text-base font-bold">Reports History</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 lg:mt-16 mt-14 p-4 lg:p-8 min-h-screen transition-all duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Reports History</h1>
                <p className="text-[hsl(var(--color-muted-foreground))]">
                  View and manage your AI-generated client reports
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          {!loading && !error && (
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-[hsl(var(--color-muted-foreground))]">Total Reports</p>
                    <p className="text-3xl font-bold text-[hsl(var(--color-primary))]">{reports.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-[hsl(var(--color-muted-foreground))]">This Month</p>
                    <p className="text-3xl font-bold text-[hsl(var(--color-primary))]">
                      {reports.filter(r => {
                        const reportDate = new Date(r.generated_at);
                        const now = new Date();
                        return reportDate.getMonth() === now.getMonth() &&
                               reportDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-[hsl(var(--color-muted-foreground))]">Last Generated</p>
                    <p className="text-lg font-semibold">
                      {reports.length > 0 ? formatDate(reports[0].generated_at).split(',')[0] : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--color-primary))]" />
              <p className="text-[hsl(var(--color-muted-foreground))]">Loading reports...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && reports.length === 0 && (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-[hsl(var(--color-muted-foreground))] opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
                <p className="text-[hsl(var(--color-muted-foreground))] mb-6">
                  Generate your first AI report by searching for a client and clicking "Generate AI Report"
                </p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))]"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reports List */}
          {!loading && !error && reports.length > 0 && (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-xl">{report.client_name}</CardTitle>
                          {getReportTypeBadge(report.report_type)}
                        </div>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-4 w-4" />
                            {report.folder_id}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(report.generated_at)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(report.id)}
                          disabled={deletingId === report.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          {deletingId === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Report Viewing Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--color-card))] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">{viewingReport.client_name}</h2>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                  Generated on {formatDate(viewingReport.generated_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(viewingReport)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingReport(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {viewingReport.report_content}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setViewingReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
