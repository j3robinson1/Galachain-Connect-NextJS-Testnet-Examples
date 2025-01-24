import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../../../../context/WalletContext';
import GrantAllowance from '../../../../components/GrantAllowance';
import Balance from '../../../../components/Balance';

const ManageToken = () => {
  const router = useRouter();
  const { walletAddress, metamaskClient, isConnected } = useWallet();
  const { collection, category, type } = router.query;

  const [tokenClasses, setTokenClasses] = useState([]);
  const [tokenData, setTokenData] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTokenClasses = async () => {
    if (!collection || !category || !type) return; 

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/FetchTokenClassesWithPagination`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            category,
            collection,
            type,
            limit: 10000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch token classes');
      }

      const data = await response.json();
      const results = data.Data.results || [];

      setTokenClasses(results);

      if (results.length > 0) {
        const firstTokenClass = results[0];
        setTokenData({
          additionalKey: firstTokenClass.additionalKey,
          category: firstTokenClass.category,
          collection: firstTokenClass.collection,
          type: firstTokenClass.type,
          instance: firstTokenClass.instance,
        });
      }
    } catch (err) {
      console.error('Error fetching token classes:', err);
      setError(err.message || 'Failed to fetch token classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenClasses();
  }, [collection, category, type]);

  return (
    <>
      <div className="list-token-classes">
        <h1>Current Selected Token</h1>
        {isLoading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!isLoading && !error && (
          <div className="token-classes-table">
            {tokenClasses.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Category</th>
                    <th>Collection</th>
                    <th>Decimals</th>
                    <th>Description</th>
                    <th>Max Supply</th>
                    <th>Authorities</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenClasses.map((tokenClass, index) => (
                    <tr key={index}>
                      <td>{tokenClass.symbol || 'N/A'}</td>
                      <td>{tokenClass.category || 'N/A'}</td>
                      <td>{tokenClass.collection || 'N/A'}</td>
                      <td>{tokenClass.decimals || 'N/A'}</td>
                      <td>{tokenClass.description || 'N/A'}</td>
                      <td>{tokenClass.maxSupply || 'N/A'}</td>
                      <td>
                        {tokenClass.authorities && tokenClass.authorities.length > 0
                          ? tokenClass.authorities.join(', ')
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No token classes found.</p>
            )}
          </div>
        )}
      </div>
      {isConnected && tokenData ? (
        <>
          <GrantAllowance
            tokenData={tokenData}
            walletAddress={walletAddress}
            metamaskClient={metamaskClient}
          />
          <Balance
            tokenData={tokenData}
            walletAddress={walletAddress}
            metamaskClient={metamaskClient}
          />
        </>
      ) : (
        <p>Please connect your wallet to manage tokens.</p>
      )}
    </>
  );
};

export default ManageToken;
