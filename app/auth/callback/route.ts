import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  // Create response object to properly set cookies
  let response = NextResponse.redirect(`${origin}/dashboard`);

  if (code) {
    const supabase = createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Set cookie in both request and response
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            // Remove cookie from both request and response
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // If OAuth login successful, ensure user profile exists
    if (data?.user) {
      const supabaseAdmin = createClient(
        getSupabaseUrl(),
        getSupabaseServiceRoleKey()
      );

      // Check if user profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Create user profile if it doesn't exist
      if (!existingProfile) {
        await supabaseAdmin.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          last_login: new Date().toISOString(),
        });
      } else {
        // Update last login
        await supabaseAdmin
          .from('user_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      }
    }
  }

  // Return response with cookies properly set
  return response;
}
