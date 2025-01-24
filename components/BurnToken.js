import React, { useState } from 'react';

const BurnToken = ({ tokenData, walletAddress, metamaskClient }) => {
  const [formValues, setFormValues] = useState({
    uniqueKey: `burn-token-${new Date().toISOString()}`,
    owner: walletAddress,
    tokenInstances: [
      {
        quantity: '',
        tokenInstanceKey: {
          additionalKey: tokenData.additionalKey,
          category: tokenData.category,
          collection: tokenData.collection,
          instance: '0',
          type: tokenData.type,
        },
      },
    ],
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    let { value } = e.target;

    if (value === '0' || value.startsWith('0')) {
      value = value.replace(/^0+/, '');
    }

    setFormValues((prev) => ({
      ...prev,
      tokenInstances: prev.tokenInstances.map((instance, index) => ({
        ...instance,
        quantity: value,
      })),
    }));
  };

  const isValidForm = () => {
    const isQuantityValid =
      formValues.tokenInstances[0].quantity &&
      parseFloat(formValues.tokenInstances[0].quantity) > 0;
    return isQuantityValid;
  };

  const burnTokens = async () => {
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

      const signedDto = await metamaskClient.sign('BurnTokens', formValues);

      console.log('Signed DTO:', signedDto);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/BurnTokens`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to burn token');
      }

      const responseData = await response.json();
      console.log('Token burned successfully:', responseData);

      setSuccess(
        `Successfully burned ${formValues.tokenInstances[0].quantity} ${tokenData.type} tokens!`
      );

      setFormValues((prev) => ({
        ...prev,
        tokenInstances: prev.tokenInstances.map((instance) => ({
          ...instance,
          quantity: '',
        })),
      }));
    } catch (err) {
      console.error(`Error burning token: ${err}`, err);
      setError(err.message || 'Failed to burn token');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="burn-token-container">
      <h2>Burn {tokenData.type} Token</h2>
      <div className="form">
        <div className="input-group">
          <label>Quantity</label>
          <input
            type="text"
            name="quantity"
            value={formValues.tokenInstances[0].quantity || ''}
            onChange={handleChange}
            placeholder="Enter quantity to burn"
            disabled={isProcessing}
          />
        </div>
        <button onClick={burnTokens} disabled={!isValidForm() || isProcessing}>
          {isProcessing ? 'Processing...' : 'Burn Token'}
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default BurnToken;
