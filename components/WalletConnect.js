import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserConnectClient } from '@gala-chain/connect';

const WalletConnect = ({ onConnect, onRegistered }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [metamaskClient, setMetamaskClient] = useState(null);

  useEffect(() => {
    const client = new BrowserConnectClient();
    setMetamaskClient(client);
  }, []);

  const connectWallet = async () => {
    try {
      await metamaskClient.connect();
      let address = await metamaskClient.ethereumAddress;
      setWalletAddress(address);
      const isRegistered = await checkRegistration(address);
      if (!isRegistered) {
        await registerEthUser(address);
      }
      onConnect(address, isRegistered, metamaskClient);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      onConnect('', false, null);
    }
  };

  const checkRegistration = async (address) => {
    try {
      const response = await getAlias(address);
      if (response.data.Data && response.data.Data.alias) {
        setIsRegistered(true);
        setWalletAddress(`eth|${address.slice(2)}`);
        return true;
      } else {
        setIsRegistered(false);
        return false;
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('User Not Found, proceeding with registration...');
        return false;
      } else {
        console.error('Check registration error:', err);
        setIsRegistered(false);
        return false;
      }
    }
  };

  const getAlias = async (address) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_TESTNET_PUBLIC_KEY_CONTRACT}/GetObjectByKey`, {
      objectId: `\u0000GCUP\u0000${address.replace('0x', '').replace('eth|', '')}\u0000`,
    });
  };

  const registerEthUser = async (address) => {
    if (!address) return;
    setIsRegistering(true);

    try {
      const publicKey = await metamaskClient.getPublicKey();
      const userAlias = `eth|${address.slice(2)}`;

      const dto = {
        publicKey: publicKey.publicKey,
        user: userAlias,
        dtoType: 'RegisterEthUser'
      };

      const adminSignature = await getAdminSignature(dto);
      dto.signature = adminSignature;

      delete dto.dtoType;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_TESTNET_PUBLIC_KEY_CONTRACT}/RegisterEthUser`,
        dto
      );

      console.log('Registration successful:', response.data);
      setWalletAddress(response.data.Data);
      setIsRegistering(false);
      setIsRegistered(true);
      onRegistered(true);
    } catch (err) {
      console.error('Error registering user:', err);
      if (err.code === 4001) { 
        console.log('User cancelled the registration.');
      }
      setIsRegistering(false);
      setIsRegistered(false);
    }
  };

  const getAdminSignature = async (dto) => {
    try {
      const response = await axios.post(`/api/sign`, dto);
      return response.data.signature;
    } catch (err) {
      console.error('Error getting admin signature:', err);
      throw new Error('Failed to retrieve admin signature');
    }
  };

  return (
    <div className="wallet-connect">
      {!walletAddress ? (
        <button onClick={connectWallet} className="button">Connect Wallet</button>
      ) : (
        <div>
          <p className="wallet-address">Connected: {walletAddress}</p>
          {!isRegistered && !isRegistering && (
            <button onClick={() => registerEthUser(walletAddress)} className="button">Register</button>
          )}
          {isRegistering && <p>Registration in progress...</p>}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
