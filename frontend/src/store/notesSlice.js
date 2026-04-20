import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notes';

// Async Thunks
export const fetchNotes = createAsyncThunk('notes/fetchNotes', async ({ search = '', tag = '', folderId = null } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (tag) params.append('tag', tag);
  if (folderId) params.append('folderId', folderId);
  
  const response = await axios.get(`${API_URL}?${params.toString()}`);
  return response.data;
});

export const addNote = createAsyncThunk('notes/addNote', async (noteData) => {
  const response = await axios.post(API_URL, noteData);
  return response.data;
});

export const updateNote = createAsyncThunk('notes/updateNote', async ({ id, ...noteData }) => {
  const response = await axios.put(`${API_URL}/${id}`, noteData);
  return response.data;
});

export const deleteNote = createAsyncThunk('notes/deleteNote', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const initialState = {
  items: [],
  currentNoteId: null, // The note currently being edited
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  saveStatus: 'saved', // 'saved' | 'saving' | 'error'
  searchQuery: '',
  activeTag: null,
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setCurrentNote: (state, action) => {
      state.currentNoteId = action.payload;
    },
    setSaveStatus: (state, action) => {
      state.saveStatus = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveTag: (state, action) => {
      state.activeTag = action.payload;
    },
    // Optimistic update for typing
    updateNoteLocally: (state, action) => {
      const { id, ...updates } = action.payload;
      const existingNote = state.items.find(note => note._id === id);
      if (existingNote) {
         Object.assign(existingNote, updates);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Add to top usually, but let backend sorting handle it ideally
        state.currentNoteId = action.payload._id; // Switch to the new note
        state.saveStatus = 'saved';
      })
      .addCase(updateNote.pending, (state) => {
         state.saveStatus = 'saving';
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.saveStatus = 'saved';
        const index = state.items.findIndex(note => note._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Basic re-sorting to keep pinned at top
        state.items.sort((a, b) => {
            if (a.isPinned === b.isPinned) {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
            return a.isPinned ? -1 : 1;
        });
      })
      .addCase(updateNote.rejected, (state) => {
         state.saveStatus = 'error';
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.items = state.items.filter(note => note._id !== action.payload);
        if (state.currentNoteId === action.payload) {
          state.currentNoteId = state.items.length > 0 ? state.items[0]._id : null;
        }
      });
  },
});

export const { setCurrentNote, setSaveStatus, updateNoteLocally, setSearchQuery, setActiveTag } = notesSlice.actions;

export default notesSlice.reducer;
