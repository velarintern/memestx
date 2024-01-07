import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../store/store";
import { useConnect } from "../hooks/useConnect";
import { getViewableAddress } from "../helpers/indext";
import { isMobile, isStacksWalletInstalled } from "@stacks/connect";

const ConnectWallet = (props) => {
  const memerConnect = useConnect();
  const [isMounted, setIsMounted] = useState()
  const { connect, disconnect, session } = useAuth()
  const [ showconnect, setShowConnect ] = useState(false);
  const [ showdisconnect, setShowDisConnect ] = useState(false);
  const fromBody = props.fromBody;
  const ref = useRef(null);
  const disref = useRef(null);


  useEffect(() => {
    const handleOutSideClick = (event) => {
      if (event.target.getAttribute('data-walletmodal') !== '1') {
        setShowConnect(false);
        setShowDisConnect(false);
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [ref]);

  useEffect(() => {
    setIsMounted(true)
  }, [setIsMounted])

  if (!isMounted) {
    return null
  }

  const xverseWalletConnect = () => {
    if (!isStacksWalletInstalled() && isMobile()) {
        setTimeout(() => {
            window.location.href = "https://www.xverse.app/"
        }, 30)
        window.location.href = `xverse://browser?url=${encodeURIComponent(
            window.location.href,
        )}`
    } else {
        connect('xverse');
    }
  }

  const onWalletClick = (walletId) => {
    if (!isLeather() && walletId === 'leather') {
        window.open('https://leather.io/', '_blank')
    } else if (!isXVerse() && walletId === 'xverse') {
        window.open('https://www.xverse.app/', '_blank')
    } else {
      if (walletId === 'xverse') {
        xverseWalletConnect();
      } else {
        connect(walletId);
      }
    }
  }

  const isLeather = () => {
    return window.LeatherProvider || window?.StacksProvider
  }

  const isXVerse = () => {
    return window.LeatherProvider || window?.StacksProvider
  }

  const connectModal = () => {
    return (
      <div data-walletmodal="1" ref={ref} className={( showconnect ? 'active ' : '' ) + "wallet-connect-modal"}>
          <div data-walletmodal="1" className="wallet-connect-box">
            <h2 data-walletmodal="1">Hey! Connect your wallet first...</h2>
            <p data-walletmodal="1">Connecting wallet makes your experience 10x better.</p>
            <div data-walletmodal="1" className="wallets">

              <div onClick={() => onWalletClick('leather') } data-walletmodal="1" className="wallet first">
                  <div className="wallet-left">
                      <img data-walletmodal="1" src="/leather.svg" alt="" />
                      <span data-walletmodal="1">Leather</span>
                      {!isLeather() && (
                        <span data-walletmodal="1" style={{ color: '#aaa', fontSize: 12, position: 'relative', top: 2 }}>Not Installed</span>
                      )}
                  </div>
                  {!isLeather() && (
                    <img data-walletmodal="1" src="/wallet-arrow.svg" alt="" />
                  )}
              </div>
              <div onClick={() => onWalletClick('xverse') } data-walletmodal="1" className="wallet">
                  <div className="wallet-left">
                    <img data-walletmodal="1" src="/xverse.svg" alt="" />
                    <span data-walletmodal="1">Xverse</span>
                    {!isXVerse() && (
                      <span data-walletmodal="1" style={{ color: '#aaa', fontSize: 12, position: 'relative', top: 2 }}>Not Installed</span>
                    )}
                  </div>
                  {!isXVerse() && (
                    <img data-walletmodal="1" src="/wallet-arrow.svg" alt="" />
                  )}
              </div>
            </div>
          </div>
      </div>
    )
  }

  const onWalletDisconnect = () => {
    disconnect();
    localStorage.clear();
  }

  const disconnectModal = () => {
    return (
      <div data-walletmodal="1" ref={disref} className={( showdisconnect ? 'active ' : '' ) + "wallet-connect-modal"}>
          <div data-walletmodal="1" className="wallet-connect-box">
            <h2 data-walletmodal="1">Disconnect your wallet?</h2>
            <p data-walletmodal="1">You won’t be able to see your deployed tokens after disconnecting wallet.</p>
            <div data-walletmodal="1" className="wallets">
              <div onClick={() => onWalletDisconnect() } data-walletmodal="1" className="switch wallet">
              <div className="wallet-left">
                <img data-walletmodal="1" src="/switch.svg" alt="" />
                <span data-walletmodal="1">Disconnect wallet</span>
                </div>
              </div>
            </div>
          </div>
      </div>
    )
  }

  const button = session && session.isUserSignedIn()
    ? (
      <button className="Connected" onClick={() => setShowDisConnect(!showdisconnect) }>
        { getViewableAddress(memerConnect.getAddress()) }
      </button>
    ) : (
      <button className="Connect" onClick={() => setShowConnect(!showconnect) }>
        <span>Connect Wallet</span>
        <img src="/play.svg" alt="" />
      </button>
    )
    return (
      <div data-walletmodal="1">
        { button } 
        { connectModal() }   
        { disconnectModal() }
      </div>
    )
};

export default ConnectWallet;
