import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StudentForm } from '../components/students/StudentForm';
import { ErrorState } from '../components/common/ErrorState';
import { Student, StudentFormData } from '../types/student';
import { apiService, formatApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

export const EditStudentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleSubmit = async (formData: StudentFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const updated = await apiService.updateStudent(id, formData);
      success(
        'Student Updated',
        `Student record for ${updated.name} (${updated.student_id}) saved successfully.`
      );
      navigate(`/students/${updated.student_id || updated.id}`);
    } catch (err) {
      toastError('Update Failed', formatApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (errorMsg) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students</span>
        </Link>
        <ErrorState
          title="Could Not Load Student"
          message={errorMsg}
          onRetry={loadStudent}
          isRetrying={isLoading}
        />
      </div>
    );
  }

  if (isLoading || !student) {
    return (
      <div className="max-w-3xl mx-auto py-16 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-medium">Loading student details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link
          to={`/students/${student.student_id || student.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Details</span>
        </Link>
      </div>

      <PageHeader
        title={`Edit Student: ${student.name}`}
        subtitle={`Update academic, personal, or contact information for ${student.student_id}.`}
      />

      <StudentForm
        initialData={student}
        isEditing={true}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/students/${student.student_id || student.id}`)}
      />
    </div>
  );
};
