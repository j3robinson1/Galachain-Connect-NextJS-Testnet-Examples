import React, { useState } from 'react';

const MintToken = ({ tokenData, walletAddress, metamaskClient }) => {
  const [formValues, setFormValues] = useState({
    uniqueKey: `mint-token-${new Date().toISOString()}`,
    quantity: '',
    tokenClass: {
      additionalKey: tokenData.additionalKey,
      category: tokenData.category,
      collection: tokenData.collection,
      instance: '0',
      type: tokenData.type,
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (value === '0' || value.startsWith('0')) {
      value = value.replace(/^0+/, ''); // Remove leading zeros
    }
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidForm = () => {
    const isQuantityValid =
      formValues.quantity && parseFloat(formValues.quantity) > 0;
    return isQuantityValid;
  };

  const mintToken = async () => {
    if (!isValidForm() || !walletAddress || !metamaskClient) {
      console.error('Invalid form or wallet not connected');
      return;
    }

    try {
      // Ensure MetaMask is connected
      const accounts = await metamaskClient.connect();
      if (!accounts || accounts.length === 0) {
        throw new Error('No account connected');
      }

      setIsProcessing(true);
      console.log('Form values:', formValues);

      // Sign the DTO with MetaMask
      const signedDto = await metamaskClient.sign('MintToken', formValues);

      console.log('Signed DTO:', signedDto);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/MintToken`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mint token');
      }

      const responseData = await response.json();
      console.log('Token minted successfully:', responseData);

      setSuccess(
        `Successfully minted ${formValues.quantity} ${tokenData.type} tokens!`
      );
    } catch (err) {
      console.error(`Error minting token: ${err}`, err);
      setError(err.message || 'Failed to mint token');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mint-token-container">
      <h2>Mint {tokenData.type} Token</h2>
      <div className="form">
        <div className="input-group">
          <label>Quantity</label>
          <input
            type="text"
            name="quantity"
            value={formValues.quantity}
            onChange={handleChange}
            placeholder="Enter quantity to mint"
            disabled={isProcessing}
          />
        </div>
        <button
          onClick={mintToken}
          disabled={!isValidForm() || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Mint Token'}
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default MintToken;
