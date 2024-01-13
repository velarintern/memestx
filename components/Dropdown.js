import { useState } from "react";
import { getFirstAndLast, explorerAddress } from "../src/helpers";

export const Dropdown = (props) => {
    const [ selected, setSelected ] = useState(null);
    const [ search, setSearch ] = useState('');
    const [ show, setShow ] = useState(false);
    const options = props.options || [];
    const className = props.className || '';

    const onSelect = (val) => {
        props.onSelect && props.onSelect(val)
        setSelected(val); 
        setShow(false);
    }
    return (
        <div name={props.name} className={ className + "dropdown-container" }>
            <div onClick={() => setShow(!show) } className={(!show ? 'hidden ' : '') + 'selected hand' }>
                <div>
                    <div className="token">
                        { selected ? (
                        <span className="tokenname">{ selected.label }</span>
                        ) : (
                            <span className="tokenname placeholder">Select Token</span>
                        )}
                        { selected && (
                            <a target="_blank" rel="noreferrer" href={explorerAddress(selected.contract_address + '.' + selected.value)} className="hash">
                                { getFirstAndLast(selected.contract_address) }
                                <img src="/ref.svg" alt="" />
                            </a>
                        )}
                    </div>
                    { selected && (
                        <div className="metadata">
                            <span>Max Supply : { selected.max_supply }</span>
                            <span>Symbol : { selected.symbol }</span>
                            <span>Decimal : { selected.decimal }</span>
                        </div>
                    )}
                </div>
                <div className="token-info">
                    <img className="hand arrow" src="/arrow-down.svg" alt="" />
                    {/* <span>Decimal: { option.decimal }</span> */}
                    {/* <span>Symbol: { option.symbol }</span> */}
                </div>               
            </div>
            <div className={ show ? "dropdown" : 'dropdown hidden' }>
                <div className="options">
                    <h2>Deployed contracts</h2>
                    <div className="input">
                        <img src="/search.svg" alt="" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search deployed tokens" />
                    </div>
                    <ul>
                        {options.filter((x) => x.label.indexOf(search) > -1).map((option, index) => {
                            return <li onClick={() => {  onSelect(option) } } key={index}>
                                <div className="token">
                                    <span className="index">{ index + 1 }</span>
                                    <span className="tokenname">{ option.label }</span>
                                    <a target="_blank" rel="noreferrer" href={explorerAddress(option.contract_address + '.' + option.value)} className="hash">
                                        { getFirstAndLast(option.contract_address) }
                                        <img src="/ref.svg" alt="" />
                                    </a>
                                </div>
                                <div className="token-info">
                                    <span className="supply">Max Supply : { option.max_supply }</span>
                                    {/* <span>Decimal: { option.decimal }</span> */}
                                    {/* <span>Symbol: { option.symbol }</span> */}
                                </div>
                            </li>
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}