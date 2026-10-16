import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Mail,
  Phone,
  BookOpen,
  MapPin,
  Edit2,
  Trash2,
  ArrowLeft,
  User,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { Student } from '../../types/student';
import { useToast } from '../../context/ToastContext';

interface StudentDetailCardProps {
  student: Student;
  onDeleteClick: () => void;
}

export const StudentDetailCard: React.FC<StudentDetailCardProps> = ({
  student,
  onDeleteClick,
}) => {
  const { success, error } = useToast();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
      success('Copied to clipboard', `${field === 'email' ? 'Email address' : 'Phone number'} copied.`);
    } catch {
      error('Copy failed', 'Your browser could not copy this value to the clipboard.');
    }
  };

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const age = calculateAge(student.dob);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl uppercase shrink-0">
              {student.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
                  {student.student_id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {student.course || 'No course assigned'}
                {student.enrollment_date && ` · Enrolled ${student.enrollment_date}`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to={`/students/${student.student_id || student.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </Link>
            <button
              onClick={onDeleteClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Academic Details */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
            Personal & Academic Information
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name:</span>
              </span>
              <span className="font-medium text-slate-900 text-right">{student.name}</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date of Birth:</span>
              </span>
              <span className="font-mono tabular-nums font-medium text-slate-900 text-right">
                {student.dob} {age !== null && <span className="text-slate-400 font-sans">({age} years)</span>}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Course Program:</span>
              </span>
              <span className="font-medium text-slate-900 text-right">
                {student.course || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Enrollment Date:</span>
              </span>
              <span className="font-mono tabular-nums font-medium text-slate-900 text-right">
                {student.enrollment_date || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Residential Details */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
            Contact & Residential Details
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address:</span>
              </span>
              {student.email ? (
                <div className="flex items-center gap-1.5">
                  <a
                    href={`mailto:${student.email}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {student.email}
                  </a>
                  <button
                    onClick={() => void copyToClipboard(student.email!, 'email')}
                    aria-label="Copy email address"
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number:</span>
              </span>
              {student.phone ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {student.phone}
                  </span>
                  <button
                    onClick={() => void copyToClipboard(student.phone!, 'phone')}
                    aria-label="Copy phone number"
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    title="Copy phone"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Permanent Address:</span>
              </span>
              <span className="text-right text-slate-800 max-w-[240px] leading-relaxed">
                {student.address || <span className="text-slate-400 italic">Not provided</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
