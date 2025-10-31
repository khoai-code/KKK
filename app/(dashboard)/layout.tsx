import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
