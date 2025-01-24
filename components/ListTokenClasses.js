import React, { useState, useEffect } from 'react';

const ListTokenClasses = () => {
  const [tokenClasses, setTokenClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTokenClasses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/FetchTokenClassesWithPagination`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            category: 'Unit',
            collection: 'Token',
            limit: 10000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch token classes');
      }

      const data = await response.json();
      setTokenClasses(data.Data.results || []); // Assuming token classes are in `Data.results` field
    } catch (err) {
      console.error('Error fetching token classes:', err);
      setError(err.message || 'Failed to fetch token classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenClasses();
  }, []);

  return (
    <div className="list-token-classes">
      <h1>List of Created Token Classes</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!isLoading && !error && (
        <div className="token-classes-table">
          {tokenClasses.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Category</th>
                  <th>Collection</th>
                  <th>Decimals</th>
                  <th>Description</th>
                  <th>Max Supply</th>
                  <th>Total Supply</th>
                  <th>Authorities</th>
                </tr>
              </thead>
              <tbody>
                {tokenClasses.map((tokenClass, index) => (
                  <tr key={index}>
                    <td>{tokenClass.name || 'N/A'}</td>
                    <td>{tokenClass.symbol || 'N/A'}</td>
                    <td>{tokenClass.category || 'N/A'}</td>
                    <td>{tokenClass.collection || 'N/A'}</td>
                    <td>{tokenClass.decimals || 'N/A'}</td>
                    <td>{tokenClass.description || 'N/A'}</td>
                    <td>{tokenClass.maxSupply || 'N/A'}</td>
                    <td>{tokenClass.totalSupply || 'N/A'}</td>
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
  );
};

export default ListTokenClasses;
