import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/tasks';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addTask = createAsyncThunk('tasks/addTask', async (taskData, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.post(API_URL, taskData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const toggleTask = createAsyncThunk('tasks/toggleTask', async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  if (!token) return thunkAPI.rejectWithValue('No token found');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  try {
    const response = await axios.patch(`${API_URL}/${id}/toggle`, {}, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, thunkAPI) => {
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


const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t._id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
