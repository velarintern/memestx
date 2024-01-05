import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { create } from 'zustand'

export const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export const useAuth = create((set, get) => ({
  session: userSession,


  isConnected: () => {
    return userSession && userSession.isUserSignedIn();
  },

  connect: async () => {
    const session = await showConnect({
      appDetails: {
        name: '....',
        icon: `/src/favicon.svg`
      },
      redirectTo: "/deploy",
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    })

    set({ session })
  },

  disconnect: () => {
    get().session.signUserOut("/");
  },
}))
