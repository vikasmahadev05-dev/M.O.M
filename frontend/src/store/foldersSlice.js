import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/folders';

export const fetchFolders = createAsyncThunk('folders/fetchFolders', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addFolder = createAsyncThunk('folders/addFolder', async (folderData) => {
  const response = await axios.post(API_URL, folderData);
  return response.data;
});

export const updateFolder = createAsyncThunk('folders/updateFolder', async ({ id, ...folderData }) => {
  const response = await axios.put(`${API_URL}/${id}`, folderData);
  return response.data;
});

export const deleteFolder = createAsyncThunk('folders/deleteFolder', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const initialState = {
  items: [],
  currentFolderId: null, // null means "All Notes" or no specific folder
  status: 'idle',
  error: null,
};

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    setCurrentFolder: (state, action) => {
      state.currentFolderId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addFolder.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        const index = state.items.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.items = state.items.filter(f => f._id !== action.payload);
        if (state.currentFolderId === action.payload) {
          state.currentFolderId = null;
        }
      });
  },
});

export const { setCurrentFolder } = foldersSlice.actions;

export default foldersSlice.reducer;
