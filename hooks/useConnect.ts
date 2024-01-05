import { useAuth } from "../store/store"

export const useConnect = () => {
    const { session } = useAuth()

    const getAddress = () => {
        const address = session.store?.getSessionData()?.userData?.profile?.stxAddress?.testnet;
        return address;
    }
    return { getAddress }
}