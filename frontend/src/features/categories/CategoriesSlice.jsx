import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllCategories } from './CategoriesApi';

const initialState = {
  status: 'idle',
  categories: [],
  error: null,
};

export const fetchAllCategoriesAsync = createAsyncThunk(
  'categories/fetchAllCategoriesAsync',
  async () => {
    const categories = await fetchAllCategories();
    return categories;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategoriesAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllCategoriesAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchAllCategoriesAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Selectors
export const selectCategories = (state) => state.CategoriesSlice.categories;
export const selectCategoryStatus = (state) => state.CategoriesSlice.status;
export const selectCategoryError = (state) => state.CategoriesSlice.error;

export default categoriesSlice.reducer;
