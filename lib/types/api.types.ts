// Core API Types for Client Context Finder

export interface GoogleSheetRow {
  space_id: string;
  space_name: string;
  folder_name: string;
  folder_id: string;
}

export interface FuzzyMatchResult {
  item: GoogleSheetRow;
  score: number;
}

export interface ClientBasicInfo {
  entity_to_create_fund: string;
  clickup_id: string;
  fund_name: string;
  law_firm: string;
  fund_admin: string;
  partner: string;
  investment_type: string;
  fund_structure: string;
  fund_engagement: string;
  complexity_level: 'Light' | 'Medium' | 'Heavy' | 'Extreme Heavy';
  year_month: string;
  digitization_process_version?: string;
  form_link?: string | null;
}

export interface ProjectCounts {
  entity_to_create_fund: string;
  new_build_count: number;
  update_count: number;
  export_count: number;
  import_count: number;
  idm_count: number;
  integration_count: number;
}

export interface PerformanceMetric {
  entity_to_create_fund: string;
  year_month: string;
  avg_effort_new_form: number | null;
  avg_days_new_form: number | null;
  avg_days_update: number | null;
}

export interface RecentActivity {
  clickup_id: string;
  fund_name: string;
  name: string;
  complexity_level: 'Light' | 'Medium' | 'Heavy' | 'Extreme Heavy';
}

export interface ClientContextData {
  client_name: string;
  folder_id: string;
  basic_info: ClientBasicInfo[];
  project_counts: ProjectCounts;
  performance_metrics: PerformanceMetric[];
  recent_activities: RecentActivity[];
  ai_summary: string | null;
  cached_at: string;
}

// Data structure returned by ClickHouse API (camelCase for client components)
export interface ClientContextResponse {
  basicInfo: ClientBasicInfo[];
  projectCounts: ProjectCounts | null;
  performanceMetrics: PerformanceMetric[];
  recentActivities: RecentActivity[];
}

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  client_name: string;
  folder_id: string;
  searched_at: string;
}
