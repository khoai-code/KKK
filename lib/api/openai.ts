/**
 * OpenAI API Integration for AI-Powered Report Generation
 */

import { ClientContextResponse } from '@/lib/types/api.types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPEN_API_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generate AI-powered client summary report
 */
export async function generateClientReport(
  folderName: string,
  data: ClientContextResponse
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const systemPrompt = `You are an internal operations analyst for a fund digitization team. Your main product is fund subscription form implementation (new funds). Generate a strategic client report analyzing the provided data.

IMPORTANT CONTEXT:
- New Builds = Fund implementations (our core product). Each represents a complete fund subscription form
- Updates = Enhancement batches sent by clients across ALL their funds (Fund A may have 5 updates, Fund B may have 10, total shown is cumulative)
- The client name is the organization; individual fund names in historical data are examples of funds implemented, NOT the entire client profile
- IDM and Integration Hub are value-added services that create dependencies when updating sub-docs

Generate 5 sections (200-250 words total):
1. Executive Summary: Strategic overview of client engagement and fund implementation activity
2. Digitization Pipeline: Breakdown of fund implementations vs. cumulative updates across all funds, plus value-added services (IDM/Integration/Import/Export)
3. Fund Portfolio Insights: Comment on fund distribution, complexity trends, and digitization approach (Blueprint vs. Checklist)
4. Performance Trends: Delivery efficiency for new funds and update turnaround times; identify improvements or concerns
5. Operational Notes: If IDM or Integration services exist, include alert: "When updating sub-docs, coordinate with squad to review mapping impacts (Integration workflow/templates and IDM cross-fund mappings). DO should verify during review."

Use concrete data. Avoid markdown symbols (#, **). Use plain text with section labels followed by colons. Be specific and actionable for internal operations team.`;

  const userPrompt = buildClientReportPrompt(folderName, data);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const result: ChatCompletionResponse = await response.json();
    const report = result.choices[0]?.message?.content;

    if (!report) {
      throw new Error('No report content generated');
    }

    return report;
  } catch (error) {
    console.error('Error generating AI report:', error);
    throw error;
  }
}

/**
 * Build the client report prompt from context data
 */
