import React, { useEffect, useState } from 'react';
import { useAuth, appConfig } from "../store/store";
import ConnectWallet from "../components/ConnectWallet";

import "../styles/globals.css";
import Link from "next/link";
import { useRouter } from 'next/router';
import { useConnect } from '../hooks/useConnect';
import { Tooltip as ReactTooltip } from "react-tooltip";

function MyApp({ Component, pageProps }) {
  const { session, isConnected } = useAuth();
  const [domLoaded, setDomLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.route === '/') {
      router.push('/deploy');
    }
    setDomLoaded(true)
  }, [])

  return (
    <>
      <div className="navbar">
        <h4 className='title'>MemeSTX</h4>
        <div className='actions'>
          {/* <Link href="/deploy">
            <a className={ router.route === "/deploy" ? 'active' : '' } href=''>Deploy</a>
          </Link>
          <Link href="/distribute">
            <a className={ router.route === "/distribute" ? 'active' : '' } href=''>Distribute</a>
          </Link> */}
        </div>
        <div className='wallet'>
          <ConnectWallet />
        </div>
      </div>
      <section className='body'>
        <div className='onboarding'>
          <h1 className='launch'>Launch your own</h1>
          <h1 className='memecoin'>Memecoin on STX</h1>
          <p className='details'>Memecoin standard and deployment tool designed to ensure a maximum safety for memecoin traders.</p>
          {/* <button className='launch-meme-coin'>
            <span className='text'>Launch Memecoin</span>
            <span className='icon'>
              <img src='/fi_arrow-right.svg' alt='' />
            </span>
          </button> */}

          <div className='avatar-group'>
            <img src='avatar-group.svg' alt='' />
            <span>Launched 700+ Meme tokens</span>
          </div>
        </div>
        {domLoaded && (
          router.route !== "/" && (
            <div className='contract-form-container'>
                <React.Fragment>
                  <div className='form-navbar'>
                    <Link href="/deploy">
                      <a className={ router.route === "/deploy" ? 'active' : '' } href=''>Deploy</a>
                    </Link>
                    <Link href="/distribute">
                      <a className={ router.route === "/distribute" ? 'active' : '' } href=''>Distribute</a>
                    </Link>
                  </div>
                {isConnected() ? (
                  <div className='contract-form-body'>
                      <Component {...pageProps} />
                  </div>
                    ) : (
                      <div style={{ maxWidth: 'fit-content', display: 'flex', padding: '15px', margin: '0 auto', minHeight: 200, alignItems: 'center', justifyContent: 'center' }}>
                          <ConnectWallet fromBody={true} />
                      </div>
                    )}
              </React.Fragment>
            </div>
          )
        )}
      </section>
      <ReactTooltip id="tooltip" place="bottom" />
    </>
  );
}

export default MyApp;
