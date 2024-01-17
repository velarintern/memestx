import { useEffect, useReducer, useState } from "react";
import { explorerAddress, explorerTx, getFirstAndLast } from "../src/helpers"
import { transactionInitialState, transactionReducer } from "../store/transaction";
import { useSelector } from "react-redux";
import { Loader } from "./CirclLoader";

export const Activity = (props) => {
    const tx = useSelector((x) => x.transaction);
    const [ search, setSearch ] = useState('');
    const [isMounted, setIsMounted] = useState(false);


    useEffect(() => {
        setIsMounted(true);
    }, [])

    if (!isMounted) {
        return null;
    }

    return (
        <div className="activity-table table-responsive">
            <div className="header">
                <h3>Activity</h3>
                <div className="flex-gap-5">
                    <div className="input-with-icon">
                        <img src="/search.svg" alt="" />
                        <input value={search} onChange={(e) => setSearch(e.target.value.toLowerCase())} placeholder="Search deployed tokens" type="text" />
                    </div>
                    { tx.transactions.loader && (
                        <Loader width={30} borderWidth={1} customHeight={25} />
                    ) }
                </div>
            </div>
            <div className="activity-table-scrollable">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: 20 }}>#</th>
                            <th>Name</th>
                            <th className="text-right">Status</th>
                            <th className="text-right">Symbol</th>
                            <th className="text-right">Decimals</th>
                            <th className="text-right">Max Supply</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tx.transactions.data.filter((tx) => tx?.info?.contract_name?.toLowerCase()?.indexOf(search) > -1 ).map((tx, index) => {
                            return (
                                <tr key={index}>
                                    <td>{ (index + 1) }</td>
                                    <td className="title">
                                        <span>{ tx.info.contract_name }</span>
                                        <a target="_blank" rel="noreferrer" href={explorerTx(tx.tx_id)} className="hash">
                                            { getFirstAndLast(tx.tx_id) }
                                            <img src="/ref.svg" alt="" />
                                        </a>
                                    </td>
                                    <td className="text-right">
                                        <div className="status flex-end flex-gap-5">
                                            { tx.status === 'success' ? (
                                                <>
                                                    <img src="/check_success.svg" alt="" />
                                                    <span className="status-success">Deployed</span>
                                                </>
                                            ) : (tx.status === 'pending') ? (
                                                <>
                                                    <img src="/check_pending.svg" alt="" />
                                                    <span className="status-pending">Deploying</span>
                                                </>
                                            ) : (
                                                <>
                                                    <img src="/check_pending.svg" alt="" />
                                                    <span className="status-error">Failed</span>
                                                </>
                                            ) }
                                        </div>
                                    </td>
                                    <td className="text-white text-right">{ tx.info.symbol }</td>
                                    <td className="text-white text-right">{ tx.info.decimal }</td>
                                    <td className="text-white text-right">{ tx.info.max_supply }</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}