import {
  ClientBasicInfo,
  ProjectCounts,
  PerformanceMetric,
  RecentActivity,
} from '@/lib/types/api.types';

/**
 * ClickHouse API Client with 24hr Caching
 * Connects to ClickHouse analytics database for client metrics
 */

const CLICKHOUSE_API_URL = process.env.CLICKHOUSE_API_URL;
const CLICKHOUSE_AUTH_BASIC = process.env.CLICKHOUSE_AUTH_BASIC;
const CLICKHOUSE_CF_CLIENT_ID = process.env.CLICKHOUSE_CF_CLIENT_ID;
const CLICKHOUSE_CF_CLIENT_SECRET = process.env.CLICKHOUSE_CF_CLIENT_SECRET;
const CLICKHOUSE_ACCOUNT_NAME = process.env.CLICKHOUSE_ACCOUNT_NAME;
const CLICKHOUSE_ACCOUNT_PASSWORD = process.env.CLICKHOUSE_ACCOUNT_PASSWORD;

if (!CLICKHOUSE_API_URL || !CLICKHOUSE_AUTH_BASIC) {
  console.warn('ClickHouse configuration missing');
}

// In-memory cache with 24hr expiry
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get data from cache if valid
 */
function getFromCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  console.log(`[ClickHouse Cache] HIT for key: ${key}`);
  return entry.data;
}

/**
 * Store data in cache
 */
function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`[ClickHouse Cache] SET for key: ${key}`);
}

/**
 * Execute a ClickHouse SQL query with FORMAT JSON
 * Includes retry logic for Cloudflare challenges and Basic Auth fallback
 */
