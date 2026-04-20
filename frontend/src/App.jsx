import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import NotesOverview from './pages/NotesOverview';
import NotesEditorPage from './pages/NotesEditorPage';
import CalendarPage from './pages/CalendarPage';
import TodoList from './pages/TodoList';
import Profile from './pages/Profile';
import Finance from './pages/Finance';
import GraphView from './pages/GraphView';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notes" element={<NotesOverview />} />
        <Route path="/notes/:id" element={<NotesEditorPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/todo" element={<TodoList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/graph" element={<GraphView />} />
      </Routes>
    </MainLayout>
  );
}





export default App;

