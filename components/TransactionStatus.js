import { StacksMainnet } from "@stacks/network"
import { Loader } from "./CirclLoader"
import { explorerAddress } from "../src/helpers";
import { useEffect } from "react";

export const TransactionStatus = (props) => {
    const network = props.network || StacksMainnet;
    const txId = props.txId;
    const title = props.title;

    useEffect(() => {
        setTimeout(() => {
            props.onClose && props.onClose();
        }, 5000);
    }, []);

    return (
        <div className="transaction-status">
            <Loader color={'#fff'} width={60} borderWidth={1.5} customHeight={85} />
            <h2>{ title }</h2>
            <p>Transaction is in progress. View on explorer for more info.</p>
            <a target="_black" href={explorerAddress(network, txId)}>
                <span>View on explorer</span>
                <img src="/arrow-black.svg" alt="" />
            </a>
        </div>
    )
}