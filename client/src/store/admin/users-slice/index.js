import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  usersList: [],
  selectedUser: null,
  selectedUserOrders: [],
  isLoading: false,
};

export const getAllUsersForAdmin = createAsyncThunk(
  "/adminUsers/getAllUsersForAdmin",
  async () => {
    const response = await axios.get("http://localhost:5000/api/admin/users/get");
    return response.data;
  }
);

export const getOrdersByUserForAdmin = createAsyncThunk(
  "/adminUsers/getOrdersByUserForAdmin",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/admin/users/${userId}/orders`
    );

    return response.data;
  }
);

const adminUsersSlice = createSlice({
  name: "adminUsersSlice",
  initialState,
  reducers: {
    resetSelectedUserOrders: (state) => {
      state.selectedUser = null;
      state.selectedUserOrders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usersList = action.payload.data || [];
      })
      .addCase(getAllUsersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.usersList = [];
      })
      .addCase(getOrdersByUserForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrdersByUserForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload.data?.user || null;
        state.selectedUserOrders = action.payload.data?.orders || [];
      })
      .addCase(getOrdersByUserForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.selectedUser = null;
        state.selectedUserOrders = [];
      });
  },
});

export const { resetSelectedUserOrders } = adminUsersSlice.actions;

export default adminUsersSlice.reducer;
