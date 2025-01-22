import React from 'react';
import Header from '../components/Header';
import '../styles/styles.css';

function MyApp({ Component, pageProps }) {
  return (
    <div className="container">
      <Header />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
