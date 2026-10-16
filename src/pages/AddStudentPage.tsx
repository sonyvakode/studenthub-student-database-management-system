import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StudentForm } from '../components/students/StudentForm';
import { StudentFormData } from '../types/student';
import { apiService, formatApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AddStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (formData: StudentFormData) => {
    setIsSaving(true);
    try {
      const created = await apiService.createStudent(formData);
      success(
        'Student Created Successfully',
        `${created.name} registered with generated ID ${created.student_id}.`
      );
      navigate(`/students/${created.student_id || created.id}`);
    } catch (err) {
      toastError('Failed to Create Student', formatApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Students</span>
        </Link>
      </div>

      <PageHeader
        title="Add New Student"
        subtitle="Create a student profile. A unique student ID will be assigned automatically."
      />

      <StudentForm
        isEditing={false}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/students')}
      />
    </div>
  );
};
