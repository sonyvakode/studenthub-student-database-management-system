import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Notice',
  message,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 max-w-xl mx-auto shadow-xs">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{message}</p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
              </button>
            )}

            <Link
              to="/students"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <span>Back to Students List</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
