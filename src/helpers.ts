import { UserSession, FinishedTxData } from '@stacks/connect';
import { StacksNetwork, StacksTestnet, StacksMainnet, StacksDevnet } from '@stacks/network';
import {
  standardPrincipalCV,
  contractPrincipalCV,
} from '@stacks/transactions';
import { Config } from '../config';
import { NETWORKS } from '../constants';

export const validateAddress = (adr: string) => {
  try {
    standardPrincipalCV(adr)
    return true
  } catch (e) {
    return false
  }
}

export const parseSTXAddress = (adr: string) => {
  try {
    const parts = (adr).split('.');
    return { address: parts[0], name: parts[1] };
  } catch (e) {
    return  { address: '', name: '' };
  }
}

export const validateContractAddress = (adr: string) => {
  try {
    // contractPrincipalCV(adr.split(".")[0], adr.split(".")[1])
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export function userAddress (session :UserSession, network: StacksNetwork) {
  try {
    const network = Config.NETWORK;
    if (network === NETWORKS.MAINNET) {
      return session?.loadUserData()?.profile?.stxAddress?.mainnet;
    } else if (network === NETWORKS.TESTNET) {
      return session?.loadUserData()?.profile?.stxAddress?.testnet;
    } else if (network === NETWORKS.DEVNET) {
      return 'DEVNET';
    } else {
      return session?.loadUserData()?.profile?.stxAddress?.testnet;
    }
  } catch (_) {
    return ''
  }
}

// TODO: mainnet/testnet addresses

const isDevnet = (network: StacksNetwork) =>
  network?.coreApiUrl === 'http://localhost:3999'

export const proxyAddress = () => {
  const network = Config.NETWORK;
  if (network === NETWORKS.MAINNET) {
    return Config.PROXY_ADDRESS || `SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY`;
  } else if (network === NETWORKS.TESTNET) {
    return Config.PROXY_ADDRESS || `ST20X3DC5R091J8B6YPQT638J8NR1W83KN6JQ4P6F`;
  } else if (network === NETWORKS.DEVNET) {
    return Config.PROXY_ADDRESS || `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`;
  } else {
    return Config.PROXY_ADDRESS || `ST20X3DC5R091J8B6YPQT638J8NR1W83KN6JQ4P6F`;
  }
}

export const explorerTx = (txid: string) => {
  const network = Config.NETWORK;
  if (network === NETWORKS.MAINNET) {
    return `https://explorer.hiro.so/txid/${txid}?chain=mainnet`;
  } else if (network === NETWORKS.TESTNET) {
    return `https://explorer.hiro.so/txid/${txid}/?chain=testnet`;
  } else if (network === NETWORKS.DEVNET) {
    return `http://localhost:8000/txid/${txid}?chain=testnet&api=http://localhost:3999`;
  } else {
    return `https://explorer.hiro.so/txid/${txid}/?chain=testnet`;
  }
}

export const explorerAddress = (txid: string) => {
  const network = Config.NETWORK;
  if (network === NETWORKS.MAINNET) {
    return `https://explorer.hiro.so/address/${txid}?chain=mainnet`;
  } else if (network === NETWORKS.TESTNET) {
    return `https://explorer.hiro.so/address/${txid}/?chain=testnet`;
  } else if (network === NETWORKS.DEVNET) {
    return `http://localhost:8000/address/${txid}?chain=testnet&api=http://localhost:3999`;
  } else {
    return `https://explorer.hiro.so/address/${txid}/?chain=testnet`;
  }
}


export function openTx(data: FinishedTxData) {
  window?.open(
    explorerTx(data.txId),
      "_blank"
    )?.focus();
}

export const getNetwork = () => {
  const network = Config.NETWORK;
  if (network === NETWORKS.MAINNET) {
    return new StacksMainnet();
  } else if (network === NETWORKS.TESTNET) {
    return new StacksTestnet();
  } else if (network === NETWORKS.DEVNET) {
    return new StacksDevnet();
  } else {
    return new StacksTestnet();
  }
}

export const getFirstAndLast = (val) => {
  return `${val.substr(0, 4)} ... ${val?.substr(val?.length - 4)}`
}
