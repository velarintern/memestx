import { useEffect, useState } from "react";
import { useAuth } from "../store/store";
import { useConnect } from "../hooks/useConnect";
import { getViewableAddress } from "../helpers/indext";

const ConnectWallet = (props) => {
  const memerConnect = useConnect();
  const [isMounted, setIsMounted] = useState()
  const { connect, disconnect, session } = useAuth()
  const fromBody = props.fromBody;
  
  useEffect(() => {
    setIsMounted(true)
  }, [setIsMounted])

  if (!isMounted) {
    return null
  }

  const button = session && session.isUserSignedIn()
    ? (
      <button className="Connected" onClick={disconnect}>
        { getViewableAddress(memerConnect.getAddress()) }
      </button>
    ) : (
      <button className="Connect" onClick={connect}>
        <span>Connect Wallet</span>
        <img src="/play.svg" alt="" />
      </button>
    )
    return button;
};

export default ConnectWallet;
