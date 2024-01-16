import { configureStore } from '@reduxjs/toolkit'
import transactionSlice from './slices/transactionSlice'

export const store = configureStore({
  reducer: {
    transaction: transactionSlice
  }
})