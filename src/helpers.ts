import { UserSession, FinishedTxData } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';
import {
  standardPrincipalCV,
  contractPrincipalCV,
} from '@stacks/transactions';

export const validateAddress = (adr: string) => {
  try {
    standardPrincipalCV(adr)
    return true
  } catch (e) {
    return false
  }
}

export const validateContractAddress = (adr: string) => {
  try {
    contractPrincipalCV(adr.split(".")[0], adr.split(".")[1])
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export function userAddress (session :UserSession, network: StacksNetwork) {
  try {
    return network?.isMainnet()
      ? session?.loadUserData()?.profile?.stxAddress?.mainnet
      : session?.loadUserData()?.profile?.stxAddress?.testnet
  } catch (_) {
    return ''
  }
}

// TODO: mainnet/testnet addresses

const isDevnet = (network: StacksNetwork) =>
  network?.coreApiUrl === 'http://localhost:3999'

export const proxyAddress = (network: StacksNetwork) =>
  network.isMainnet()
    ? ''
      : isDevnet(network)
        ? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' //'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
        : 'ST20X3DC5R091J8B6YPQT638J8NR1W83KN6JQ4P6F'

export const explorerAddress = (network: StacksNetwork, txid: string) =>
  network?.isMainnet()
    ? `https://explorer.hiro.so/txid/${txid}?chain=mainnet`
      : isDevnet(network)
        ? `http://localhost:8000/txid/${txid}?chain=testnet&api=http://localhost:3999`
        : `https://explorer.hiro.so/txid/${txid}/?chain=testnet`

export function openTx(network: StacksNetwork, data: FinishedTxData) {
  console.log(data)
  window?.open(
      explorerAddress(network, data.txId),
      "_blank"
    )?.focus();
}
