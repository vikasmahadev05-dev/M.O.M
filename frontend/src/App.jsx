import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import CalendarPage from './pages/CalendarPage';
import TodoList from './pages/TodoList';
import Profile from './pages/Profile';
import Finance from './pages/Finance';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/todo" element={<TodoList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/finance" element={<Finance />} />
      </Routes>
    </MainLayout>
  );
}





export default App;

