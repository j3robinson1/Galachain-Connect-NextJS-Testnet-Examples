import React, { useState } from 'react';

const LockToken = ({ tokenData, walletAddress, metamaskClient }) => {
  const [formValues, setFormValues] = useState({
    uniqueKey: `lock-token-${new Date().toISOString()}`,
    quantity: '',
    name: generateLockName({
      quantity: '',
      lockAuthority: walletAddress,
      owner: walletAddress,
    }),
    lockAuthority: walletAddress,
    owner: walletAddress,
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

  function roundToNearestMinute(timestamp) {
    return Math.round(timestamp / 60000) * 60000;
  }

  function generateLockName(values) {
    const { collection, category, type } = tokenData;
    const quantity = values.quantity || '0';
    const owner = walletAddress || 'unknown';
    const lockAuthority = walletAddress || 'unknown';
    const instance = '0';

    const roundedTimestamp = roundToNearestMinute(Date.now());
    const formattedDate = new Date(roundedTimestamp)
      .toISOString()
      .slice(0, 16)
      .replace('T', '-');

    return `lock-${collection}-${category}-${type}-${instance}-${quantity}-${owner}-${lockAuthority}-${formattedDate}`;
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (value === '0' || value.startsWith('0')) {
      value = value.replace(/^0+/, ''); 
    }

    setFormValues((prev) => {
      const updatedValues = { ...prev, [name]: value };
      return {
        ...updatedValues,
        name: generateLockName(updatedValues),
      };
    });
  };

  const isValidForm = () => {
    const isQuantityValid =
      formValues.quantity && parseFloat(formValues.quantity) > 0;
    return isQuantityValid;
  };

  const lockToken = async () => {
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

      const finalFormValues = {
        ...formValues,
        name: generateLockName(formValues),
      };

      console.log('Final Form Values:', finalFormValues);

      const signedDto = await metamaskClient.sign('LockToken', finalFormValues);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/LockToken`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to lock token');
      }

      const responseData = await response.json();
      console.log('Token locked successfully:', responseData);

      setSuccess(
        `Successfully locked ${formValues.quantity} ${tokenData.type} tokens!`
      );
    } catch (err) {
      console.error(`Error locking token: ${err}`, err);
      setError(err.message || 'Failed to lock token');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="lock-token-container">
      <h2>Lock {tokenData.type} Token</h2>
      <div className="form">
        <div className="input-group">
          <label>Quantity</label>
          <input
            type="text"
            name="quantity"
            value={formValues.quantity}
            onChange={handleChange}
            placeholder="Enter quantity to lock"
            disabled={isProcessing}
          />
        </div>
        <button onClick={lockToken} disabled={!isValidForm() || isProcessing}>
          {isProcessing ? 'Processing...' : 'Lock Token'}
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default LockToken;
