import React, { useState } from 'react';

const TransferToken = ({ tokenData, walletAddress, metamaskClient }) => {
  const [formValues, setFormValues] = useState({
    uniqueKey: `transfer-token-${new Date().toISOString()}`,
    quantity: '',
    from: walletAddress,
    to: "",
    tokenInstance: {
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
      value = value.replace(/^0+/, '');
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

  const transferToken = async () => {
    if (!isValidForm() || !walletAddress || !metamaskClient) {
      console.error('Invalid form or wallet not connected');
      return;
    }

    try {
      const accounts = await metamaskClient.connect();
      if (!accounts || accounts.length === 0) {
        throw new Error('No account connected');
      }

      setIsProcessing(true);
      console.log('Form values:', formValues);

      const signedDto = await metamaskClient.sign('TransferToken', formValues);

      console.log('Signed DTO:', signedDto);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/TransferToken`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to transfer token');
      }

      const responseData = await response.json();
      console.log('Token transfered successfully:', responseData);

      setSuccess(
        `Successfully transfered ${formValues.quantity} ${tokenData.type} tokens!`
      );
    } catch (err) {
      console.error(`Error transfering token: ${err}`, err);
      setError(err.message || 'Failed to transfer token');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="transfer-token-container">
      <h2>Transfer {tokenData.type} Token</h2>
      <div className="form">
        <div className="input-group">
          <label>Recipient</label>
          <input
            type="text"
            name="to"
            value={formValues.to}
            onChange={handleChange}
            placeholder="Enter recipient to transfer"
            disabled={isProcessing}
          />
        </div>
        <div className="input-group">
          <label>Quantity</label>
          <input
            type="text"
            name="quantity"
            value={formValues.quantity}
            onChange={handleChange}
            placeholder="Enter quantity to transfer"
            disabled={isProcessing}
          />
        </div>
        <button
          onClick={transferToken}
          disabled={!isValidForm() || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Transfer Token'}
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default TransferToken;
