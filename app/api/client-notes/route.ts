import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const clientFolderId = searchParams.get('clientFolderId');

    if (!clientFolderId) {
      return NextResponse.json(
        { error: 'clientFolderId is required' },
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

    // Fetch the note for this user and client
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('client_folder_id', clientFolderId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching note:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: (data as any)?.note || '' });
  } catch (error) {
    console.error('Error in GET /api/client-notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { clientFolderId, clientName, note } = body;

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

    // Upsert the note (insert if new, update if exists)
    const { data, error } = await supabase
      .from('client_notes')
      .upsert(
        {
          user_id: user.id,
          client_folder_id: clientFolderId,
          client_name: clientName,
          note: note || '',
          updated_at: new Date().toISOString(),
        } as any,
        {
          onConflict: 'user_id,client_folder_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting note:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in POST /api/client-notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
