import { authenticate, isMobile, openSignatureRequestPopup, AppConfig, showConnect, UserSession } from "@stacks/connect";
import { create } from 'zustand'

export const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export const getWalletProviders = (key = 'leather') => {
  const providers = {
      ['leather']: window.LeatherProvider || window?.StacksProvider,
      ['xverse']: window?.XverseProviders?.StacksProvider,
  }
  return providers[key];
}

export const useAuth = create((set, get) => ({
  session: userSession,


  isConnected: () => {
    return userSession && userSession.isUserSignedIn();
  },

  getProvider: () => {
    const wallet = localStorage.getItem('wallet');
    return getWalletProviders(wallet);
  },

  connect: async (walletId = 'leather') => {
    const session = await authenticate({
      appDetails: {
        name: '....',
        icon: `/src/favicon.svg`
      },
      redirectTo: "/deploy",
      onFinish: () => {
        localStorage.setItem('wallet', walletId);
        window.location.reload();
      },
      userSession,
    }, getWalletProviders(walletId))

    set({ session })
  },

  disconnect: () => {
    get().session.signUserOut("/");
  },
}))
