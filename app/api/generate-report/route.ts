/**
 * API Route: Generate AI Report
 * Generates an AI-powered client report based on ClickHouse data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientContextData } from '@/lib/api/clickhouse';
import { generateClientReport } from '@/lib/api/openai';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderName, reportType = 'full', folderId } = body;

    // Validate input
    if (!folderName) {
      return NextResponse.json(
        { error: 'folderName is required' },
        { status: 400 }
      );
    }

    console.log(`[AI Report] Generating ${reportType} report for:`, folderName);

    // Fetch client context data
    const data = await getClientContextData(folderName);

    // Validate that we have data
    if (!data.basicInfo || data.basicInfo.length === 0) {
      return NextResponse.json(
        {
          error: 'No client data found',
          message: `No data available for client: ${folderName}`,
        },
        { status: 404 }
      );
    }

    // Generate AI report
    console.log('[AI Report] Calling OpenAI API...');
    const report = await generateClientReport(folderName, data);

    console.log('[AI Report] Report generated successfully');

    // Save report to reports_history table
    try {
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && folderId) {
        const fileName = `${folderName.replace(/[^a-z0-9]/gi, '_')}_client_report.txt`;

        const { error: insertError } = await supabase
          .from('reports_history')
          .insert({
            user_id: user.id,
            client_name: folderName,
            folder_id: folderId,
            report_type: reportType,
            report_content: report,
            file_name: fileName,
          } as any);

        if (insertError) {
          console.error('[AI Report] Error saving to reports_history:', insertError);
          // Don't fail the request if saving to history fails
        } else {
          console.log('[AI Report] Saved to reports_history');
        }
      }
    } catch (saveError) {
      console.error('[AI Report] Error saving to reports_history:', saveError);
      // Don't fail the request if saving to history fails
    }

    return NextResponse.json({
      success: true,
      report,
      metadata: {
        folderName,
        reportType,
        generatedAt: new Date().toISOString(),
        dataPoints: {
          basicInfo: data.basicInfo.length,
          performanceMetrics: data.performanceMetrics?.length || 0,
          recentActivities: data.recentActivities?.length || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('[AI Report] Error generating report:', error);

    // Handle specific error types
    if (error.message?.includes('OpenAI API key')) {
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'OpenAI API is not properly configured',
        },
        { status: 500 }
      );
    }

    if (error.message?.includes('OpenAI API error')) {
      return NextResponse.json(
        {
          error: 'AI service error',
          message: 'Failed to generate report using AI service',
          details: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Report generation failed',
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/debugging
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/generate-report',
    method: 'POST',
    description: 'Generate AI-powered client reports',
    requiredFields: {
      folderName: 'string (required) - The client folder name',
      reportType: 'string (optional) - Type of report: "full" or "quick"',
    },
    example: {
      folderName: 'Example Client Name',
      reportType: 'full',
    },
  });
}