function buildClientReportPrompt(
  folderName: string,
  data: ClientContextResponse
): string {
  const { basicInfo, projectCounts, performanceMetrics, recentActivities } = data;

  // Get all funds implemented for this client
  const allFunds = basicInfo && basicInfo.length > 0 ? basicInfo : [];
  const fundCount = allFunds.length;
  const latest = allFunds[0] || null;

  // Get digitization versions used across funds
  const digitizationVersions = [...new Set(allFunds.map(f => f.digitization_process_version).filter(Boolean))];

  // Get complexity distribution
  const complexityDistribution = allFunds.reduce((acc: Record<string, number>, fund) => {
    const level = fund.complexity_level || 'Unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  // Calculate project totals
  const totalProjects =
    (projectCounts?.new_build_count || 0) +
    (projectCounts?.update_count || 0) +
    (projectCounts?.export_count || 0) +
    (projectCounts?.import_count || 0) +
    (projectCounts?.idm_count || 0) +
    (projectCounts?.integration_count || 0);

  // Check for value-added services
  const hasIDM = (projectCounts?.idm_count || 0) > 0;
  const hasIntegration = (projectCounts?.integration_count || 0) > 0;

  // Format performance metrics with trend analysis
  const performanceSummary = performanceMetrics
    ?.slice(0, 6)
    .map(
      (m) =>
        `- ${m.year_month}: ${m.avg_effort_new_form ? m.avg_effort_new_form.toFixed(1) : 'N/A'} hrs effort, ${m.avg_days_new_form ? m.avg_days_new_form.toFixed(1) : 'N/A'} days (new fund), ${m.avg_days_update ? m.avg_days_update.toFixed(1) : 'N/A'} days (updates)`
    )
    .join('\n');

  // Format recent activities with better context
  const activitiesSummary = recentActivities
    ?.slice(0, 5)
    .map(
      (a) =>
        `- ${a.name || 'Unnamed task'} (${a.fund_name || 'Unknown fund'}): ${a.complexity_level || 'Unknown'} complexity`
    )
    .join('\n');

  // Generate fund examples for context
  const fundExamples = allFunds.slice(0, 3).map(f => f.fund_name).join(', ');

  return `Generate an internal operations report for CLIENT: ${folderName}

CLIENT CONTEXT:
- Organization: ${folderName} (the actual client entity)
- Key Contact: ${latest?.partner || 'N/A'}
- Primary Law Firm: ${latest?.law_firm || 'N/A'}
- Fund Administrator: ${latest?.fund_admin || 'N/A'}
- Investment Focus: ${latest?.investment_type || 'N/A'}

FUND PORTFOLIO:
- Total Funds Implemented: ${fundCount} fund${fundCount !== 1 ? 's' : ''}
- Example Funds: ${fundExamples || 'N/A'}
- Digitization Approach: ${digitizationVersions.join(' and ') || 'N/A'}
- Complexity Breakdown: ${Object.entries(complexityDistribution).map(([level, count]) => `${count} ${level}`).join(', ')}
- Typical Engagement Type: ${latest?.fund_engagement || 'N/A'}

DIGITIZATION PIPELINE (Total: ${totalProjects} activities):
- Fund Implementations (New Builds): ${projectCounts?.new_build_count || 0} - Each is a complete fund subscription form
- Cumulative Updates: ${projectCounts?.update_count || 0} - Total update batches across ALL ${fundCount} fund${fundCount !== 1 ? 's' : ''} (not per-fund)
- Data Services: ${projectCounts?.export_count || 0} exports, ${projectCounts?.import_count || 0} imports
- Value-Added Services: ${projectCounts?.idm_count || 0} IDM projects, ${projectCounts?.integration_count || 0} Integration Hub projects

PERFORMANCE TRENDS (Last 6 months):
${performanceSummary || 'No performance data available'}

RECENT ACTIVITY:
${activitiesSummary || 'No recent activities'}

IMPORTANT FLAGS:
${hasIDM || hasIntegration ? `- CLIENT HAS ${hasIDM ? 'IDM' : ''}${hasIDM && hasIntegration ? ' AND ' : ''}${hasIntegration ? 'INTEGRATION HUB' : ''} SERVICES` : '- No mapping services detected'}

Generate a 200-250 word report with these sections:
1. Executive Summary: Overall client relationship and fund implementation volume
2. Digitization Pipeline: Fund implementations vs. update activity ratio, value-added services
3. Fund Portfolio Insights: Complexity trends, digitization approach, fund types
4. Performance Trends: Efficiency metrics, improvement areas, bottlenecks
5. Operational Notes: ${hasIDM || hasIntegration ? 'MUST include mapping coordination alert for sub-doc updates' : 'General operational considerations'}

Use plain text. No markdown. Section labels followed by colons.`;
}

/**
 * Generate a quick AI summary (shorter version)
 */
export async function generateQuickSummary(
  folderName: string,
  data: ClientContextResponse
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const { basicInfo, projectCounts } = data;
  const latest = basicInfo && basicInfo.length > 0 ? basicInfo[0] : null;

  const totalProjects =
    (projectCounts?.new_build_count || 0) +
    (projectCounts?.update_count || 0) +
    (projectCounts?.export_count || 0) +
    (projectCounts?.import_count || 0) +
    (projectCounts?.idm_count || 0) +
    (projectCounts?.integration_count || 0);

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are a business analyst. Generate concise 2-3 sentence client summaries.',
    },
    {
      role: 'user',
      content: `Summarize client "${folderName}": ${latest?.investment_type || 'Unknown'} investment type, ${totalProjects} total projects (${projectCounts?.new_build_count || 0} new builds, ${projectCounts?.update_count || 0} updates), partner: ${latest?.partner || 'Unknown'}`,
    },
  ];

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result: ChatCompletionResponse = await response.json();
    return result.choices[0]?.message?.content || 'Summary not available';
  } catch (error) {
    console.error('Error generating quick summary:', error);
    throw error;
  }
}
