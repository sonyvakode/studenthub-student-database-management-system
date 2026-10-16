import React, { useState, useEffect } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

interface StudentFiltersProps {
  search: string;
  course: string;
  dobFrom: string;
  dobTo: string;
  availableCourses: string[];
  onSearchChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onDobFromChange: (value: string) => void;
  onDobToChange: (value: string) => void;
  onClearFilters: () => void;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  search,
  course,
  dobFrom,
  dobTo,
  availableCourses,
  onSearchChange,
  onCourseChange,
  onDobFromChange,
  onDobToChange,
  onClearFilters,
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync internal state if prop changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  const hasActiveFilters = Boolean(
    search || (course && course !== 'All Courses') || dobFrom || dobTo
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 mb-4 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div>
          <label htmlFor="filterSearch" className="block text-xs font-semibold text-slate-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="filterSearch"
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search name, ID, email..."
              className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Course Filter */}
        <div>
          <label htmlFor="filterCourse" className="block text-xs font-semibold text-slate-700 mb-1">
            Course
          </label>
          <div className="relative">
            <select
              id="filterCourse"
              value={course || 'All Courses'}
              onChange={(e) => onCourseChange(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All Courses">All Courses</option>
              {availableCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DOB From */}
        <div>
          <label htmlFor="filterDobFrom" className="block text-xs font-semibold text-slate-700 mb-1">
            Born From (DOB)
          </label>
          <input
            id="filterDobFrom"
            type="date"
            value={dobFrom}
            onChange={(e) => onDobFromChange(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer font-mono"
          />
        </div>

        {/* DOB To */}
        <div>
          <label htmlFor="filterDobTo" className="block text-xs font-semibold text-slate-700 mb-1">
            Born To (DOB)
          </label>
          <input
            id="filterDobTo"
            type="date"
            value={dobTo}
            onChange={(e) => onDobToChange(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer font-mono"
          />
        </div>
      </div>

      {/* Filter Footer / Clear Controls */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active filters applied</span>
          </div>
          <button
            onClick={() => {
              setLocalSearch('');
              onClearFilters();
            }}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-rose-600 transition-colors font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
