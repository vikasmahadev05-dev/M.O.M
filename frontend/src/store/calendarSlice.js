import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/calendar`;

export const fetchCalendarItems = createAsyncThunk(
  'calendar/fetchItems',
  async (params, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createCalendarItem = createAsyncThunk(
  'calendar/createItem',
  async (itemData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(API_URL, itemData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateCalendarItem = createAsyncThunk(
  'calendar/updateItem',
  async ({ id, ...itemData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/${id}`, itemData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteCalendarItem = createAsyncThunk(
  'calendar/deleteItem',
  async ({ id, scope = 'occurrence', date = null }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url = `${API_URL}/${id}?scope=${scope}`;
      if (date) url += `&date=${date}`;
      const response = await axios.delete(url, config);
      return { id, scope, date, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const duplicateCalendarItem = createAsyncThunk(
  'calendar/duplicateItem',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/${id}/duplicate`, {}, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const toggleGoogleSync = createAsyncThunk(
  'calendar/toggleSync',
  async (enabled, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_BASE_URL}/api/google/toggle-sync`, { enabled }, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const checkGoogleStatus = createAsyncThunk(
  'calendar/checkGoogleStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // We'll add this endpoint to backend
      const response = await axios.get(`${API_BASE_URL}/api/google/status`, config);
      return response.data; // { connected: true/false }
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const disconnectGoogle = createAsyncThunk(
  'calendar/disconnectGoogle',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_BASE_URL}/api/google/disconnect`, {}, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchGoogleEvents = createAsyncThunk(
  'calendar/fetchGoogleEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE_URL}/api/google/events`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    items: [],
    view: 'month',
    selectedDate: new Date().toISOString(),
    status: 'idle',
    error: null,
    lastDeletedItem: null,
    filters: {
      type: 'all',
      priority: 'all',
      category: 'all',
      search: ''
    },
    sorting: {
      by: 'startTime',
      order: 'asc'
    },
    googleConnected: false,
    googleSyncEnabled: false,
    googleEvents: []
  },
  reducers: {
    setGoogleConnected: (state, action) => {
      state.googleConnected = action.payload;
    },
    setGoogleSyncEnabled: (state, action) => {
      state.googleSyncEnabled = action.payload;
    },
    setView: (state, action) => {
      state.view = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { type: 'all', priority: 'all', category: 'all', search: '' };
    },
    undoDelete: (state) => {
      if (state.lastDeletedItem) {
        state.items.push(state.lastDeletedItem);
        state.lastDeletedItem = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(deleteCalendarItem.pending, (state, action) => {
        const itemToDelete = state.items.find(i => i._id === action.meta.arg.id);
        if (itemToDelete) state.lastDeletedItem = itemToDelete;
      })
      .addCase(deleteCalendarItem.fulfilled, (state, action) => {
        if (action.payload.scope === 'all') {
          state.items = state.items.filter(item => item._id !== action.payload.id);
        } else if (action.payload.item) {
          const index = state.items.findIndex(i => i._id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload.item;
        }
      })
      .addCase(updateCalendarItem.fulfilled, (state, action) => {
        if (action.payload.message === 'Series updated') {
           state.status = 'loading'; 
        } else {
          const index = state.items.findIndex(item => item._id === action.payload._id);
          if (index !== -1) state.items[index] = action.payload;
        }
      })
      .addCase(checkGoogleStatus.fulfilled, (state, action) => {
        state.googleConnected = action.payload.connected;
        state.googleSyncEnabled = action.payload.syncEnabled;
      })
      .addCase(toggleGoogleSync.fulfilled, (state, action) => {
        state.googleSyncEnabled = action.payload.syncEnabled;
      })
      .addCase(disconnectGoogle.fulfilled, (state) => {
        state.googleConnected = false;
        state.googleSyncEnabled = false;
        state.googleEvents = [];
      })
      .addCase(fetchGoogleEvents.fulfilled, (state, action) => {
        state.googleEvents = action.payload.map(ge => {
          let colorTag = '#9333ea'; // Default Google Purple
          if (ge.calendarName && ge.calendarName.toLowerCase().includes('holiday')) {
            colorTag = '#ef4444'; // Red for holidays
          } else if (ge.calendarName && ge.calendarName.toLowerCase().includes('birthday')) {
            colorTag = '#ec4899'; // Pink for birthdays
          }

          return {
            _id: ge.id,
            title: ge.summary || '(No Title)',
            description: (ge.description || '') + (ge.calendarName ? `\n[Calendar: ${ge.calendarName}]` : ''),
            startTime: ge.start.dateTime || ge.start.date,
            endTime: ge.end.dateTime || ge.end.date,
            source: 'google',
            isGoogle: true,
            calendarName: ge.calendarName,
            colorTag: colorTag
          };
        });
      });
  },
});

export const { setView, setSelectedDate, setFilters, clearFilters, undoDelete, setGoogleConnected } = calendarSlice.actions;
export default calendarSlice.reducer;
