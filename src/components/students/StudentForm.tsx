import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Save, X, Calendar, Mail, Phone, BookOpen, MapPin, User } from 'lucide-react';
import { StudentFormData, Student } from '../../types/student';

const COMMON_COURSES = [
  'Computer Science & Engineering',
  'Data Science & AI',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Analytics',
  'Cybersecurity & Network Systems',
];

interface StudentFormProps {
  initialData?: Student | null;
  isEditing?: boolean;
  isSaving: boolean;
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  isEditing = false,
  isSaving,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    dob: '',
    email: '',
    phone: '',
    course: '',
    address: '',
    enrollment_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Prepopulate if initialData exists (Edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        dob: initialData.dob || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        course: initialData.course || '',
        address: initialData.address || '',
        enrollment_date: initialData.enrollment_date || '',
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    // 2. Date of Birth validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required.';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate >= today) {
        newErrors.dob = 'Date of birth must be in the past.';
      }
    }

    // 3. At least one contact method (email or phone)
    const hasEmail = Boolean(formData.email.trim());
    const hasPhone = Boolean(formData.phone.trim());

    if (!hasEmail && !hasPhone) {
      newErrors.contact = 'At least one contact method (email or phone number) must be provided.';
    }

    // 4. Email format check if provided
    if (hasEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g., student@example.com).';
      }
    }

    // 5. Phone format check if provided
    if (hasPhone) {
      const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
      if (phoneDigits.length < 7) {
        newErrors.phone = 'Please enter a valid phone number (at least 7 digits).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (errors[field] || errors.contact) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        if (field === 'email' || field === 'phone') {
          delete next.contact;
        }
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      dob: true,
      email: true,
      phone: true,
      course: true,
      address: true,
      enrollment_date: true,
    });

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Edit Mode ID Indicator */}
      {isEditing && initialData && (
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Assigned Student ID:</span>
            <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {initialData.student_id}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Automatically assigned and cannot be changed</span>
        </div>
      )}

      {/* Contact Error Global Banner */}
      {errors.contact && (
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{errors.contact}</span>
        </div>
      )}

      {/* Primary Details Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Personal Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label htmlFor="studentFullName" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="studentFullName"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g. Aarav Sharma"
              className={`w-full text-xs px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden transition-all ${
                errors.name && touched.name
                  ? 'border-rose-300 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            {errors.name && touched.name ? (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Official registered legal name.</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="studentDob" className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Birth <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="studentDob"
                type="date"
                required
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                onBlur={() => handleBlur('dob')}
                className={`w-full text-xs px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-hidden font-mono transition-all ${
                  errors.dob && touched.dob
                    ? 'border-rose-300 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.dob && touched.dob ? (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.dob}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Required for age and verification.</p>
            )}
          </div>
        </div>
      </div>

      {/* Academic Information Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Academic Enrollment</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course */}
          <div>
            <label htmlFor="studentCourse" className="block text-xs font-semibold text-slate-700 mb-1">
              Course / Program
            </label>
            <div className="space-y-1.5">
              <input
                id="studentCourse"
                type="text"
                list="courseOptions"
                value={formData.course}
                onChange={(e) => handleChange('course', e.target.value)}
                placeholder="Select or enter course name..."
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <datalist id="courseOptions">
                {COMMON_COURSES.map((course) => (
                  <option key={course} value={course} />
                ))}
              </datalist>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Choose from common programs or type a custom degree.
            </p>
          </div>

          {/* Enrollment Date */}
          <div>
            <label htmlFor="studentEnrollmentDate" className="block text-xs font-semibold text-slate-700 mb-1">
              Enrollment Date
            </label>
            <input
              id="studentEnrollmentDate"
              type="date"
              value={formData.enrollment_date}
              onChange={(e) => handleChange('enrollment_date', e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Date the student formally joined or registered.
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Address Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>Contact & Address</span>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            At least one contact method required
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label htmlFor="studentEmail" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                id="studentEmail"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="e.g. student@example.com"
                className={`w-full text-xs px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden transition-all ${
                  errors.email && touched.email
                    ? 'border-rose-300 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.email && touched.email && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="studentPhone" className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="studentPhone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="e.g. +91 98765 43210"
                className={`w-full text-xs px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden font-mono transition-all ${
                  errors.phone && touched.phone
                    ? 'border-rose-300 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.phone && touched.phone && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="studentAddress" className="block text-xs font-semibold text-slate-700 mb-1">
            Residential / Permanent Address
          </label>
          <textarea
            id="studentAddress"
            rows={3}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Street address, city, state, postal code..."
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isEditing ? 'Saving Changes...' : 'Creating Student...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Student'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
