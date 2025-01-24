import React, { useState } from 'react';

const GrantAllowance = ({ tokenData, walletAddress, metamaskClient }) => {
  const [formValues, setFormValues] = useState({
    uniqueKey: `grant-allowance-${new Date().toISOString()}`,
    allowanceType: 4,
    quantities: [
      {
        quantity: "", 
        user: "",
      },
    ],
    uses: "5",
    tokenInstance: {
      additionalKey: tokenData.additionalKey, 
      category: tokenData.category,
      collection: tokenData.collection,
      instance: "0",
      type: tokenData.type,
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("quantities.0.")) {
      const key = name.split(".")[2]; 
      setFormValues((prev) => ({
        ...prev,
        quantities: [
          {
            ...prev.quantities[0],
            [key]: value, 
          },
        ],
      }));
    } else {
      const keys = name.split('.');
      if (keys.length > 1) {
        setFormValues((prev) => ({
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        }));
      } else {
        setFormValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const isValidForm = () => {
    console.log("Validating form...");
    console.log("Recipient (user):", formValues.quantities[0].user);
    console.log("Quantity:", formValues.quantities[0].quantity);
    console.log("Token Type:", formValues.tokenInstance?.type);

    const isUserValid = !!formValues.quantities[0].user;
    const isQuantityValid =
      formValues.quantities[0].quantity &&
      parseFloat(formValues.quantities[0].quantity) > 0;

    console.log("isUserValid:", isUserValid);
    console.log("isQuantityValid:", isQuantityValid);

    return isUserValid && isQuantityValid;
  };

  const grantAllowance = async () => {
    if (!isValidForm() || !walletAddress || !metamaskClient) {
      console.error("Invalid form or wallet not connected");
      return;
    }

    try {
      const accounts = await metamaskClient.connect();
      if (!accounts || accounts.length === 0) {
        throw new Error("No account connected");
      }

      setIsProcessing(true);
      console.log("Form values:", formValues);

      const signedDto = await metamaskClient.sign("GrantAllowance", formValues);

      console.log("Signed DTO:", signedDto);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/GrantAllowance`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to grant allowance');
      }

      const responseData = await response.json();
      console.log('Allowance granted successfully:', responseData);

      setSuccess(
        `Allowance of ${formValues.quantities[0].quantity} GALA granted to ${formValues.quantities[0].user} successfully!`
      );
    } catch (err) {
      console.error(`Error granting allowance: ${err}`, err);
      setError(err.message || 'Failed to grant allowance');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grant-allowance-container">
      <h2>Grant Allowance for {tokenData.type}</h2>
      <div className="form">
        <div className="input-group">
          <label>User (Recipient)</label>
          <input
            type="text"
            name="quantities.0.user"
            value={formValues.quantities[0].user}
            onChange={handleChange}
            placeholder="Enter recipient (eth|... or client|...)"
            disabled={isProcessing}
          />
        </div>
        <div className="input-group">
          <label>Quantity</label>
          <input
            type="text"
            name="quantities.0.quantity"
            value={formValues.quantities[0].quantity}
            onChange={handleChange}
            placeholder="Enter quantity to allow"
            disabled={isProcessing}
          />
        </div>
        <button
          onClick={grantAllowance}
          disabled={!isValidForm() || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Grant Allowance'}
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default GrantAllowance;
