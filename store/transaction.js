import { useCallback, useReducer } from 'react';
import { getNetwork } from '../src/helpers';

export const transactionInitialState = { transactions: [] };
export function transactionReducer(state, action) {
  switch (action.type) {
    case 'store': {
      return state.transactions = action.payload;
    }
  }
  return state;
}
