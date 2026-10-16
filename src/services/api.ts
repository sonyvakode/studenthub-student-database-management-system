import {
  Student,
  StudentFormData,
  StudentFilterParams,
  StudentListResponse,
  DashboardMetrics,
} from '../types/student';

const STORAGE_KEY = 'studenthub_records_v1';

export const INITIAL_STUDENT_RECORDS: Student[] = [
  {
    id: 1,
    student_id: 'STU-1001',
    name: 'Aarav Sharma',
    dob: '2004-05-14',
    email: 'aarav.sharma@ewbedutech.edu',
    phone: '+91 98765 43210',
    course: 'Computer Science & Engineering',
    address: '42 Tech Park Road, Whitefield, Bengaluru',
    enrollment_date: '2024-08-01',
    created_at: '2024-08-01T09:00:00Z',
    updated_at: '2024-08-01T09:00:00Z',
  },
  {
    id: 2,
    student_id: 'STU-1002',
    name: 'Priya Nair',
    dob: '2005-02-22',
    email: 'priya.nair@ewbedutech.edu',
    phone: '+91 98123 45678',
    course: 'Data Science & AI',
    address: '15 Marine Drive, Kochi',
    enrollment_date: '2024-08-05',
    created_at: '2024-08-05T10:15:00Z',
    updated_at: '2024-08-05T10:15:00Z',
  },
  {
    id: 3,
    student_id: 'STU-1003',
    name: 'Rohan Deshmukh',
    dob: '2003-11-09',
    email: 'rohan.d@ewbedutech.edu',
    phone: '+91 97654 32109',
    course: 'Information Technology',
    address: '88 Shivaji Nagar, Pune',
    enrollment_date: '2023-08-12',
    created_at: '2023-08-12T11:30:00Z',
    updated_at: '2023-08-12T11:30:00Z',
  },
  {
    id: 4,
    student_id: 'STU-1004',
    name: 'Ananya Mukherjee',
    dob: '2006-01-30',
    email: 'ananya.m@ewbedutech.edu',
    phone: '+91 99012 34567',
    course: 'Electronics & Communication',
    address: '12 Salt Lake Sector V, Kolkata',
    enrollment_date: '2025-01-10',
    created_at: '2025-01-10T14:20:00Z',
    updated_at: '2025-01-10T14:20:00Z',
  },
  {
    id: 5,
    student_id: 'STU-1005',
    name: 'Vikramaditya Verma',
    dob: '2004-09-18',
    email: 'vikram.verma@ewbedutech.edu',
    phone: '+91 91234 56789',
    course: 'Computer Science & Engineering',
    address: '55 Gomti Nagar, Lucknow',
    enrollment_date: '2024-08-01',
    created_at: '2024-08-01T15:45:00Z',
    updated_at: '2024-08-01T15:45:00Z',
  },
  {
    id: 6,
    student_id: 'STU-1006',
    name: 'Meera Patel',
    dob: '2005-07-04',
    email: 'meera.patel@ewbedutech.edu',
    phone: '+91 98450 12345',
    course: 'Business Analytics',
    address: '24 Ashram Road, Ahmedabad',
    enrollment_date: '2024-08-15',
    created_at: '2024-08-15T09:10:00Z',
    updated_at: '2024-08-15T09:10:00Z',
  },
  {
    id: 7,
    student_id: 'STU-1007',
    name: 'Kabir Sen',
    dob: '2003-04-12',
    email: 'kabir.sen@ewbedutech.edu',
    phone: '+91 98301 23456',
    course: 'Mechanical Engineering',
    address: '77 Park Circus, Kolkata',
    enrollment_date: '2023-08-10',
    created_at: '2023-08-10T13:00:00Z',
    updated_at: '2023-08-10T13:00:00Z',
  },
  {
    id: 8,
    student_id: 'STU-1008',
    name: 'Sneha Kulkarni',
    dob: '2006-03-15',
    email: 'sneha.k@ewbedutech.edu',
    phone: '+91 97600 11223',
    course: 'Data Science & AI',
    address: '10 Kothrud, Pune',
    enrollment_date: '2025-01-15',
    created_at: '2025-01-15T16:00:00Z',
    updated_at: '2025-01-15T16:00:00Z',
  },
];

