import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Clock,
  PhoneCall,
  UserPlus,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryCard } from '../components/common/SummaryCard';
import { TableLoadingSkeleton, CardLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDeleteDialog } from '../components/common/ConfirmDeleteDialog';
import { Student, DashboardMetrics } from '../types/student';
import { apiService, formatApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

const CHART_COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#64748b',
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [metricsData, listData] = await Promise.all([
        apiService.getDashboardMetrics(),
        apiService.getStudents({ page: 1, limit: 5 }),
      ]);
      setMetrics(metricsData);
      setRecentStudents(listData.items);
    } catch (err) {
      setErrorMsg(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await apiService.deleteStudent(studentToDelete.student_id || studentToDelete.id);
      success('Record Deleted', `Student ${studentToDelete.name} was successfully removed.`);
      setStudentToDelete(null);
      loadDashboardData();
    } catch (err) {
      toastError('Delete Failed', formatApiError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Overview"
        subtitle="Manage student records and monitor enrollment information."
      >
        <Link
          to="/students/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student</span>
        </Link>
      </PageHeader>

      {/* Error State if Backend is Offline */}
      {errorMsg ? (
        <ErrorState
          title="Unable to Load Dashboard Data"
          message={errorMsg}
          onRetry={loadDashboardData}
          isRetrying={isLoading}
        />
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardLoadingSkeleton key={i} />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <TableLoadingSkeleton rows={4} />
          </div>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Students"
              value={metrics?.total_students ?? 0}
              subtitle="Students on record"
              icon={Users}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
            />
            <SummaryCard
              title="Courses Represented"
              value={metrics?.courses_represented ?? 0}
              subtitle="Courses represented"
              icon={GraduationCap}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
            <SummaryCard
              title="Recently Added"
              value={recentStudents.length}
              subtitle="Latest student enrollments"
              icon={Clock}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
            <SummaryCard
              title="Contact Coverage"
              value={metrics?.contact_count ?? 0}
              subtitle="Students with email/phone"
              icon={PhoneCall}
              iconColor="text-sky-600"
              iconBg="bg-sky-50"
            />
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Student Distribution by Course</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Course enrollment breakdown across academic programs
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">Course Analytics</span>
            </div>

            {metrics?.course_distribution && metrics.course_distribution.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.course_distribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {metrics.course_distribution.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-700">No Course Data Available</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Once you add students with assigned courses, live distribution analytics will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Recent Students Table Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Students</h3>
                <p className="text-xs text-slate-500 mt-0.5">Recently added student records</p>
              </div>
              <Link
                to="/students"
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View All Students</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentStudents.length === 0 ? (
              <EmptyState
                title="No Student Records Yet"
                description="Add your first student to start building your records."
                actionText="Add First Student"
                onAction={() => navigate('/students/new')}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="px-5 py-3">Student ID</th>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Course</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">Enrollment Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 font-mono font-medium text-slate-900 tabular-nums">
                          {s.student_id}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-900">
                          <Link
                            to={`/students/${s.student_id || s.id}`}
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {s.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-slate-800">
                          {s.course || <span className="text-slate-400 italic">Unassigned</span>}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {s.email || s.phone || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-5 py-3 font-mono text-slate-600 tabular-nums">
                          {s.enrollment_date || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/students/${s.student_id || s.id}`}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              View
                            </Link>
                            <Link
                              to={`/students/${s.student_id || s.id}/edit`}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Dialog */}
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
