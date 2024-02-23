import { configureStore } from '@reduxjs/toolkit'
import configuratorSlice  from '../slices'

export default configureStore({
  reducer: {
    configurator: configuratorSlice
  },
})