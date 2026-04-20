import React from 'react';
import NoteCard from './NoteCard';

const NotesGrid = () => {
  const notes = [
    { 
      title: 'Meeting Notes', 
      category: 'Work', 
      content: 'Discussed key deliverables and deadlines. Follow-up meeting scheduled for next week to finalize the project scope.', 
      date: '22/10/2026',
      color: 'bg-[var(--pastel-blue)] text-blue-500'
    },
    { 
      title: 'Vacation Plans', 
      category: 'Personal', 
      content: 'Ideas for destinations and activities for the upcoming vacation. Need to research flights and accommodations.', 
      date: '27/10/2026',
      color: 'bg-[var(--pastel-pink)] text-pink-500'
    },
    { 
      title: 'Home Office Setup Tips', 
      category: 'Ideas', 
      content: 'Tips on arranging a productive workspace at home. List of essential office equipment and ergonomic furniture.', 
      date: '21/10/2026',
      color: 'bg-[var(--pastel-purple)] text-purple-500' 
    },
    { 
      title: 'Project Brainstorming', 
      category: 'Work', 
      content: 'Brainstorming ideas for the upcoming project. Collected initial thoughts and suggestions from the team.', 
      date: '27/10/2026',
      color: 'bg-[var(--pastel-orange)] text-orange-500'
    },
    { 
      title: 'Marketing Strategy', 
      category: 'Work', 
      content: 'Overview of methods for managing tasks. Collective thoughts and suggestions from the marketing team.', 
      date: '27/10/2026',
      color: 'bg-[var(--pastel-green)] text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note, i) => (
        <NoteCard key={i} {...note} />
      ))}
    </div>
  );
};

export default NotesGrid;
