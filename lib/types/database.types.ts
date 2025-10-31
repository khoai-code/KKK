// Supabase Database Types

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          last_login: string | null;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          last_login?: string | null;
        };
      };
      search_history: {
        Row: {
          id: string;
          user_id: string;
          client_name: string;
          folder_id: string;
          searched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_name: string;
          folder_id: string;
          searched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_name?: string;
          folder_id?: string;
          searched_at?: string;
        };
      };
      cached_client_data: {
        Row: {
          id: string;
          folder_id: string;
          client_name: string;
          table_1_data: any | null;
          table_2_data: any | null;
          table_3_data: any | null;
          table_4_data: any | null;
          ai_summary: string | null;
          cached_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          folder_id: string;
          client_name: string;
          table_1_data?: any | null;
          table_2_data?: any | null;
          table_3_data?: any | null;
          table_4_data?: any | null;
          ai_summary?: string | null;
          cached_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          folder_id?: string;
          client_name?: string;
          table_1_data?: any | null;
          table_2_data?: any | null;
          table_3_data?: any | null;
          table_4_data?: any | null;
          ai_summary?: string | null;
          cached_at?: string;
          expires_at?: string;
        };
      };
    };
  };
}
