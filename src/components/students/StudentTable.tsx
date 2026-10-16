import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone as PhoneIcon,
  Calendar,
} from 'lucide-react';
import { Student } from '../../types/student';

interface StudentTableProps {
  students: Student[];
  onDeleteClick: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, onDeleteClick }) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close actions dropdown on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">
                Student ID
              </th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">
                Student Name
              </th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">
                Date of Birth
              </th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">
                Course
              </th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">
                Email
              </th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">
                Phone
              </th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">
                Enrollment Date
              </th>
              <th scope="col" className="px-5 py-3.5 text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {students.map((student) => {
              const isMenuOpen = openDropdownId === student.id;

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Student ID */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-mono font-medium text-slate-900 bg-slate-100/80 px-2 py-0.5 rounded text-[11px] tabular-nums">
                      {student.student_id}
                    </span>
                  </td>

                  {/* Student Name */}
                  <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-900">
                    <Link
                      to={`/students/${student.student_id || student.id}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {student.name}
                    </Link>
                  </td>

                  {/* Date of Birth */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono tabular-nums">
                    {student.dob || '—'}
                  </td>

                  {/* Course */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-slate-800 font-medium">
                      {student.course || <span className="text-slate-400 italic">Not assigned</span>}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {student.email ? (
                      <a
                        href={`mailto:${student.email}`}
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.email}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-3.5 whitespace-nowrap font-mono tabular-nums">
                    {student.phone ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.phone}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Enrollment Date */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono tabular-nums">
                    {student.enrollment_date ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.enrollment_date}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Action Menu */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap relative">
                    <div className="inline-block" ref={isMenuOpen ? dropdownRef : undefined}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(isMenuOpen ? null : student.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Actions for ${student.name}`}
                        aria-expanded={isMenuOpen}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-5 top-10 w-40 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100 text-left"
                          role="menu"
                        >
                          <Link
                            to={`/students/${student.student_id || student.id}`}
                            onClick={() => setOpenDropdownId(null)}
                            className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                            role="menuitem"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Details</span>
                          </Link>

                          <Link
                            to={`/students/${student.student_id || student.id}/edit`}
                            onClick={() => setOpenDropdownId(null)}
                            className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                            role="menuitem"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit Student</span>
                          </Link>

                          <div className="h-px bg-slate-100 my-1" />

                          <button
                            onClick={() => {
                              setOpenDropdownId(null);
                              onDeleteClick(student);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            role="menuitem"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete Student</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
