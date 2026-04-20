import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tags';

export const fetchTags = createAsyncThunk('tags/fetchTags', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addTag = createAsyncThunk('tags/addTag', async (tagName) => {
  const response = await axios.post(API_URL, { name: tagName });
  return response.data;
});

export const deleteTag = createAsyncThunk('tags/deleteTag', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addTag.fulfilled, (state, action) => {
        // Only push if it doesn't already exist (API might return existing if created concurrently, handled generally well but safe to check)
        const exists = state.items.find(t => t._id === action.payload._id);
        if (!exists) {
            state.items.push(action.payload);
        }
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload);
      });
  },
});

export default tagsSlice.reducer;
