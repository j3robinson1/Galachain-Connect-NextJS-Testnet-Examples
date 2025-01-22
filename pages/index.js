import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [metamaskClient, setMetamaskClient] = useState(null);

  const handleWalletConnect = (address, connected, client) => {
    setWalletAddress(address);
    setIsConnected(connected);
    setMetamaskClient(client);
  };

  return (
    <div>
      <h1>TestNet API Examples</h1>
      <WalletConnect onConnect={handleWalletConnect} />
      {isConnected ? (
        <>
          <p>TODO - Token Contract</p>
          <ul>
            <li>Balance</li>
            <li>Transfer</li>
            <li>Burn</li>
          </ul>
        </>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
}
