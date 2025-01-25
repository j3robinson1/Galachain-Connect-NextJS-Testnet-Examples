import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserConnectClient } from '@gala-chain/connect';
import { useWallet } from '../context/WalletContext';

const WalletConnect = () => {
  const {
    walletAddress,
    setWalletAddress,
    metamaskClient,
    setMetamaskClient,
    isConnected,
    setIsConnected,
    isRegistered,
    setIsRegistered,
  } = useWallet();

  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const client = new BrowserConnectClient();
    setMetamaskClient(client);
  }, [setMetamaskClient]);

  const connectWallet = async () => {
    try {
      await metamaskClient.connect();
      const address = await metamaskClient.ethereumAddress;
      setWalletAddress(address);
      const isRegistered = await checkRegistration(address);
      if (!isRegistered) {
        await registerEthUser(address);
      }
      setIsConnected(true);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setWalletAddress('');
      setIsConnected(false);
      setMetamaskClient(null);
    }
  };

  const checkRegistration = async (address) => {
    try {
      const response = await getAlias(address);
      console.log(response);
      if (response.data.Data && response.data.Data.alias) {
        setIsRegistered(true);
        setWalletAddress(response.data.Data.alias);
        setIsConnected(true);
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
        dtoType: 'RegisterEthUser',
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
      setIsConnected(true);
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
          {isConnected && !isRegistering && !isRegistered && (
            <button onClick={() => registerEthUser(walletAddress)} className="button">Register</button>
          )}
          <span className="wallet-address">Connected: {walletAddress}</span>
          {isRegistering && <p>Registration in progress...</p>}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
