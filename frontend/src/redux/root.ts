import { combineReducers } from '@reduxjs/toolkit';
import { counterReducer } from './reducers';

const rootReducer = combineReducers({
  counterReducer,
});

export default rootReducer;
