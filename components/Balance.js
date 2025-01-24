import React, { useState, useEffect } from 'react';
import MintToken from './MintToken';

const Balance = ({ tokenData, walletAddress, metamaskClient }) => {
  const [allowances, setAllowances] = useState([]);
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAllowance = async () => {
    if (!tokenData || !walletAddress) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/FetchAllowances`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            additionalKey: tokenData.additionalKey,
            category: tokenData.category,
            collection: tokenData.collection,
            grantedTo: walletAddress,
            type: tokenData.type,
            instance: '0',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch allowances');
      }

      const data = await response.json();
      setAllowances(data.Data.results || []);
    } catch (err) {
      console.error('Error fetching allowances:', err);
      setError(err.message || 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!tokenData || !walletAddress) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/FetchBalancesWithTokenMetadata`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            owner: walletAddress,
            additionalKey: tokenData.additionalKey,
            category: tokenData.category,
            collection: tokenData.collection,
            grantedTo: walletAddress,
            type: tokenData.type,
            instance: '0',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch allowances');
      }

      const data = await response.json();
      setBalances(data.Data.results || []);
    } catch (err) {
      console.error('Error fetching allowances:', err);
      setError(err.message || 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowance();
    fetchBalance();
  }, [tokenData, walletAddress]);

  return (
    <div className="holdings">
      <h1>User Holdings</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!isLoading && !error && (
        <>
          <div className="allowance-table">
            <table>
              <thead>
                <tr>
                  <th>Allowance</th>
                </tr>
              </thead>
              <tbody>
                {allowances.length > 0 ? (
                  allowances.map((allowance, index) => (
                    <tr key={index}>
                      <td>
                        {allowance.quantity && allowance.quantitySpent
                          ? parseFloat(allowance.quantity) - parseFloat(allowance.quantitySpent)
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>0</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="balances-table">
            <div className="minted-table">
              <table>
                <thead>
                  <tr>
                    <th>Minted</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.length > 0 ? (
                    balances.map((balance, index) => (
                      <tr key={index}>
                        <td>{balance.balance.quantity || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>0</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="locked-table">
              <table>
                <thead>
                  <tr>
                    <th>Locked</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.length > 0 ? (
                    balances.map((balance, index) => (
                      <tr key={index}>
                        <td>
                          {Array.isArray(balance.balance.lockedHolds) &&
                          balance.balance.lockedHolds.length === 0
                            ? 0
                            : balance.balance.lockedHolds || 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>0</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
          <MintToken
            tokenData={tokenData}
            walletAddress={walletAddress}
            metamaskClient={metamaskClient}
          />
        </>
      )}
    </div>
  );
};

export default Balance;
