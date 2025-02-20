import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../../../../../../context/WalletContext';
import GrantAllowance from '../../../../../../components/GrantAllowance';
import Balance from '../../../../../../components/Balance';

const ManageToken = () => {
  const router = useRouter();
  const { walletAddress, metamaskClient, isConnected, isRegistered } = useWallet();
  const { collection, category, type, additionalKey, id } = router.query;

  const [tokenData, setTokenData] = useState(null); 
  const [metadata, setMetadata] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);

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

      if (results.length > 0) {
        const firstTokenClass = results[0];
        setTokenData({
          additionalKey: firstTokenClass.additionalKey,
          category: firstTokenClass.category,
          collection: firstTokenClass.collection,
          type: firstTokenClass.type,
          instance: firstTokenClass.instance,
          image: firstTokenClass.image,
          owner: firstTokenClass.owner,
          id: id
        });
      }
    } catch (err) {
      console.error('Error fetching token classes:', err);
      setError(err.message || 'Failed to fetch token classes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async (url) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenData)
      });
      if (!res.ok) {
        throw new Error('Failed to fetch metadata');
      }
      const meta = await res.json();
      setMetadata(meta);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  useEffect(() => {
    fetchTokenClasses();
  }, [collection, category, type, id]);

  useEffect(() => {
    if (tokenData && tokenData.additionalKey && tokenData.additionalKey.startsWith('/')) {
      fetchMetadata(tokenData.additionalKey);
    }
  }, [tokenData, router]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [metadata]);

  return (
    <>
      <div className="list-token-classes">
        <h1>Current Selected Token</h1>
        {isLoading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!isLoading && !error && (
          <div className="token-classes-table">
            {tokenData ? (
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>ID</th>
                    <th>Collection</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Additional Key</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><img src={tokenData.image || 'N/A'} height="50" /></td>
                    <td>{tokenData.id || 'N/A'}</td>
                    <td>{tokenData.collection || 'N/A'}</td>
                    <td>{tokenData.category || 'N/A'}</td>
                    <td>{tokenData.type || 'N/A'}</td>
                    <td>{tokenData.additionalKey || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>No token classes found.</p>
            )}
          </div>
        )}
      </div>

      {tokenData && tokenData.additionalKey && tokenData.additionalKey.startsWith('/') && (
        <>
          {metadata ? (
            <div className="metadata">
              {metadata.featured && (
                <div className="featured-media">
                  {metadata.featured.endsWith('.mp4') ? (
                    <video width="240" height="240" autoPlay ref={videoRef}>
                      <source src={metadata.featured} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={metadata.featured} width="240" height="240" alt="Featured media" />
                  )}
                </div>
              )}
              {metadata.attributes && (
                <ul>
                  {metadata.attributes.map((attr, index) => (
                    <li key={index}>
                      <strong>{attr.trait_type}:</strong> {attr.value}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p>Fetching metadata...</p>
          )}
        </>
      )}

      {isConnected && isRegistered && tokenData ? (
        <>
          <Balance
            tokenData={tokenData}
            walletAddress={walletAddress}
            metamaskClient={metamaskClient}
          />
        </>
      ) : (
        <p>Connect & Register your wallet</p>
      )}
    </>
  );
};

export default ManageToken;
