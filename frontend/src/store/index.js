import { configureStore } from '@reduxjs/toolkit';
import notesReducer from './notesSlice';
import foldersReducer from './foldersSlice';
import tagsReducer from './tagsSlice';
import tasksReducer from './tasksSlice';
import authReducer from './authSlice';


export const store = configureStore({
  reducer: {
    notes: notesReducer,
    folders: foldersReducer,
    tags: tagsReducer,
    tasks: tasksReducer,
    auth: authReducer,
  },

});
