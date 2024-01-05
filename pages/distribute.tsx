import React, { useEffect, useState, useCallback } from "react";
import { openContractCall } from '@stacks/connect';

import { StacksDevnet, StacksTestnet } from "@stacks/network";
import {
  contractPrincipalCV,
  standardPrincipalCV,
  uintCV,
  listCV,
  tupleCV,
} from '@stacks/transactions';
import { useForm, useFieldArray } from "react-hook-form";
import { NumericFormat } from 'react-number-format';
import { useAuth } from "../store/store";
import { openTx, userAddress, proxyAddress, validateAddress, validateContractAddress } from "../src/helpers";

const network = new StacksTestnet()

type Holder = {
  address: string,
  amount: number,
}

type FormValues = {
  name: string,
  owner: string,
  recipient: string,
  holders: Array<Holder>,
}

const Distribute = () => {

  const { session } = useAuth()

  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [txns, setTxns] = useState([])
  const [address, setAddress] = useState<string>('')

  const defaults = {
    name: '',
    owner: address,
    recipient: address,
    holders: [],
  }

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: defaults,
  })

  const { fields, append, remove } = useFieldArray<FormValues, 'holders', 'id'>({
    control,
    name: 'holders',
  })

  const fetchTransactions = useCallback(async (address: string) => {
    const data = await fetch(`${network.coreApiUrl}/extended/v1/address/${address}/transactions`)
    data.json()
      .then(r => {
        setTxns(
          r.results.filter(({ tx_type, tx_status }) =>
              tx_type == 'smart_contract' && tx_status === "success")
        )
    })
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [setIsMounted])

  useEffect(() => {
    if (!!address) {
      fetchTransactions(address)
        .catch(console.error)
    }
  }, [address, fetchTransactions])

  useEffect(() => {
    if (session?.isUserSignedIn()) {
      setAddress(userAddress(session, network))
    }
  }, [session, setAddress])


  function distribute (data: FormValues) {
    const distribution = listCV(
      fields.map(({ address, amount }) =>
        tupleCV({
          user: standardPrincipalCV(address),
          amt: uintCV(amount),
        })
      ))

    openContractCall({
      network, 
      contractName: 'batch-mint',
      contractAddress: proxyAddress(network),
      functionName: 'batchmint-and-set-owner',
      functionArgs: [
        contractPrincipalCV(address, data.name),
        standardPrincipalCV(data.owner),
        standardPrincipalCV(data.recipient),
        distribution,
      ],
      onFinish: (data) => openTx(network, data),
    })
  }

  if (!isMounted || !session?.isUserSignedIn()) {
    return null;
  }

  const setAmount = (index, { floatValue }) =>
    setValue(`holders.${index}.amount` as const, floatValue)

  return (
    <div className="deploy">
      <h4 className="form-title">Distribute</h4>

      <div className="deployed-contracts">
        <h2>Deployed Contracts</h2>
        {txns.map((tx, index) =>
          <div className="deployed-contract" key={index}>{tx.smart_contract.contract_id}</div>
        )}
      </div>

      <form onSubmit={handleSubmit(distribute)}>
        <div className="input">
          <label>Token name</label>
          <input
            {...register('name', { required: true, validate: validateContractAddress})}
            placeholder="token"
          />
        </div>
        <div className="input">
          <label>Owner</label>
          <input
            {...register('owner', { required: true, validate: validateAddress })}
            placeholder="STXXXXXXXXXXXXXXXX"
          />
          {/* <div>
            {errors.owner?.message && ( <span>{errors.owner?.message}</span> )}
          </div> */}
        </div>
        <div className="input">
          <label>Recipient</label>
          <input
            {...register('recipient', { required: true, validate: validateAddress })}
            placeholder="STXXXXXXXXXXXXXXXX"
          />
        </div>

        <div className="input">
          <label>Holders</label>
          {fields.map((field, index) => (
            <div key={field.id} className="Holder">
              <input
                {...register(`holders.${index}.address` as const, { validate: validateAddress })}
                placeholder="STXXXXXXXXXXXXXXXX"
              />
              <NumericFormat 
                {...register(`holders.${index}.amount` as const, { required: true, min: 1 })}
                thousandSeparator=","
                min={1}
                decimalScale={0}
                onValueChange={(args) => setAmount(index, args)}
                placeholder="Tokens"
              />
              <button className="X" onClick={() => remove(index)}>X</button>
            </div>
          ))}
        </div>

        <button className="mb-8" onClick={(e) => { 
          e.preventDefault();
          append({ address: '', amount: 0 })}
        }>
          Add holder
        </button>

        <button type="submit" className="Submit deploy-btn" style={{ marginLeft: '72%' }}>
          <span>Distribute Token</span>
          <img src="/play.svg" alt="" />
        </button>
      </form>
    </div>
  );
};

export default Distribute;
