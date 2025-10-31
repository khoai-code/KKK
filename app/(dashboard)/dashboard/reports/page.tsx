import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ReportsClient } from './ReportsClient';

export default async function ReportsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <ReportsClient user={user} />;
}
