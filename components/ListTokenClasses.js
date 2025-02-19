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
            limit: 10000
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

  // Group token classes by collection, category and symbol.
  const groupedTokenClasses = tokenClasses.reduce((acc, tokenClass) => {
    // Create a grouping key.
    const key = `${tokenClass.collection}-${tokenClass.category}-${tokenClass.symbol}`;
    if (!acc[key]) {
      acc[key] = {
        ...tokenClass,
        // Make a copy of authorities so we can combine later.
        authorities: tokenClass.authorities ? [...tokenClass.authorities] : []
      };
    } else {
      // Combine authorities, removing duplicates.
      if (tokenClass.authorities) {
        acc[key].authorities = Array.from(
          new Set([...acc[key].authorities, ...tokenClass.authorities])
        );
      }
      // If needed, you can combine additional fields here.
      // For example, you might concatenate descriptions or sum maxSupply.
    }
    return acc;
  }, {});

  // Convert the grouped results to an array.
  const groupedResults = Object.values(groupedTokenClasses);

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
          {groupedResults.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Symbol</th>
                  <th>Category</th>
                  <th>Collection</th>
                  <th>Description</th>
                  <th>Max Supply</th>
                  <th>Authorities</th>
                </tr>
              </thead>
              <tbody>
                {groupedResults.map((tokenClass, index) => (
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
                    <td><img src={tokenClass.image || 'N/A'} height="50" /></td>
                    <td>{tokenClass.symbol || 'N/A'}</td>
                    <td>{tokenClass.category || 'N/A'}</td>
                    <td>{tokenClass.collection || 'N/A'}</td>
                    <td>
                      {tokenClass.description 
                        ? (tokenClass.description.length > 10 
                            ? tokenClass.description.slice(0, 10) + '...' 
                            : tokenClass.description)
                        : 'N/A'}
                    </td>
                    <td>{tokenClass.maxSupply || 'N/A'}</td>
                    <td>
                      {tokenClass.authorities && tokenClass.authorities.length > 0
                        ? tokenClass.authorities.join(', ').slice(0, 15) + '...'
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
