import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/notes';

// Async Thunks
export const fetchNotes = createAsyncThunk('notes/fetchNotes', async ({ search = '', tag = '', folderId = null } = {}, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (tag) params.append('tag', tag);
  if (folderId) params.append('folderId', folderId);
  
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.get(`${API_URL}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});



export const addNote = createAsyncThunk('notes/addNote', async (noteData, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.post(API_URL, noteData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const updateNote = createAsyncThunk('notes/updateNote', async ({ id, ...noteData }, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.put(`${API_URL}/${id}`, noteData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteNote = createAsyncThunk('notes/deleteNote', async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    await axios.delete(`${API_URL}/${id}`, config);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});



export const duplicateNote = createAsyncThunk('notes/duplicateNote', async (note, thunkAPI) => {
  const { _id, createdAt, updatedAt, ...rest } = note;
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.post(API_URL, {
      ...rest,
      title: `${rest.title} (Copy)`
    }, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const linkNotes = createAsyncThunk('notes/linkNotes', async ({ noteId, targetId, reason = '' }, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.post(`${API_URL}/link`, { noteId, targetId, reason }, config);
    thunkAPI.dispatch(fetchNotes()); // Refresh all notes to get updated links
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});



export const unlinkNotes = createAsyncThunk('notes/unlinkNotes', async ({ noteId, targetId }, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.post(`${API_URL}/unlink`, { noteId, targetId }, config);
    thunkAPI.dispatch(fetchNotes()); // Refresh data
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateNotePosition = createAsyncThunk('notes/updateNotePosition', async ({ id, fx, fy }, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.put(`${API_URL}/${id}`, { fx, fy }, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const clearAllGraphPins = createAsyncThunk('notes/clearAllGraphPins', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.post(`${API_URL}/graph/clear-pins`, {}, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});



export const uploadAttachment = createAsyncThunk('notes/uploadAttachment', async ({ noteId, file }, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // 1. Upload file to get metadata
    const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    
    // 2. Attach metadata to note
    const attachRes = await axios.post(`${API_URL}/${noteId}/attach`, uploadRes.data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { noteId, note: attachRes.data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});


export const removeAttachment = createAsyncThunk('notes/removeAttachment', async ({ noteId, attachmentId }, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    await axios.delete(`${API_URL}/${noteId}/attachments/${attachmentId}`, config);
    return { noteId, attachmentId };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
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
      })
      .addCase(duplicateNote.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.currentNoteId = action.payload._id;
      })
      .addCase(linkNotes.fulfilled, (state) => {
        state.saveStatus = 'saved';
      })
      .addCase(unlinkNotes.fulfilled, (state) => {
        state.saveStatus = 'saved';
      })
      .addCase(uploadAttachment.pending, (state) => {
        state.saveStatus = 'saving';
      })
      .addCase(uploadAttachment.fulfilled, (state, action) => {
        state.saveStatus = 'saved';
        const index = state.items.findIndex(note => note._id === action.payload.noteId);
        if (index !== -1) {
          state.items[index] = action.payload.note;
        }
      })
      .addCase(removeAttachment.fulfilled, (state, action) => {
        const index = state.items.findIndex(note => note._id === action.payload.noteId);
        if (index !== -1) {
          state.items[index].attachments = state.items[index].attachments.filter(
            a => a._id !== action.payload.attachmentId
          );
        }
      });
  },
});

export const { setCurrentNote, setSaveStatus, updateNoteLocally, setSearchQuery, setActiveTag } = notesSlice.actions;

export default notesSlice.reducer;