async function executeQuery<T>(query: string, retries = 3): Promise<T[]> {
  if (!CLICKHOUSE_API_URL) {
    throw new Error('ClickHouse configuration missing');
  }

  console.log('[ClickHouse] Executing query:', query.substring(0, 100) + '...');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 1️⃣ Try with Cloudflare Access headers first
      const cfResponse = await fetch(CLICKHOUSE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${CLICKHOUSE_AUTH_BASIC}`,
          'Content-Type': 'text/plain',
          'CF-Access-Client-Id': CLICKHOUSE_CF_CLIENT_ID || '',
          'CF-Access-Client-Secret': CLICKHOUSE_CF_CLIENT_SECRET || '',
        },
        body: query,
        cache: 'no-store',
      });

      if (!cfResponse.ok) {
        const errorText = await cfResponse.text();
        const isCloudflareChallenge =
          cfResponse.status === 403 &&
          (errorText.includes('Cloudflare') || errorText.includes('Just a moment'));

        if (isCloudflareChallenge) {
          console.warn(`[ClickHouse] Cloudflare Access blocked request (attempt ${attempt}/${retries}). Trying Basic Auth fallback...`);

          // 2️⃣ Fallback to Basic Auth with native ClickHouse credentials
          if (CLICKHOUSE_ACCOUNT_NAME && CLICKHOUSE_ACCOUNT_PASSWORD) {
            try {
              const basicAuthToken = Buffer.from(
                `${CLICKHOUSE_ACCOUNT_NAME}:${CLICKHOUSE_ACCOUNT_PASSWORD}`
              ).toString('base64');

              const basicResponse = await fetch(CLICKHOUSE_API_URL, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${basicAuthToken}`,
                  'Content-Type': 'text/plain',
                },
                body: query,
                cache: 'no-store',
              });

              if (basicResponse.ok) {
                console.log('[ClickHouse] ✅ Basic Auth fallback successful');
                const responseText = await basicResponse.text();
                console.log('[ClickHouse] Response length:', responseText.length);
                return parseClickHouseResponse<T>(responseText);
              } else {
                const basicErrorText = await basicResponse.text();
                console.error('[ClickHouse] Basic Auth also failed:', basicErrorText.substring(0, 500));
              }
            } catch (fallbackError) {
              console.error('[ClickHouse] Basic Auth fallback error:', fallbackError);
            }
          }

          // If fallback failed and we have retries left, wait and retry
          if (attempt < retries) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            console.warn(`[ClickHouse] Retrying in ${backoffMs}ms (attempt ${attempt}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }

          // Only throw after all retries exhausted
          console.error('[ClickHouse] All retry attempts exhausted for Cloudflare challenge');
          throw new Error('ClickHouse query failed: Cloudflare Access blocking requests');
        }

        // Non-Cloudflare error
        console.error('[ClickHouse] Query failed:', errorText.substring(0, 500));
        throw new Error(`ClickHouse query failed: ${cfResponse.status}`);
      }

      // Success with Cloudflare Access
      const responseText = await cfResponse.text();
      console.log('[ClickHouse] Response length:', responseText.length);
      return parseClickHouseResponse<T>(responseText);

    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.warn(`[ClickHouse] Request failed, retrying in ${backoffMs}ms (attempt ${attempt}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  throw new Error('ClickHouse query failed after all retries');
}

/**
 * Parse ClickHouse JSON response
 */
function parseClickHouseResponse<T>(responseText: string): T[] {
  try {
    const jsonResponse = JSON.parse(responseText);

    // ClickHouse JSON format returns { data: [...] }
    if (jsonResponse.data) {
      return jsonResponse.data as T[];
    }

    // If it's already an array, return it
    if (Array.isArray(jsonResponse)) {
      return jsonResponse as T[];
    }

    return [];
  } catch (error) {
    console.error('[ClickHouse] Failed to parse JSON response:', error);
    console.error('[ClickHouse] Response text:', responseText.substring(0, 500));
    throw new Error('Failed to parse ClickHouse JSON response');
  }
}

/**
 * Get date filter based on time range
 */
function getDateFilter(timeRange: 'current_year' | 'two_years' | 'all_time'): string {
  switch (timeRange) {
    case 'current_year':
      return "due_date >= '2025-01-01' AND due_date <= CURRENT_DATE()";
    case 'two_years':
      return "due_date >= DATE_TRUNC('year', CURRENT_DATE()) - INTERVAL '1 year' AND due_date <= CURRENT_DATE()";
    case 'all_time':
      return "due_date >= '2024-01-01' AND due_date <= CURRENT_DATE()";
    default:
      return "due_date >= '2025-01-01' AND due_date <= CURRENT_DATE()";
  }
}

/**
 * Get basic client information (Query 1 from template)
 */
export async function getClientBasicInfo(
  folderName: string,
  timeRange: 'current_year' | 'two_years' | 'all_time' = 'current_year'
): Promise<ClientBasicInfo[]> {
  const escapedName = folderName.replace(/'/g, "''");
  const dateFilter = getDateFilter(timeRange);

  const query = `
SELECT
    entity_to_create_fund, id as clickup_id,
    fund_name, law_firm, fund_admin, partner,
    investment_type, fund_structure, fund_engagement, complexity_level, year_month,
    CASE
        WHEN digitization_process_version = 'V3 - Blueprint' THEN 'Blueprint'
        WHEN digitization_process_version = 'V2 (No Form Structure)' THEN 'Checklist'
        ELSE digitization_process_version
    END AS digitization_process_version,
    CASE
        WHEN form_id IS NOT NULL THEN
            'https://portal.anduin.app/pantheon/form/' || form_id || '/build'
        ELSE NULL
    END AS form_link
FROM dbt_int.int_digitization_consolidate
WHERE
  entity_to_create_fund = '${escapedName}'
  AND entity_to_create_fund <> '#Non digitization tasks'
  AND status IN ('done', 'completed')
  AND task_group NOT IN ('TBC')
  AND ${dateFilter}
  AND task_group = 'New Form'
  AND row_num = 1
  AND status NOT IN ('paused', 'cancelled')
ORDER BY due_date ASC
FORMAT JSON
`;

  return executeQuery<ClientBasicInfo>(query);
}

/**
 * Get project volume counts (Query 2 from template)
 */
export async function getProjectCounts(
  folderName: string,
  timeRange: 'current_year' | 'two_years' | 'all_time' = 'current_year'
): Promise<ProjectCounts | null> {
  const escapedName = folderName.replace(/'/g, "''");

  // For project counts, use start_date with dynamic filtering
  let dateFilter: string;
  switch (timeRange) {
    case 'current_year':
      dateFilter = "start_date >= '2025-01-01'";
      break;
    case 'two_years':
      dateFilter = "start_date >= DATE_TRUNC('year', CURRENT_DATE()) - INTERVAL '1 year'";
      break;
    case 'all_time':
      dateFilter = "start_date >= '2024-01-01'";
      break;
    default:
      dateFilter = "start_date >= '2025-01-01'";
  }

  const query = `
SELECT
    entity_to_create_fund,
    -- Main metrics: use dynamic date filter based on timeRange
    COUNT(DISTINCT CASE
        WHEN task_group = 'New Form'
             AND ${dateFilter}
        THEN id END) AS new_build_count,
    COUNT(DISTINCT CASE
        WHEN task_group = 'Update'
             AND ${dateFilter}
        THEN id END) AS update_count,
    COUNT(DISTINCT CASE
        WHEN task_group = 'Export'
             AND ${dateFilter}
        THEN id END) AS export_count,
    COUNT(DISTINCT CASE
        WHEN task_group = 'Import'
             AND ${dateFilter}
        THEN id END) AS import_count,
    -- Special metrics: always use hardcoded 2024-01-01 date
    COUNT(DISTINCT CASE
        WHEN task_group = 'IDM'
             AND start_date >= '2024-01-01'
        THEN id END) AS idm_count,
    COUNT(DISTINCT CASE
        WHEN task_group = 'Integration'
             AND start_date >= '2024-01-01'
        THEN id END) AS integration_count
FROM dbt_int.int_digitization_consolidate
WHERE entity_to_create_fund = '${escapedName}'
  AND entity_to_create_fund <> '#Non digitization tasks'
  AND status IN ('done', 'completed')
  AND task_group NOT IN ('TBC')
  AND status NOT IN ('paused', 'cancelled')
GROUP BY entity_to_create_fund
ORDER BY entity_to_create_fund
FORMAT JSON
`;

  const results = await executeQuery<ProjectCounts>(query);
  return results[0] || null;
}

/**
 * Get performance metrics (Query 3 from template)
 */
export async function getPerformanceMetrics(
  folderName: string,
  timeRange: 'current_year' | 'two_years' | 'all_time' = 'current_year'
): Promise<PerformanceMetric[]> {
  const escapedName = folderName.replace(/'/g, "''");
  const dateFilter = getDateFilter(timeRange);

  const query = `
SELECT
    entity_to_create_fund, year_month,
    AVG(CASE WHEN task_group = 'New Form' THEN form_building_squad_total_effort END) AS avg_effort_new_form,
    AVG(CASE WHEN task_group = 'New Form' THEN actual_days_to_dlv END) AS avg_days_new_form,
    AVG(CASE WHEN task_group = 'Update' THEN actual_days_to_dlv END) AS avg_days_update
FROM dbt_int.int_digitization_consolidate
WHERE entity_to_create_fund = '${escapedName}'
  AND entity_to_create_fund <> '#Non digitization tasks'
  AND status IN ('done', 'completed')
  AND task_group NOT IN ('TBC')
  AND ${dateFilter}
  AND status NOT IN ('paused', 'cancelled')
GROUP BY entity_to_create_fund, year_month
ORDER BY entity_to_create_fund
FORMAT JSON
`;

  return executeQuery<PerformanceMetric>(query);
}

/**
 * Get recent activities (Query 4 from template)
 */
export async function getRecentActivities(
  folderName: string,
  timeRange: 'current_year' | 'two_years' | 'all_time' = 'current_year'
): Promise<RecentActivity[]> {
  const escapedName = folderName.replace(/'/g, "''");
  const dateFilter = getDateFilter(timeRange);

  const query = `
SELECT DISTINCT
    id as clickup_id, fund_name, name, complexity_level, due_date
FROM dbt_int.int_digitization_consolidate
WHERE entity_to_create_fund = '${escapedName}'
  AND entity_to_create_fund <> '#Non digitization tasks'
  AND status IN ('done', 'completed')
  AND task_group NOT IN ('TBC')
  AND ${dateFilter}
  AND status NOT IN ('paused', 'cancelled')
  AND NOT (task_group = 'Validation' AND no_request_during_validation = 'true')
ORDER BY due_date DESC
LIMIT 5
FORMAT JSON
`;

  return executeQuery<RecentActivity>(query);
}

/**
 * Get all client context data with 24hr caching
 */
export async function getClientContextData(
  folderName: string,
  timeRange: 'current_year' | 'two_years' | 'all_time' = 'current_year',
  useCache: boolean = true
) {
  const cacheKey = `client_context:${folderName}:${timeRange}`;

  // Check cache first
  if (useCache) {
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  console.log('[ClickHouse Cache] MISS for key:', cacheKey);
  console.log('[ClickHouse] Fetching fresh data for:', folderName, 'with time range:', timeRange);

  try {
    // Execute all 4 queries in parallel with time range filter
    const [basicInfo, projectCounts, performanceMetrics, recentActivities] =
      await Promise.all([
        getClientBasicInfo(folderName, timeRange),
        getProjectCounts(folderName, timeRange),
        getPerformanceMetrics(folderName, timeRange),
        getRecentActivities(folderName, timeRange),
      ]);

    const result = {
      basicInfo,
      projectCounts,
      performanceMetrics,
      recentActivities,
    };

    // Store in cache
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error('[ClickHouse] Error fetching client context data:', error);
    throw error;
  }
}

/**
 * Clear cache for a specific client
 */
export function clearClientCache(folderName: string): void {
  const cacheKey = `client_context:${folderName}`;
  cache.delete(cacheKey);
  console.log('[ClickHouse Cache] CLEARED for key:', cacheKey);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
  console.log('[ClickHouse Cache] CLEARED ALL');
}
