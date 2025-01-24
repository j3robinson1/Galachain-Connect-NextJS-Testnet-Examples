import React from 'react';
import Header from '../components/Header';
import { WalletProvider } from '../context/WalletContext';
import '../styles/styles.css';

function MyApp({ Component, pageProps }) {

  return (
    <WalletProvider>
      <div className="container">
        <Header />
        <Component {...pageProps} />
      </div>
    </WalletProvider>
  );
}

export default MyApp;
