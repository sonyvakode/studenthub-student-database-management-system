import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { StudentDetailCard } from '../components/students/StudentDetailCard';
import { ConfirmDeleteDialog } from '../components/common/ConfirmDeleteDialog';
import { ErrorState } from '../components/common/ErrorState';
import { Student } from '../types/student';
import { apiService, formatApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

export const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadStudent = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getStudentById(id);
      setStudent(data);
    } catch (err) {
      setErrorMsg(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const handleDeleteConfirm = async () => {
    if (!student) return;
    setIsDeleting(true);
    try {
      await apiService.deleteStudent(student.student_id || student.id);
      success('Record Deleted', `Student record for ${student.name} was successfully removed.`);
      setIsDeleteDialogOpen(false);
      navigate('/students');
    } catch (err) {
      toastError('Delete Failed', formatApiError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Students</span>
        </Link>
      </div>

      {errorMsg ? (
        <ErrorState
          title="Student Not Found"
          message={errorMsg}
          onRetry={loadStudent}
          isRetrying={isLoading}
        />
      ) : isLoading || !student ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mb-2" />
          <span className="text-xs font-medium">Loading student details...</span>
        </div>
      ) : (
        <StudentDetailCard
          student={student}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        student={student}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
