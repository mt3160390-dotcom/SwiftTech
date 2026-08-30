import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  topRatedList: [],
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }) => {
    console.log(fetchAllFilteredProducts, "fetchAllFilteredProducts");

    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
    });

    const result = await axios.get(
      `http://localhost:5000/api/shop/products/get?${query}`
    );

    console.log(result);

    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
    const result = await axios.get(
      `http://localhost:5000/api/shop/products/get/${id}`
    );

    return result?.data;
  }
);

// Fetches top-rated products: sorted by rating descending, minimum rating threshold of 1
export const fetchTopRatedProducts = createAsyncThunk(
  "/products/fetchTopRatedProducts",
  async ({ limit = 5 } = {}) => {
    const query = new URLSearchParams({
      sortBy: "rating-hightolow",
    });

    const result = await axios.get(
      `http://localhost:5000/api/shop/products/get?${query}`
    );

    // Client-side filter: only products that have been rated, capped to limit
    const rated = (result?.data?.data || [])
      .filter((p) => p.averageReview > 0)
      .slice(0, limit);

    return { ...result?.data, data: rated };
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      })
      .addCase(fetchTopRatedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTopRatedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topRatedList = action.payload.data;
      })
      .addCase(fetchTopRatedProducts.rejected, (state) => {
        state.isLoading = false;
        state.topRatedList = [];
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
