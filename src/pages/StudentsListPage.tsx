import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StudentFilters } from '../components/students/StudentFilters';
import { StudentTable } from '../components/students/StudentTable';
import { Pagination } from '../components/common/Pagination';
import { TableLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDeleteDialog } from '../components/common/ConfirmDeleteDialog';
import { Student } from '../types/student';
import { apiService, formatApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  const initialSearch = searchParams.get('search') || '';

  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filters
  const [search, setSearch] = useState<string>(initialSearch);
  const [course, setCourse] = useState<string>('All Courses');
  const [dobFrom, setDobFrom] = useState<string>('');
  const [dobTo, setDobTo] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);

  // States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load students from API
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await apiService.getStudents({
        search,
        course,
        dob_from: dobFrom,
        dob_to: dobTo,
        page: currentPage,
        limit: pageSize,
      });

      setStudents(response.items);
      setTotalStudents(response.total);
      setTotalPages(response.total_pages);

      // Collect available courses
      const courseSet = new Set<string>();
      response.items.forEach((s) => {
        if (s.course) courseSet.add(s.course);
      });
      if (courseSet.size > 0) {
        setAvailableCourses((prev) => Array.from(new Set([...prev, ...Array.from(courseSet)])));
      }
    } catch (err) {
      setErrorMsg(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [search, course, dobFrom, dobTo, currentPage, pageSize]);

  // Sync url search param with search state
  useEffect(() => {
    const urlQuery = searchParams.get('search') || '';
    if (urlQuery !== search) {
      setSearch(urlQuery);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCourse('All Courses');
    setDobFrom('');
    setDobTo('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await apiService.deleteStudent(studentToDelete.student_id || studentToDelete.id);
      success('Record Deleted', `Student record for ${studentToDelete.name} was removed.`);
      setStudentToDelete(null);
      // Remove directly from current table
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setTotalStudents((prev) => Math.max(0, prev - 1));
      // Reload in background to maintain accurate pagination
      loadStudents();
    } catch (err) {
      toastError('Delete Failed', formatApiError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered = Boolean(search || (course && course !== 'All Courses') || dobFrom || dobTo);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Students"
        subtitle="View, search, filter, and manage student records."
      >
        <button
          onClick={loadStudents}
          disabled={isLoading}
          className="p-2.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Refresh table"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
        <Link
          to="/students/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student</span>
        </Link>
      </PageHeader>

      {/* Search and Filters */}
      <StudentFilters
        search={search}
        course={course}
        dobFrom={dobFrom}
        dobTo={dobTo}
        availableCourses={availableCourses}
        onSearchChange={handleSearchChange}
        onCourseChange={(val) => {
          setCourse(val);
          setCurrentPage(1);
        }}
        onDobFromChange={(val) => {
          setDobFrom(val);
          setCurrentPage(1);
        }}
        onDobToChange={(val) => {
          setDobTo(val);
          setCurrentPage(1);
        }}
        onClearFilters={handleClearFilters}
      />

      {/* Main Table / State Container */}
      {errorMsg ? (
        <ErrorState
          title="Unable to Retrieve Student Records"
          message={errorMsg}
          onRetry={loadStudents}
          isRetrying={isLoading}
        />
      ) : isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
          <TableLoadingSkeleton rows={pageSize} />
        </div>
      ) : students.length === 0 ? (
        isFiltered ? (
          <EmptyState
            title="No Matching Records Found"
            description="No student records matched your current search filters. Try adjusting keywords or clearing date filters."
            actionText="Clear All Filters"
            onAction={handleClearFilters}
            isFiltered={true}
          />
        ) : (
          <EmptyState
            title="No Student Records Yet"
            description="Add your first student to start managing records."
            actionText="Create Student"
            onAction={() => navigate('/students/new')}
          />
        )
      ) : (
        <div className="space-y-0">
          <StudentTable
            students={students}
            onDeleteClick={(student) => setStudentToDelete(student)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalStudents}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(studentToDelete)}
        student={studentToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};
