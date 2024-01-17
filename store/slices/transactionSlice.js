import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getNetwork } from '../../src/helpers';

export const InitialState = {
    transactions: { loader: false, data: [] }
};


const fetchTransactions = async (address) => {
    const network = getNetwork();
    const data = await fetch(
      `${network.coreApiUrl}/extended/v1/address/${address}/transactions`
    );
    const r = await data.json();
    const res = r.results.filter(({ tx_type, tx_status }) => tx_type == "smart_contract" && tx_status === "success")
      .map((tx) => {
        const sourceCode = String(tx.smart_contract.source_code)
          .replace(/\n/g, " ")
          .replace(/\s{2,}/g, "");
        const MAX_SUPPLY = Number(
          sourceCode
            .match(/\(define-constant MAX_SUPPLY+(.*?)\)\)\)/g)
            ?.find(Boolean)
            ?.match(/u+(.*?)\(/g)
            ?.find(Boolean)
            ?.replace(/[u( ]/g, "")
        );
        const SYMBOL = sourceCode
          .match(/\(define-read-only \(get-symbol\)+(.*?)\)\)/g)
          ?.find(Boolean)
          ?.match(/\"+(.*?)\"/g)
          ?.find(Boolean)
          ?.replace(/[\"]/g, "");
        const DECIMAL = Number(
          sourceCode
            .match(/\(get-decimals\)+(.*?)\)/g)
            ?.find(Boolean)
            ?.match(/\u+(.*?)\)/g)
            ?.find(Boolean)
            ?.replace(/[u() ]/g, "")
        );
        const CONTRACT = tx.smart_contract.contract_id.split(".");
        tx.info = {};
        tx.info.contract_address = CONTRACT[0];
        tx.info.contract_name = CONTRACT[1];
        tx.info.max_supply = MAX_SUPPLY;
        tx.info.symbol = SYMBOL;
        tx.info.decimal = DECIMAL;
  
        tx.info.label = tx.info.contract_name;
        tx.info.value = tx.info.contract_name;
        tx.info.tx_id = tx.tx_id;

        tx.status = 'success';
  
        return tx;
      });
      return res;
};

const fetchTransactionsMemePool = async (address) => {
  const network = getNetwork();
  const data = await fetch(
    `${network.coreApiUrl}/extended/v1/address/${address}/mempool?limit=50`
  );
  const r = await data.json();
  const res = r.results.filter(({ tx_type, tx_status }) => tx_type == "smart_contract" && tx_status === "pending")
    .map((tx) => {
      const sourceCode = String(tx.smart_contract.source_code)
        .replace(/\n/g, " ")
        .replace(/\s{2,}/g, "");
      const MAX_SUPPLY = Number(
        sourceCode
          .match(/\(define-constant MAX_SUPPLY+(.*?)\)\)\)/g)
          ?.find(Boolean)
          ?.match(/u+(.*?)\(/g)
          ?.find(Boolean)
          ?.replace(/[u( ]/g, "")
      );
      const SYMBOL = sourceCode
        .match(/\(define-read-only \(get-symbol\)+(.*?)\)\)/g)
        ?.find(Boolean)
        ?.match(/\"+(.*?)\"/g)
        ?.find(Boolean)
        ?.replace(/[\"]/g, "");
      const DECIMAL = Number(
        sourceCode
          .match(/\(get-decimals\)+(.*?)\)/g)
          ?.find(Boolean)
          ?.match(/\u+(.*?)\)/g)
          ?.find(Boolean)
          ?.replace(/[u() ]/g, "")
      );
      const CONTRACT = tx.smart_contract.contract_id.split(".");
      tx.info = {};
      tx.info.contract_address = CONTRACT[0];
      tx.info.contract_name = CONTRACT[1];
      tx.info.max_supply = MAX_SUPPLY;
      tx.info.symbol = SYMBOL;
      tx.info.decimal = DECIMAL;
      tx.status = 'pending';
      tx.info.label = tx.info.contract_name;
      tx.info.value = tx.info.contract_name;

      return tx;
    });
    return res;
};


export const getTransactions = createAsyncThunk(
    'chain/transactions',
    async (args, x) => {
      try {
        const transactions = await Promise.all([fetchTransactions(args.address), fetchTransactionsMemePool(args.address)]);
        const txs = [ ...transactions[1], ...transactions[0] ];
        return txs;
      } catch (error) {
        return [];
      }
    }
)

const transactionSlice = createSlice({
    name: 'chain',
    initialState: InitialState,
    reducers: {
        setTransactionLoader (state, action) {
            state.transactions.loader = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getTransactions.fulfilled, (state, action) => {
            state.transactions = { loader: false, data: action.payload };
        })
        builder.addCase(getTransactions.rejected, (state, action) => {
            state.transactions = InitialState.transactions;
        })
    },
})

export const { setTransactionLoader } = transactionSlice.actions
export default transactionSlice.reducer
