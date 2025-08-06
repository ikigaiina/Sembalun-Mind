export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  preferences?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  progress?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  is_guest?: boolean;
}