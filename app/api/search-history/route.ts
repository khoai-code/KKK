import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch user's recent search history (last 5)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch last 5 searches for this user, ordered by most recent
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching search history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ searches: data || [] });
  } catch (error) {
    console.error('Error in GET /api/search-history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add or update a search in history
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { clientFolderId, clientName } = body;

    if (!clientFolderId || !clientName) {
      return NextResponse.json(
        { error: 'clientFolderId and clientName are required' },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this search already exists
    const { data: existing } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('client_folder_id', clientFolderId)
      .maybeSingle();

    if (existing) {
      // Delete and re-insert to update timestamp (workaround for Supabase type issue)
      await supabase
        .from('search_history')
        .delete()
        .eq('id', (existing as any).id);

      // Fall through to insert below
    }

    // Insert new record (or reinsert if existed)
    {
      // Get current count of searches
      const { count } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // If we have 5 or more, delete the oldest one
      if (count && count >= 5) {
        const { data: oldest } = await supabase
          .from('search_history')
          .select('id')
          .eq('user_id', user.id)
          .order('searched_at', { ascending: true })
          .limit(1)
          .single();

        if (oldest) {
          await supabase.from('search_history').delete().eq('id', (oldest as any).id);
        }
      }

      // Insert new search
      const { data, error } = await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          client_folder_id: clientFolderId,
          client_name: clientName,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error inserting search history:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }
  } catch (error) {
    console.error('Error in POST /api/search-history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove search from history
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (clearAll) {
      // Delete all search history for this user
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing search history:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'All history cleared' });
    } else if (searchId) {
      // Delete specific search
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', searchId)
        .eq('user_id', user.id); // Ensure user owns this search

      if (error) {
        console.error('Error deleting search history:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Search removed' });
    } else {
      return NextResponse.json(
        { error: 'Either id or clearAll parameter is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/search-history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
