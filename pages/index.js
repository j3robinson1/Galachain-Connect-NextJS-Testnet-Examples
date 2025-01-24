import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import CreateTokenClass from '../components/CreateTokenClass';
import ListTokenClasses from '../components/ListTokenClasses';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [metamaskClient, setMetamaskClient] = useState(null);

  const handleWalletConnect = (address, connected, client) => {
    setWalletAddress(address);
    setIsConnected(connected);
    setMetamaskClient(client);
  };

  const handleRegistration = (isRegistered) => {
    setIsConnected(isRegistered);
  };

  return (
    <div>
      <h1>TestNet API Examples</h1>
      <WalletConnect onConnect={handleWalletConnect} onRegistered={handleRegistration} />
      {isConnected ? (
        <>
          <CreateTokenClass walletAddress={`eth|${walletAddress.slice(2)}`} metamaskClient={metamaskClient} />
          <ListTokenClasses />
        </>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
}
