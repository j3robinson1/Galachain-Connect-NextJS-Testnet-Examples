import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserConnectClient } from '@gala-chain/connect';

const WalletConnect = ({ onConnect }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [metamaskClient, setMetamaskClient] = useState(null);

  useEffect(() => {
    const client = new BrowserConnectClient();
    setMetamaskClient(client);
  }, []);

  const connectWallet = async () => {
    try {
      await metamaskClient.connect();
      let address = await metamaskClient.ethereumAddress;
      if (address.startsWith('0x')) {
        address = `eth|${address.slice(2)}`;
      }
      await checkRegistration(address);
      setWalletAddress(address);
      onConnect(address, true, metamaskClient);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      onConnect('', false, null);
    }
  };

  const checkRegistration = async (address) => {
    if (!address) return;
    try {
      const response = await getAlias(address);
      if (response.data.Data && response.data.Data.alias) {
        setIsRegistered(true);
        setWalletAddress(response.data.Data.alias); // Use the alias if available
        onConnect(response.data.Data.alias, true, metamaskClient); // Update the onConnect call with the alias
      } else {
        setIsRegistered(false);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('User Not Found');
      } else {
        console.error('Check registration error:', err);
        setIsRegistered(false);
      }
    }
  };

  const getAlias = async (address) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_TESTNET_PUBLIC_KEY_CONTRACT}/GetObjectByKey`, {
      objectId: `\u0000GCUP\u0000${address.replace('0x', '').replace('eth|', '')}\u0000`,
    });
  };

  const getAdminSignature = async (dto) => {
    try {
      const response = await axios.post(`/api/signRegisterUser`, dto);
      return response.data.signature;
    } catch (err) {
      console.error('Error getting admin signature:', err);
      throw new Error('Failed to retrieve admin signature');
    }
  };

  const registerUser = async () => {
    if (!walletAddress) return;

    try {
      const publicKey = await metamaskClient.getPublicKey();
      const recoveredAddress = publicKey.recoveredAddress; // Use the recovered checksum address
      const userAlias = `client|${recoveredAddress.slice(2)}`; // Construct the user alias

      const dto = {
        publicKey: publicKey.publicKey,
        user: userAlias,
      };

      // Get the admin signature
      const adminSignature = await getAdminSignature(dto);
      dto.signature = adminSignature;

      // Send the request to register the user
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_TESTNET_PUBLIC_KEY_CONTRACT}/RegisterUser`,
        dto
      );

      console.log('Registration successful:', response.data);
      setIsRegistered(true);
    } catch (err) {
      console.error('Error registering user:', err);
      setIsRegistered(false);
    }
  };

  return (
    <div className="wallet-connect">
      {!walletAddress ? (
        <button onClick={connectWallet} className="button">Connect Wallet</button>
      ) : (
        <div>
          <p className="wallet-address">Connected: {walletAddress}</p>
          {!isRegistered && <button onClick={registerUser} className="button">Register</button>}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