// Load all students from storage
function loadStoredStudents(): Student[] {
  if (typeof window === 'undefined') {
    return [...INITIAL_STUDENT_RECORDS];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENT_RECORDS));
      return [...INITIAL_STUDENT_RECORDS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENT_RECORDS));
    return [...INITIAL_STUDENT_RECORDS];
  } catch {
    return [...INITIAL_STUDENT_RECORDS];
  }
}

// Save students to storage
function saveStudents(students: Student[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save student records:', e);
    }
  }
}

// Auto-generate the next formatted student ID (STU-1009, etc.)
function generateNextStudentId(students: Student[]): string {
  let highest = 1000;
  for (const s of students) {
    if (s.student_id) {
      const match = s.student_id.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > highest) {
          highest = num;
        }
      }
    }
  }
  return `STU-${highest + 1}`;
}

export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An error occurred during student database operation.';
}

export function getApiBaseUrl(): string {
  return 'Local Persistent Storage';
}

export function setApiBaseUrl(_url: string): void {
  // No-op for clean local storage
}

export const apiService = {
  async getStudents(params: StudentFilterParams = { page: 1, limit: 10 }): Promise<StudentListResponse> {
    const all = loadStoredStudents();
    let filtered = [...all];

    // Filter by search query (name, student_id, email, phone, course)
    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      filtered = filtered.filter((s) => {
        return (
          (s.name && s.name.toLowerCase().includes(term)) ||
          (s.student_id && s.student_id.toLowerCase().includes(term)) ||
          (s.email && s.email.toLowerCase().includes(term)) ||
          (s.phone && s.phone.toLowerCase().includes(term)) ||
          (s.course && s.course.toLowerCase().includes(term))
        );
      });
    }

    // Filter by course
    if (params.course && params.course !== 'All Courses' && params.course.trim()) {
      const c = params.course.trim().toLowerCase();
      filtered = filtered.filter((s) => s.course && s.course.toLowerCase() === c);
    }

    // Filter by DOB from
    if (params.dob_from && params.dob_from.trim()) {
      filtered = filtered.filter((s) => s.dob >= params.dob_from!);
    }

    // Filter by DOB to
    if (params.dob_to && params.dob_to.trim()) {
      filtered = filtered.filter((s) => s.dob <= params.dob_to!);
    }

    // Sort newest first
    filtered.sort((a, b) => b.id - a.id);

    const total = filtered.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const skip = (page - 1) * limit;
    const items = filtered.slice(skip, skip + limit);
    const total_pages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      total,
      page,
      limit,
      total_pages,
    };
  },

  async getStudentById(identifier: string | number): Promise<Student> {
    const all = loadStoredStudents();
    const idStr = String(identifier).trim();
    const student = all.find((s) => String(s.id) === idStr || s.student_id === idStr);

    if (!student) {
      throw new Error(`Student with identifier '${identifier}' was not found.`);
    }
    return student;
  },

  async createStudent(formData: StudentFormData): Promise<Student> {
    const all = loadStoredStudents();

    const name = formData.name.trim();
    const dob = formData.dob.trim();
    const email = formData.email?.trim() || null;
    const phone = formData.phone?.trim() || null;
    const course = formData.course?.trim() || null;
    const address = formData.address?.trim() || null;
    const enrollment_date = formData.enrollment_date?.trim() || null;

    if (!name) {
      throw new Error('Full name is required.');
    }
    if (!dob) {
      throw new Error('Date of birth is required.');
    }
    if (!email && !phone) {
      throw new Error('At least one contact method (email or phone) is required.');
    }

    const nextId = all.length > 0 ? Math.max(...all.map((s) => s.id)) + 1 : 1;
    const nextStudentId = generateNextStudentId(all);
    const now = new Date().toISOString();

    const newStudent: Student = {
      id: nextId,
      student_id: nextStudentId,
      name,
      dob,
      email,
      phone,
      course,
      address,
      enrollment_date,
      created_at: now,
      updated_at: now,
    };

    all.unshift(newStudent);
    saveStudents(all);

    return newStudent;
  },

  async updateStudent(identifier: string | number, formData: StudentFormData): Promise<Student> {
    const all = loadStoredStudents();
    const idStr = String(identifier).trim();
    const index = all.findIndex((s) => String(s.id) === idStr || s.student_id === idStr);

    if (index === -1) {
      throw new Error(`Student with identifier '${identifier}' was not found.`);
    }

    const name = formData.name.trim();
    const dob = formData.dob.trim();
    const email = formData.email?.trim() || null;
    const phone = formData.phone?.trim() || null;
    const course = formData.course?.trim() || null;
    const address = formData.address?.trim() || null;
    const enrollment_date = formData.enrollment_date?.trim() || null;

    if (!name) {
      throw new Error('Full name is required.');
    }
    if (!dob) {
      throw new Error('Date of birth is required.');
    }
    if (!email && !phone) {
      throw new Error('At least one contact method (email or phone) is required.');
    }

    const existing = all[index];
    const updated: Student = {
      ...existing,
      name,
      dob,
      email,
      phone,
      course,
      address,
      enrollment_date,
      updated_at: new Date().toISOString(),
    };

    all[index] = updated;
    saveStudents(all);

    return updated;
  },

  async patchStudent(identifier: string | number, partial: Partial<StudentFormData>): Promise<Student> {
    const all = loadStoredStudents();
    const idStr = String(identifier).trim();
    const index = all.findIndex((s) => String(s.id) === idStr || s.student_id === idStr);

    if (index === -1) {
      throw new Error(`Student with identifier '${identifier}' was not found.`);
    }

    const existing = all[index];
    const updated: Student = {
      ...existing,
      ...partial,
      name: partial.name !== undefined ? partial.name.trim() : existing.name,
      dob: partial.dob !== undefined ? partial.dob.trim() : existing.dob,
      email: partial.email !== undefined ? (partial.email.trim() || null) : existing.email,
      phone: partial.phone !== undefined ? (partial.phone.trim() || null) : existing.phone,
      course: partial.course !== undefined ? (partial.course.trim() || null) : existing.course,
      address: partial.address !== undefined ? (partial.address.trim() || null) : existing.address,
      enrollment_date:
        partial.enrollment_date !== undefined
          ? (partial.enrollment_date.trim() || null)
          : existing.enrollment_date,
      updated_at: new Date().toISOString(),
    };

    all[index] = updated;
    saveStudents(all);

    return updated;
  },

  async deleteStudent(identifier: string | number): Promise<void> {
    const all = loadStoredStudents();
    const idStr = String(identifier).trim();
    const filtered = all.filter((s) => String(s.id) !== idStr && s.student_id !== idStr);

    if (filtered.length === all.length) {
      throw new Error(`Student with identifier '${identifier}' was not found.`);
    }

    saveStudents(filtered);
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const all = loadStoredStudents();
    const total_students = all.length;

    const courseMap: Record<string, number> = {};
    let contact_count = 0;

    for (const s of all) {
      const c = (s.course && s.course.trim()) || 'Unassigned';
      courseMap[c] = (courseMap[c] || 0) + 1;
      if ((s.email && s.email.trim()) || (s.phone && s.phone.trim())) {
        contact_count++;
      }
    }

    const course_distribution = Object.entries(courseMap).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      total_students,
      courses_represented: Object.keys(courseMap).filter((c) => c !== 'Unassigned').length,
      contact_count,
      course_distribution,
    };
  },

  // Reset saved records to the default sample students
  resetToDefault(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENT_RECORDS));
    }
  },

  // Export current records as JSON file
  exportJSON(): string {
    const all = loadStoredStudents();
    return JSON.stringify(all, null, 2);
  },

  // Export current records as CSV string
  exportCSV(): string {
    const all = loadStoredStudents();
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
    const rows = all.map((s) =>
      [
        s.student_id,
        s.name,
        s.dob,
        s.course,
        s.email,
        s.phone,
        s.address,
        s.enrollment_date,
      ].map(escapeCsvValue)
    );
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  // Import records from JSON
  importJSON(jsonStr: string): number {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid format: Expected a JSON array of student objects.');
    }
    const validated: Student[] = parsed.map((item, idx) => ({
      id: item.id || idx + 1,
      student_id: item.student_id || `STU-${1000 + idx + 1}`,
      name: String(item.name || 'Unknown Student'),
      dob: String(item.dob || '2000-01-01'),
      email: item.email ? String(item.email) : null,
      phone: item.phone ? String(item.phone) : null,
      course: item.course ? String(item.course) : null,
      address: item.address ? String(item.address) : null,
      enrollment_date: item.enrollment_date ? String(item.enrollment_date) : null,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    }));
    saveStudents(validated);
    return validated.length;
  },
};
