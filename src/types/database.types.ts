export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      checklists: {
        Row: {
          id: string;
          department: string;
          type: Database['public']['Enums']['ChecklistType'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          department: string;
          type: Database['public']['Enums']['ChecklistType'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          department?: string;
          type?: Database['public']['Enums']['ChecklistType'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          id: string;
          staff_number: string;
          name: string;
          role: Database['public']['Enums']['Role'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          staff_number: string;
          name: string;
          role: Database['public']['Enums']['Role'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          staff_number?: string;
          name?: string;
          role?: Database['public']['Enums']['Role'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          checklist_id: string;
          description: string;
          order_index: number;
          completed: boolean;
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          checklist_id: string;
          description: string;
          order_index: number;
          completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          checklist_id?: string;
          description?: string;
          order_index?: number;
          completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_checklist_id_fkey';
            columns: ['checklist_id'];
            isOneToOne: false;
            referencedRelation: 'checklists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_completed_by_fkey';
            columns: ['completed_by'];
            isOneToOne: false;
            referencedRelation: 'staff';
            referencedColumns: ['staff_number'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      ChecklistType: 'OPENING' | 'CLOSING';
      Role: 'TEAM_MEMBER' | 'MANAGER';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
