'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, FileSpreadsheet, FileText, Download, X, Calendar, ChevronDown, Copy, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClientOverview } from '@/components/client/ClientOverview';
import { ProjectVolume } from '@/components/client/ProjectVolume';
import { PerformanceMetrics } from '@/components/client/PerformanceMetrics';
import { RecentActivities } from '@/components/client/RecentActivities';
import { SpecialNote } from '@/components/client/SpecialNote';
import { ClientDetailsSkeleton } from '@/components/client/ClientDetailsSkeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ClientContextData {
  basicInfo: any[];
  projectCounts: any;
  performanceMetrics: any[];
  recentActivities: any[];
}

interface ClientDetailsPageProps {
  folderId: string;
  folderName: string;
  action?: string;
}

type TimeRange = 'current_year' | 'two_years' | 'all_time';

export function ClientDetailsPage({ folderId, folderName, action }: ClientDetailsPageProps) {
  const [data, setData] = useState<ClientContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('current_year');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/client-context?folderName=${encodeURIComponent(folderName)}&timeRange=${timeRange}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch client data');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching client context:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [folderName, timeRange]);

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      setReportError(null);

      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName,
          folderId,
          reportType: 'full',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const result = await response.json();
      setReportContent(result.report);
      setShowReportModal(true);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error generating report:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCopyReport = async () => {
    if (!reportContent) return;

    try {
      await navigator.clipboard.writeText(reportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadReport = () => {
    if (!reportContent) return;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${folderName.replace(/[^a-z0-9]/gi, '_')}_client_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) {
      alert('Dashboard content not found. Please refresh the page and try again.');
      return;
    }

    try {
      setDownloadingPDF(true);

      // Get the dashboard element
      const element = dashboardRef.current;

      // Wait a bit to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the element as canvas with improved settings
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true, // Handle cross-origin images
        allowTaint: true, // Allow tainted canvas
        logging: false, // Disable console logs
        backgroundColor: '#ffffff',
        imageTimeout: 15000, // Wait up to 15s for images
        removeContainer: false,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Calculate PDF dimensions to fit content
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);

      // If content fits on one page
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Content spans multiple pages
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft > 0) {
          position = -(imgHeight - heightLeft);
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      // Generate filename with date
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${folderName.replace(/[^a-z0-9]/gi, '_')}_report_${timestamp}.pdf`;

      // Download the PDF
      pdf.save(filename);

      console.log('PDF generated successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to generate PDF: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--color-background))] to-[hsl(var(--color-muted)_/_0.2)]">
      {/* Header */}
      <header className="border-b bg-[hsl(var(--color-card))]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <div className="text-right">
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">Folder ID</p>
            <code className="text-sm font-mono">{folderId}</code>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Title and Time Range Filter */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{folderName}</h1>
              <p className="text-[hsl(var(--color-muted-foreground))]">
                Complete client context and analytics
              </p>
            </div>

            {/* Time Range Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {timeRange === 'current_year' && 'Current Year (2025)'}
                {timeRange === 'two_years' && 'Last 2 Years'}
                {timeRange === 'all_time' && 'All Time'}
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showTimeRangeDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] rounded-lg shadow-lg z-50">
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setTimeRange('current_year');
                        setShowTimeRangeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-[hsl(var(--color-muted))] transition-colors ${
                        timeRange === 'current_year' ? 'bg-[hsl(var(--color-muted))]' : ''
                      }`}
                    >
                      <div className="font-medium">Current Year (2025)</div>
                      <div className="text-xs text-[hsl(var(--color-muted-foreground))]">
                        From Jan 1, 2025 to today
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setTimeRange('two_years');
                        setShowTimeRangeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-[hsl(var(--color-muted))] transition-colors ${
                        timeRange === 'two_years' ? 'bg-[hsl(var(--color-muted))]' : ''
                      }`}
                    >
                      <div className="font-medium">Last 2 Years</div>
                      <div className="text-xs text-[hsl(var(--color-muted-foreground))]">
                        Rolling 2-year window
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setTimeRange('all_time');
                        setShowTimeRangeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-[hsl(var(--color-muted))] transition-colors ${
                        timeRange === 'all_time' ? 'bg-[hsl(var(--color-muted))]' : ''
                      }`}
                    >
                      <div className="font-medium">All Time</div>
                      <div className="text-xs text-[hsl(var(--color-muted-foreground))]">
                        From 2024 onwards
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && <ClientDetailsSkeleton />}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Report Generation Error */}
          {reportError && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Report Generation Error:</strong> {reportError}
              </AlertDescription>
            </Alert>
          )}

          {/* Data Display */}
          {!loading && !error && data && (
            <>
              <div ref={dashboardRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Overview - Full Width */}
                <div className="lg:col-span-2">
                  <ClientOverview data={data.basicInfo} />
                </div>

                {/* Special Note - Full Width */}
                <div className="lg:col-span-2">
                  <SpecialNote clientFolderId={folderId} clientName={folderName} />
                </div>

                {/* Project Volume */}
                <ProjectVolume data={data.projectCounts} />

                {/* Performance Metrics */}
                <PerformanceMetrics data={data.performanceMetrics} />

                {/* Recent Activities - Full Width */}
                <div className="lg:col-span-2">
                  <RecentActivities data={data.recentActivities} />
                </div>
              </div>

              {/* Action Buttons */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                    >
                      {downloadingPDF ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Download Report
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))]"
                      onClick={handleGenerateReport}
                      disabled={generatingReport}
                    >
                      {generatingReport ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          AI Generator
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && reportContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--color-card))] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">AI-Generated Client Report</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {reportContent}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setShowReportModal(false)}>
                Close
              </Button>
              <Button
                onClick={handleCopyReport}
                variant="outline"
                className="border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))]/10"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadReport}
                className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
