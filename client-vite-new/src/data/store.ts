import { configureStore } from '@reduxjs/toolkit';
import coreReducer from './coreSlice';

const store = configureStore({
  reducer: {
    core: coreReducer,
    // contacts: contactsSlice.reducer,
    // events: eventsSlice.reducer,
    // groups: groupsSlice.reducer,
    // reports: reportsSlice.reducer,
    // tags: tagsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;