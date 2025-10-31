import { createServerClient } from '@/lib/supabase/server';
import { getClientByFolderId } from '@/lib/api/google-sheets';
import { ClientDetailsPage } from './ClientDetailsPage';
import { redirect } from 'next/navigation';

interface ClientPageProps {
  params: {
    folderId: string;
  };
  searchParams: {
    name?: string;
    action?: string;
  };
}

export default async function ClientPage({ params, searchParams }: ClientPageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { folderId } = await params;
  const resolvedSearchParams = await searchParams;
  let folderName = resolvedSearchParams.name;

  // If no name provided, try to fetch from Google Sheets
  if (!folderName) {
    const client = await getClientByFolderId(folderId);
    if (client) {
      folderName = client.folder_name;
    }
  }

  if (!folderName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--color-background))] to-[hsl(var(--color-muted)_/_0.2)]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Client Not Found</h1>
          <p className="text-[hsl(var(--color-muted-foreground))]">
            The client with folder ID {folderId} was not found.
          </p>
        </div>
      </div>
    );
  }

  return <ClientDetailsPage folderId={folderId} folderName={folderName} action={resolvedSearchParams.action} />;
}
