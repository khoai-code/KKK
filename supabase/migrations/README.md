# Supabase Migrations

## Overview

This folder contains SQL migration scripts for setting up the database tables required by the application.

## Available Migrations

1. **create_client_notes.sql** - Special Note feature for client profiles
2. **create_search_history.sql** - Search History feature for tracking recent searches

---

## Running the client_notes Migration

To enable the Special Note feature, you need to create the `client_notes` table in your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the contents of `create_client_notes.sql` into the editor
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project root directory
cd /path/to/Demo\ App\ -\ Client\ context\ finder

# Run the migration
supabase db push

# Or run the specific migration file
psql <your-database-connection-string> -f supabase/migrations/create_client_notes.sql
```

### What This Migration Creates

- **Table**: `client_notes` - Stores user-specific notes for each client
- **Columns**:
  - `id` (UUID) - Primary key
  - `user_id` (UUID) - References the user who created the note
  - `client_folder_id` (TEXT) - The folder ID of the client
  - `client_name` (TEXT) - The name of the client
  - `note` (TEXT) - The actual note content
  - `created_at` (TIMESTAMPTZ) - When the note was created
  - `updated_at` (TIMESTAMPTZ) - When the note was last updated
- **Index**: `idx_client_notes_user_client` - For fast lookups by user and client
- **RLS Policies**: Users can only view, insert, update, and delete their own notes

### Verifying the Migration

After running the migration, verify it was successful:

1. Go to **Table Editor** in Supabase dashboard
2. You should see a new table called `client_notes`
3. Check that RLS is enabled (there should be a shield icon next to the table name)
4. Go to **Authentication** → **Policies** and verify the 4 policies are created

### Testing the Feature

1. Navigate to any client detail page in the app
2. You should see a "Special Note" card
3. Type a note and it should auto-save after 1 second
4. You'll see "Saving..." followed by "✅ Saved"
5. Refresh the page - your note should persist
6. Notes are private to your user account

---

## Running the search_history Migration

To enable the Search History feature, you need to create the `search_history` table in your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the contents of `create_search_history.sql` into the editor
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Run the migration
supabase db push

# Or run the specific migration file
psql <your-database-connection-string> -f supabase/migrations/create_search_history.sql
```

### What This Migration Creates

- **Table**: `search_history` - Stores user's recent search history (last 5 searches)
- **Columns**:
  - `id` (UUID) - Primary key
  - `user_id` (UUID) - References the user who made the search
  - `client_folder_id` (TEXT) - The folder ID of the searched client
  - `client_name` (TEXT) - The name of the searched client
  - `searched_at` (TIMESTAMPTZ) - When the search was made
- **Index**: `idx_search_history_user_time` - For fast lookups by user and time
- **RLS Policies**: Users can only view, insert, update, and delete their own search history

### Verifying the Migration

After running the migration, verify it was successful:

1. Go to **Table Editor** in Supabase dashboard
2. You should see a new table called `search_history`
3. Check that RLS is enabled (there should be a shield icon next to the table name)
4. Go to **Authentication** → **Policies** and verify the 4 policies are created

### Testing the Feature

1. Navigate to the main dashboard page in the app
2. Search for a client by name
3. Select a client from the results
4. The search should be automatically saved to your history
5. Your recent searches will appear below the search bar as clickable pills
6. You can click the X button on any search pill to remove it from history
7. Searches are limited to the last 5 and are private to your user account

---

## Running All Migrations

To run all migrations at once, execute both SQL files in order:

1. `create_client_notes.sql`
2. `create_search_history.sql`

This will set up all the features in the application.
