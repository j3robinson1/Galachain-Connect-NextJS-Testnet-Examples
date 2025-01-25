import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext'; 
import WalletConnect from '../components/WalletConnect';
import CreateTokenClass from '../components/CreateTokenClass';
import ListTokenClasses from '../components/ListTokenClasses';

export default function Home() {
  const { walletAddress, metamaskClient, isConnected, isRegistered } = useWallet();

  return (
    <div>
      <ListTokenClasses />
      {isConnected && isRegistered ? (
        <>
          <CreateTokenClass walletAddress={walletAddress} metamaskClient={metamaskClient} />
        </>
      ) : (
        <p>Connect & Register your wallet.</p>
      )}
    </div>
  );
}
