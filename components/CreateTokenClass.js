import React, { useState } from 'react';

const CreateTokenClass = ({ walletAddress, metamaskClient }) => {
  const [formValues, setFormValues] = useState({
    uniqueKey: `token-create-${new Date().toISOString()}`,
    network: "GC",
    isNonFungible: false,
    decimals: 18,
    maxCapacity: "50000000000",
    maxSupply: "50000000000",
    tokenClass: {
      collection: "Token",
      category: "Unit",
      type: "GALA",
      additionalKey: walletAddress,
    },
    name: "Gala Test",
    symbol: "GALA",
    description: "Gala Token Description",
    image: "https://assets.coingecko.com/coins/images/12493/standard/GALA_token_image_-_200PNG.png",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length > 1) {
      setFormValues(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value
        }
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const isValidForm = () => {
    return formValues.name && formValues.symbol && formValues.tokenClass?.collection;
  };

  const createTokenClass = async () => {
    if (!isValidForm() || !walletAddress) return;

    setError('');
    setSuccess('');
    setIsProcessing(true);

    try {
      console.log("Form values:", formValues);

      const signedDto = await metamaskClient.sign("CreateTokenClass", formValues);

      console.log("Signed DTO:", signedDto);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/CreateTokenClass`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create token class');
      }

      const responseData = await response.json();
      console.log('Token class created successfully:', responseData);

      setSuccess(`Token class "${formValues.name}" created successfully!`);
    } catch (err) {
      console.error(`Error creating token class: ${err}`, err);
      setError(err instanceof Error ? err.message : 'Failed to create token class');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="create-token-class-container">
      <h2>Create Token Class</h2>
      <div className="form">
        {Object.keys(formValues).map((key) => {
          if (key === "tokenClass") {
            return (
              <div key={key}>
                <h3>{key}</h3>
                {Object.keys(formValues[key]).map(subKey => (
                  <div key={subKey} className="input-group">
                    <label>{subKey}</label>
                    <input
                      type="text"
                      name={`${key}.${subKey}`}
                      value={formValues[key][subKey]}
                      onChange={handleChange}
                      disabled={isProcessing}
                    />
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div key={key} className="input-group">
              <label>{key}</label>
              <input
                type="text"
                name={key}
                value={formValues[key]}
                onChange={handleChange}
                disabled={isProcessing}
              />
            </div>
          );
        })}
        <button 
          onClick={createTokenClass} 
          disabled={!isValidForm() || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Create Token Class'}
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default CreateTokenClass;
