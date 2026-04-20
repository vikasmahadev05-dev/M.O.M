import { configureStore } from '@reduxjs/toolkit';
import notesReducer from './notesSlice';
import foldersReducer from './foldersSlice';
import tagsReducer from './tagsSlice';

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    folders: foldersReducer,
    tags: tagsReducer,
  },
});
