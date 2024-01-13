import React, { useEffect, useState, useCallback } from "react";
import { openContractCall } from "@stacks/connect";
import {
  contractPrincipalCV,
  standardPrincipalCV,
  uintCV,
  listCV,
  tupleCV,
} from "@stacks/transactions";
import { useForm, useFieldArray } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { useAuth } from "../store/store";
import {
  openTx,
  userAddress,
  proxyAddress,
  validateAddress,
  validateContractAddress,
  getNetwork,
} from "../src/helpers";
import { TransactionStatus } from "../components/TransactionStatus";
import { Loader } from "../components/CirclLoader";
import { Dropdown } from "../components/Dropdown";

const network = getNetwork();

type Holder = {
  address: string;
  amount: number;
};

type FormValues = {
  name: string;
  owner: string;
  recipient: string;
  holders: Array<Holder>;
};

const Distribute = () => {
  const { session, getProvider } = useAuth();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [txns, setTxns] = useState([]);
  const [txnsLoader, setTxnsLoader] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [txId, setTxId] = useState("");

  const defaults = {
    name: "",
    owner: address,
    recipient: address,
    holders: [],
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray<FormValues, "holders", "id">(
    {
      control,
      name: "holders",
    }
  );

  const fetchTransactions = useCallback(async (address: string) => {
    setTxnsLoader(true);
    const data = await fetch(
      `${network.coreApiUrl}/extended/v1/address/${address}/transactions`
    );
    data
      .json()
      .then((r) => {
        setTxnsLoader(false);
        setTxns(
          r.results
            .filter(
              ({ tx_type, tx_status }) =>
                tx_type == "smart_contract" && tx_status === "success"
            )
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

              return tx;
            })
        );
      })
      .catch((error) => {
        setTxnsLoader(false);
      });
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);

  useEffect(() => {
    if (!!address) {
      fetchTransactions(address).catch(console.error);
    }
  }, [address, fetchTransactions]);

  useEffect(() => {
    if (session?.isUserSignedIn()) {
      setAddress(userAddress(session, network));
    }
  }, [session, setAddress]);

  function distribute(data: FormValues) {
    if (!data.name) {
      return;
    }

    const distribution = listCV(
      getValues("holders").map(({ address, amount }) =>
        tupleCV({
          user: standardPrincipalCV(address),
          amt: uintCV(amount),
        })
      )
    );

    openContractCall(
      {
        network,
        contractName: "batch-mint",
        contractAddress: proxyAddress(),
        functionName: "batchmint-and-set-owner",
        functionArgs: [
          contractPrincipalCV(address, data.name),
          standardPrincipalCV(data.owner),
          standardPrincipalCV(data.recipient),
          distribution,
        ],
        onFinish: (data) => {
          reset(defaults);
          setTxId(data.txId);
        },
      },
      getProvider()
    );
  }

  if (!isMounted || !session?.isUserSignedIn()) {
    return null;
  }

  const setAmount = (index, { floatValue }) => {
    setValue(`holders.${index}.amount` as const, floatValue);
  };

  return (
    <div className="deploy">
      {txId ? (
        <TransactionStatus
          onClose={() => {
            setTxId("");
          }}
          title={"Distributing your Meme token"}
          network={network}
          txId={txId}
        />
      ) : (
        <>
          <h4 className="form-title"></h4>
          {(txnsLoader || txns.length > 0) && (
            <div className="deployed-contracts">
              {/* <h2>Deployed Contracts</h2> */}
              {txnsLoader && (
                <Loader width={30} borderWidth={1} customHeight={40} />
              )}
              {/* {txns.map((tx: any, index) =>
                <div className="deployed-contract" key={index}>{tx.smart_contract.contract_id}</div>
              )} */}
            </div>
          )}

          <form onSubmit={handleSubmit(distribute)}>
            <div className={"input"}>
              <label className="label">
                <span>Token name</span>
                <img
                  data-tooltip-id="tooltip"
                  data-tooltip-content={"Token name"}
                  data-tooltip-place="right"
                  src="/info.svg"
                />
              </label>
              <Dropdown 
                {...register('name', { required: true, validate: validateContractAddress })}
                className={( errors['name'] ? 'error-input ' : '' ) +  "" }
                onSelect={(val) => {
                  setValue(`name` as const, val.value);
                }}
                options={txns.map((x: any) => x.info)} />
            </div>

            {/* 
            <div className="input">
            <label className="label">
              <span>Token name</span>
                 <img 
                data-tooltip-id="tooltip"
                data-tooltip-content={'Token name'}
                data-tooltip-place="right"
                src="/info.svg" />
            </label>
              <input
                {...register('name', { required: true, validate: validateContractAddress})}
                placeholder="Token"
              />
            </div> */}

            <div className="input">
              <label className="label">
                <span>Recipient</span>
                <img
                  data-tooltip-id="tooltip"
                  data-tooltip-content={"Recipient address"}
                  data-tooltip-place="right"
                  src="/info.svg"
                />
              </label>
              <input
                className={( errors['recipient'] ? 'error-input ' : '' ) +  "" }
                {...register("recipient", {
                  required: true,
                  validate: validateAddress,
                })}
                placeholder="STXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
            </div>

            <div className="input">
              <label className="label">
                <span>Owner</span>
                <img
                  data-tooltip-id="tooltip"
                  data-tooltip-content={"Owner address"}
                  data-tooltip-place="right"
                  src="/info.svg"
                />
              </label>
              <input
                className={( errors['owner'] ? 'error-input ' : '' ) +  "" }
                {...register("owner", {
                  required: true,
                  validate: validateAddress,
                })}
                placeholder="STXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
              {/* <div>
                {errors.owner?.message && ( <span>{errors.owner?.message}</span> )}
              </div> */}
            </div>

            <div className="input">
              {/* <label className="label">
                <span>Holders</span>
                   <img 
                data-tooltip-id="tooltip"
                data-tooltip-content={'My Tooltip'}
                data-tooltip-place="right"
                src="/info.svg" />
             </label> */}
              {fields.map((field, index) => (
                <div key={field.id} className="Holder">
                  <div className="input-container">
                    <label className="label with-actions">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 5 }}>
                        <span>Holder {index + 1} Address</span>
                        <img
                          data-tooltip-id="tooltip"
                          data-tooltip-content={"Holder Address"}
                          data-tooltip-place="right"
                          src="/info.svg"
                        />
                      </div>
                      { window.innerWidth < 700 && (
                        <button
                          className="X"
                          type="button"
                          style={{ width: 25, height: 28, borderRadius: 3 }}
                          onClick={() => remove(index)}>
                          <img src="trash.svg" style={{ width: 15 }} alt="" />
                        </button>
                      ) }
                    </label>
                    <input
                      {...register(`holders.${index}.address` as const, {
                        validate: validateAddress,
                      })}
                      className={((errors.holders && errors.holders[index]?.address) ? 'error-input ' : '')}
                      placeholder="STXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <div className="input-container">
                    <label className="label">
                      <span>Token amount</span>
                      <img
                        data-tooltip-id="tooltip"
                        data-tooltip-content={"Token amount"}
                        data-tooltip-place="right"
                        src="/info.svg"
                      />
                    </label>
                    <NumericFormat
                      {...register(`holders.${index}.amount` as const, {
                        required: true,
                        min: 1,
                      })}
                      className={((errors.holders && errors.holders[index]?.amount) ? 'error-input ' : '')}
                      thousandSeparator=","
                      min={1}
                      decimalScale={0}
                      onValueChange={(args) => setAmount(index, args)}
                      placeholder="No of Tokens (100XXXXX)"
                    />
                  </div>
                  <div className="remove-holder">
                    <label className="label">&nbsp;</label>
                    <button
                      className="X"
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <img src="trash.svg" alt="" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="form-footer">
              <button
                type="button"
                className="add-holder-btn"
                onClick={(e) => {
                  e.preventDefault();
                  append({ address: "", amount: 0 });
                }}
              >
                Add new holder
                <img src="/plus.svg" alt="" />
              </button>
              <button type="submit" className="Submit deploy-btn">
                <span>Distribute Token</span>
                <img src="/play.svg" alt="" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Distribute;
