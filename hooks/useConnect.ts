import { Config } from "../config";
import { NETWORKS } from "../constants";
import { useAuth } from "../store/store"

export const useConnect = () => {
    const { session } = useAuth()

    const getAddress = () => {
        const network = Config.NETWORK;
        if (network === NETWORKS.MAINNET) {
          return  session.store?.getSessionData()?.userData?.profile?.stxAddress?.mainnet;
        } else if (network === NETWORKS.TESTNET) {
          return  session.store?.getSessionData()?.userData?.profile?.stxAddress?.testnet;
        } else if (network === NETWORKS.DEVNET) {
          return session.store?.getSessionData()?.userData?.profile?.stxAddress?.testnet;
        } else {
          return  session.store?.getSessionData()?.userData?.profile?.stxAddress?.testnet;
        }
    }
    return { getAddress }
}