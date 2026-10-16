export interface Student {
  id: number;
  student_id: string;
  name: string;
  dob: string;
  email: string | null;
  phone: string | null;
  course: string | null;
  address: string | null;
  enrollment_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentFormData {
  name: string;
  dob: string;
  email: string;
  phone: string;
  course: string;
  address: string;
  enrollment_date: string;
}

export interface StudentFilterParams {
  search?: string;
  course?: string;
  dob_from?: string;
  dob_to?: string;
  page?: number;
  limit?: number;
}

export interface StudentListResponse {
  items: Student[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DashboardMetrics {
  total_students: number;
  courses_represented: number;
  contact_count: number;
  course_distribution: { name: string; count: number }[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  status?: 'success' | 'error' | 'loading';
  sourcesCount?: number;
}

export interface BackendHealth {
  connected: boolean;
  statusText: string;
  apiUrl: string;
  totalStudents?: number;
  checkedAt?: string;
  error?: string;
}
