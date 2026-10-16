import axios from 'axios';
import {
  Student,
  StudentFormData,
  StudentFilterParams,
  StudentListResponse,
  DashboardMetrics,
} from '../types/student';

const api = axios.create({ baseURL: '/api' });

export const INITIAL_STUDENT_RECORDS: Student[] = [
  {
    id: 1,
    student_id: 'STU-1001',
    name: 'Aarav Sharma',
    dob: '2004-05-14',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    course: 'Computer Science & Engineering',
    address: '42 Tech Park Road, Bengaluru',
    enrollment_date: '2024-08-01',
  },
  {
    id: 2,
    student_id: 'STU-1002',
    name: 'Priya Nair',
    dob: '2005-02-22',
    email: 'priya.nair@example.com',
    phone: '+91 98123 45678',
    course: 'Data Science & AI',
    address: '15 Marine Drive, Kochi',
    enrollment_date: '2024-08-05',
  },
  {
    id: 3,
    student_id: 'STU-1003',
    name: 'Rohan Deshmukh',
    dob: '2003-11-09',
    email: 'rohan.d@example.com',
    phone: '+91 97654 32109',
    course: 'Information Technology',
    address: '88 Shivaji Nagar, Pune',
    enrollment_date: '2023-08-12',
  },
  {
    id: 4,
    student_id: 'STU-1004',
    name: 'Ananya Mukherjee',
    dob: '2006-01-30',
    email: 'ananya.m@example.com',
    phone: '+91 99012 34567',
    course: 'Electronics & Communication',
    address: '12 Salt Lake Sector V, Kolkata',
    enrollment_date: '2025-01-10',
  },
  {
    id: 5,
    student_id: 'STU-1005',
    name: 'Vikramaditya Verma',
    dob: '2004-09-18',
    email: 'vikram.verma@example.com',
    phone: '+91 91234 56789',
    course: 'Computer Science & Engineering',
    address: '55 Gomti Nagar, Lucknow',
    enrollment_date: '2024-08-01',
  },
  {
    id: 6,
    student_id: 'STU-1006',
    name: 'Meera Patel',
    dob: '2005-07-04',
    email: 'meera.patel@example.com',
    phone: '+91 98450 12345',
    course: 'Business Analytics',
    address: '24 Ashram Road, Ahmedabad',
    enrollment_date: '2024-08-15',
  },
  {
    id: 7,
    student_id: 'STU-1007',
    name: 'Kabir Sen',
    dob: '2003-04-12',
    email: 'kabir.sen@example.com',
    phone: '+91 98301 23456',
    course: 'Mechanical Engineering',
    address: '77 Park Circus, Kolkata',
    enrollment_date: '2023-08-10',
  },
  {
    id: 8,
    student_id: 'STU-1008',
    name: 'Sneha Kulkarni',
    dob: '2006-03-15',
    email: 'sneha.k@example.com',
    phone: '+91 97600 11223',
    course: 'Data Science & AI',
    address: '10 Kothrud, Pune',
    enrollment_date: '2025-01-15',
  },
].map((student) => ({
  ...student,
  created_at: `${student.enrollment_date}T09:00:00Z`,
  updated_at: `${student.enrollment_date}T09:00:00Z`,
}));

export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((entry: { msg?: string }) => entry.msg)
        .filter(Boolean)
        .join(' ');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An error occurred during the student records operation.';
}

export function getApiBaseUrl(): string {
  return '/api';
}

export function setApiBaseUrl(_url: string): void {}

async function getAllStudents(): Promise<Student[]> {
  const firstPage = await api.get<StudentListResponse>('/students', {
    params: { page: 1, limit: 100 },
  });
  const students = [...firstPage.data.items];
  for (let page = 2; page <= firstPage.data.total_pages; page += 1) {
    const response = await api.get<StudentListResponse>('/students', {
      params: { page, limit: 100 },
    });
    students.push(...response.data.items);
  }
  return students;
}

export const apiService = {
  async getStudents(
    params: StudentFilterParams = { page: 1, limit: 10 }
  ): Promise<StudentListResponse> {
    const response = await api.get<StudentListResponse>('/students', {
      params: {
        ...params,
        course: params.course === 'All Courses' ? undefined : params.course,
      },
    });
    return response.data;
  },

  async getStudentById(identifier: string | number): Promise<Student> {
    const response = await api.get<Student>(`/students/${encodeURIComponent(String(identifier))}`);
    return response.data;
  },

  async createStudent(formData: StudentFormData): Promise<Student> {
    const response = await api.post<Student>('/students', formData);
    return response.data;
  },

  async updateStudent(identifier: string | number, formData: StudentFormData): Promise<Student> {
    const response = await api.put<Student>(
      `/students/${encodeURIComponent(String(identifier))}`,
      formData
    );
    return response.data;
  },

  async patchStudent(
    identifier: string | number,
    partial: Partial<StudentFormData>
  ): Promise<Student> {
    const response = await api.patch<Student>(
      `/students/${encodeURIComponent(String(identifier))}`,
      partial
    );
    return response.data;
  },

  async deleteStudent(identifier: string | number): Promise<void> {
    await api.delete(`/students/${encodeURIComponent(String(identifier))}`);
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await api.get<DashboardMetrics>('/dashboard-metrics');
    return response.data;
  },

  async checkHealth(): Promise<{ status: string; total_students: number; database: string }> {
    const response = await api.get<{ status: string; total_students: number; database: string }>(
      '/health'
    );
    return response.data;
  },

  async resetToDefault(): Promise<void> {
    await api.put('/students/import', INITIAL_STUDENT_RECORDS);
  },

  async exportJSON(): Promise<string> {
    return JSON.stringify(await getAllStudents(), null, 2);
  },

  async exportCSV(): Promise<string> {
    const students = await getAllStudents();
    const headers = [
      'Student ID',
      'Name',
      'Date of Birth',
      'Course',
      'Email',
      'Phone',
      'Address',
      'Enrollment Date',
    ];
    const escapeCsvValue = (value: string | null | undefined) =>
      `"${(value || '').replace(/"/g, '""')}"`;
    const rows = students.map((student) =>
      [
        student.student_id,
        student.name,
        student.dob,
        student.course,
        student.email,
        student.phone,
        student.address,
        student.enrollment_date,
      ].map(escapeCsvValue)
    );
    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },

  async importJSON(jsonStr: string): Promise<number> {
    const parsed: unknown = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid format: Expected a JSON array of student objects.');
    }
    const response = await api.put<Student[]>('/students/import', parsed);
    return response.data.length;
  },
};
