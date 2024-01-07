import { useState } from "react";

export function Loader(props) {
    const { completed } = props;
    const width = props.width || 100;
    const style = props.style || {};
    const height = width;
    const borderWidth = props.borderWidth || 5;
    const customHeight = props.customHeight || height - 5;
    const color = props.color || '#E4761B';

    return (
        <div style={style}>
            { !completed ? (
                <div className="lds-ring" style={{ '--d' : '1.2', width, height: customHeight }}>
                    <div style={{ borderColor: color + ' transparent transparent transparent', width, height, borderWidth: borderWidth }}></div>
                    <div style={{ borderColor: color + ' transparent transparent transparent', width, height, borderWidth: borderWidth }}></div>
                    <div style={{ borderColor: color + ' transparent transparent transparent', width, height, borderWidth: borderWidth }}></div>
                    <div style={{ borderColor: color + ' transparent transparent transparent', width, height, borderWidth: borderWidth }}></div>
                </div>
            ) : (
                <div className='lds-done'>
                    <img src='/assets/imgs/tick.png' />
                </div> 
            ) }
        </div>
    )
}