import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ListTokenClasses = () => {
  const [tokenClasses, setTokenClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
      setTokenClasses(data.Data.results || []);
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

  const handleRowClick = (tokenClass) => {
    router.push(
      `/manage/${tokenClass.collection}/${tokenClass.category}/${tokenClass.type}`
    );
  };

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
                  <tr
                    key={index}
                    onClick={() => handleRowClick(tokenClass)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#313131';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
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
  );
};

export default ListTokenClasses;
