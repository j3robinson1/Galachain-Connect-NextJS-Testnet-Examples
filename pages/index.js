import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext'; 
import WalletConnect from '../components/WalletConnect';
import CreateTokenClass from '../components/CreateTokenClass';
import ListTokenClasses from '../components/ListTokenClasses';

export default function Home() {
  const { walletAddress, metamaskClient, isConnected } = useWallet();

  return (
    <div>
      <h1>TestNet API Examples</h1>
      {isConnected ? (
        <>
          <CreateTokenClass walletAddress={walletAddress} metamaskClient={metamaskClient} />
          <ListTokenClasses />
        </>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
}
