import React, { useState } from 'react';

const UnlockToken = ({ lockInfo, tokenData, walletAddress, metamaskClient }) => {
  const [unlockQuantity, setUnlockQuantity] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    let { value } = e.target;
    if (value === '0' || value.startsWith('0')) {
      value = value.replace(/^0+/, ''); // Remove leading zeros
    }
    setUnlockQuantity(value);
  };

  const isValidForm = () => {
    const quantity = parseFloat(unlockQuantity);
    return !isNaN(quantity) && quantity > 0 && quantity <= parseFloat(lockInfo.quantity);
  };

  const unlockToken = async () => {
    if (!isValidForm() || !walletAddress || !metamaskClient) {
      console.error('Invalid form or wallet not connected');
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare lock data for signing
      const lockData = {
        name: lockInfo.name,
        quantity: unlockQuantity,
        lockAuthority: lockInfo.lockAuthority,
        owner: walletAddress,
        tokenInstance: {
          additionalKey: tokenData.additionalKey,
          category: tokenData.category,
          collection: tokenData.collection,
          instance: lockInfo.instanceId || '0',
          type: tokenData.type,
        },
        uniqueKey: `unlock-${lockInfo.name}`,
      };

      // Sign the DTO with MetaMask
      const signedDto = await metamaskClient.sign('UnlockToken', lockData);
      console.log('Signed DTO:', signedDto);

      // Send unlock request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/UnlockToken`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unlock token');
      }

      const responseData = await response.json();
      console.log('Token unlocked successfully:', responseData);

      setSuccess(`Successfully unlocked ${unlockQuantity} tokens!`);
      setUnlockQuantity(''); // Clear the input after success
    } catch (err) {
      console.error('Error unlocking token:', err);
      setError(err.message || 'Failed to unlock token');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="unlock-token-container">
      <h2>Unlock Tokens</h2>
      <div className="input-group">
        <label>Quantity</label>
        <input
          type="number"
          value={unlockQuantity}
          onChange={handleChange}
          placeholder="Enter quantity to unlock"
          disabled={isProcessing}
        />
      </div>
      <button onClick={unlockToken} disabled={!isValidForm() || isProcessing}>
        {isProcessing ? 'Processing...' : 'Unlock Token'}
      </button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default UnlockToken;
