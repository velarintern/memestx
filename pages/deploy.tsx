import React, { useEffect, useReducer, useState } from "react";
import { openContractDeploy } from '@stacks/connect';
import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from 'react-number-format';
import { useAuth } from "../store/store";
import { proxyAddress, openTx, getNetwork, userAddress } from "../src/helpers";
import { PostConditionMode } from "@stacks/transactions";
import { TransactionStatus } from "../components/TransactionStatus";
import { Config } from "../config";
import { Activity } from "../components/Activity";
import { getTransactions, setTransactionLoader } from "../store/slices/transactionSlice";
import { useDispatch } from "react-redux";
const network = getNetwork();

type FormValues = {
  name: string,
  symbol: string,
  decimals: number,
  supply: number,
  uri: string,
}

const Deploy = () => {

  const { session, getProvider } = useAuth()
  const defaults = {
    name: '',
    symbol: '',
    decimals: '',
    supply: '',
    uri: '',
  }

  const [isMounted, setIsMounted] = useState(false)
  const [ txId, setTxId ] = useState('');
  const [address, setAddress] = useState<string>("");
  const dispatch = useDispatch();

  const { register, handleSubmit, setValue, control, reset,  formState: { errors } } = useForm({
      defaultValues: defaults,
  });

  useEffect(() => {
    if (session?.isUserSignedIn()) {
      setAddress(userAddress(session, getNetwork()));
    }
  }, [session, setAddress]);

  useEffect(() => {
    dispatch(setTransactionLoader(true));
    const interval  = setInterval(() => {
      if (!!address) {
        dispatch(getTransactions({ address }));
      }
    }, 6000);
    return () => { clearInterval(interval) }
  }, [address]);
  
  useEffect(() => {
    setIsMounted(true)
  }, [setIsMounted])

  // useEffect(() => {
  //   if (!!address) {
  //     dispatch(getTransactions({ address }));
  //   }
  // }, [address]);

  const template = (d: FormValues) => `(impl-trait '${proxyAddress()}.ft-trait.ft-trait)

  (define-constant MAX_SUPPLY (* u${d.supply} (pow u10 u${d.decimals})))

  (define-fungible-token ${d.name} MAX_SUPPLY)

  (define-constant err-check-owner (err u1))
  (define-constant err-transfer    (err u4))

  (define-data-var owner principal tx-sender)

  (define-private (check-owner)
    (ok (asserts! (is-eq tx-sender (var-get owner)) err-check-owner)))

  (define-public (set-owner (new-owner principal))
    (begin
    (try! (check-owner))
    (ok (var-set owner new-owner)) ))

  (define-public
    (transfer
      (amt  uint)
      (from principal)
      (to   principal)
      (memo (optional (buff 34))))
    (begin
      (asserts! (is-eq tx-sender from) err-transfer)
      (ft-transfer? ${d.name} amt from to)))


  (define-public (mint (amt uint) (to principal))
    (begin
      (try! (check-owner))
      (ft-mint? ${d.name} amt to) ))

  (define-read-only (get-name)                   (ok "${d.name}"))
  (define-read-only (get-symbol)                 (ok "${d.symbol}"))
  (define-read-only (get-decimals)               (ok u${d.decimals}))
  (define-read-only (get-balance (of principal)) (ok (ft-get-balance ${d.name} of)))
  (define-read-only (get-total-supply)           (ok (ft-get-supply ${d.name})))
  (define-read-only (get-max-supply)             (ok MAX_SUPPLY))
  (define-read-only (get-token-uri)              (ok (some u"${d.uri}")))
  `

  function deploy(data: FormValues) {
    openContractDeploy({
      network,
      contractName: data.name,
      codeBody: template(data),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => { 
        reset(defaults);
        setTxId(data.txId)
      },      
    }, getProvider() );
  }

  if (!isMounted || !session?.isUserSignedIn()) {
    return null;
  }

  const setSupply = (args) => setValue('supply', args.floatValue)

  return (
    <div className="deploy">
      {txId ? (
        <TransactionStatus 
          onClose={() => {
            setTxId('')
          }}
          title={'Creating your Meme token'}
          network={network} txId={txId} />
      ) : (
        <form onSubmit={handleSubmit(deploy as any)}>
          <h4 className="form-title"></h4>
          <div className="input">
            <label className="label">
              <span>Name</span>
              <img 
                data-tooltip-id="tooltip"
                data-tooltip-content={'Name of Token'}
                data-tooltip-place="right"
                src="/info.svg" />
            </label>
            <input  
                className={( errors['name'] ? 'error-input ' : '' ) +  "form-control-material" }
              {...register('name', { required: true })} placeholder="Meme Name" />
          </div>
          <div className="input">
            <label className="label">
              <span>Symbol</span>
                <img 
                data-tooltip-id="tooltip"
                data-tooltip-content={'Symbol of Token'}
                data-tooltip-place="right"
                src="/info.svg" />
            </label>
            <input 
              className={( errors['symbol'] ? 'error-input ' : '' ) +  "form-control-material" }
              {...register('symbol', { required: true })} placeholder="Meme" />
          </div>
          <div className="input">
            <label className="label">
              <span>Decimals</span>
                <img 
                data-tooltip-id="tooltip"
                data-tooltip-content={'Token decimals e.g 6'}
                data-tooltip-place="right"
                src="/info.svg" />
            </label>
            <input 
              className={( errors['decimals'] ? 'error-input ' : '' ) +  "form-control-material" }
              type="number" {...register('decimals', { required: true, min: 0, max: 10 })} placeholder="0 - 10" />
          </div>
          <div  className="input">
            <label className="label">
              <span>Supply</span>
                <img 
                data-tooltip-id="tooltip"
                data-tooltip-content={'Token Supply e.g 10,000,000,000'}
                data-tooltip-place="right"
                src="/info.svg" />
            </label>
            <Controller
              control={control}
              name="supply"
              rules={{ required: true }}
              render={({ field }) => (
                  <NumericFormat
                    {...field}
                    className={( errors['supply'] ? 'error-input ' : '' ) +  "form-control-material" }
                    thousandSeparator=","
                    min={1}
                    decimalScale={0}
                    onValueChange={setSupply}
                    onChange={() => null}
                    placeholder="10,000,000,000"
                  />
              )}
            />
          </div>
          <div className="input">
            <label className="label">
              <span>URI</span>
                <img 
                data-tooltip-id="tooltip"
                data-tooltip-content={'Token URI e.g https://example.com'}
                data-tooltip-place="right"
                src="/info.svg" />
            </label>
            <input {...register('uri')} placeholder="https://example.com" />
          </div>
          <div className="form-footer">
            <button type="submit" className="Submit deploy-btn">
              <span>Deploy Token</span>
              <img src="/play.svg" alt="" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Deploy;
