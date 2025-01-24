// WalletContext.js
import React, { createContext, useState, useContext } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [metamaskClient, setMetamaskClient] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        isConnected,
        setIsConnected,
        metamaskClient,
        setMetamaskClient,
        isRegistered,
        setIsRegistered,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
