import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsListPage } from './pages/StudentsListPage';
import { AddStudentPage } from './pages/AddStudentPage';
import { EditStudentPage } from './pages/EditStudentPage';
import { StudentDetailsPage } from './pages/StudentDetailsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentsListPage />} />
            <Route path="students/new" element={<AddStudentPage />} />
            <Route path="students/:id" element={<StudentDetailsPage />} />
            <Route path="students/:id/edit" element={<EditStudentPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
