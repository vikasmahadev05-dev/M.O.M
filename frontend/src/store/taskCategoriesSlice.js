import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/task-categories';

export const fetchTaskCategories = createAsyncThunk('taskCategories/fetch', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addTaskCategory = createAsyncThunk('taskCategories/add', async (categoryData, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const response = await axios.post(API_URL, categoryData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateTaskCategory = createAsyncThunk('taskCategories/update', async ({ id, categoryData }, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    const response = await axios.put(`${API_URL}/${id}`, categoryData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteTaskCategory = createAsyncThunk('taskCategories/delete', async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  try {
    await axios.delete(`${API_URL}/${id}`, config);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const taskCategoriesSlice = createSlice({
  name: 'taskCategories',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskCategories.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(addTaskCategory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateTaskCategory.fulfilled, (state, action) => {
        const index = state.list.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteTaskCategory.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c._id !== action.payload);
      });
  }
});

export default taskCategoriesSlice.reducer;
