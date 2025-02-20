import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MintToken from './MintToken';
import TransferToken from './TransferToken';
import LockToken from './LockToken';
import UnlockToken from './UnlockToken';
import BurnToken from './BurnToken';

const Balance = ({ tokenData, walletAddress, metamaskClient }) => {
  const [allowances, setAllowances] = useState([]);
  const [balances, setBalances] = useState([]);
  const [burns, setBurns] = useState([]);
  const [totalLockedQuantity, setTotalLockedQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { id: queryId } = router.query; // get the id from URL

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
            instance: tokenData?.id || '0',
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
            instance: tokenData?.id || '0',
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch allowances');
      }
      const data = await response.json();
      const results = data.Data.results || [];

      const totalLocked = results.reduce((sum, balance) => {
        if (Array.isArray(balance.balance.lockedHolds)) {
          return (
            sum +
            balance.balance.lockedHolds.reduce(
              (lockedSum, lockedHold) => lockedSum + parseFloat(lockedHold.quantity || 0),
              0
            )
          );
        }
        return sum;
      }, 0);

      setBalances(results);
      setTotalLockedQuantity(totalLocked);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err.message || 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBurns = async () => {
    if (!tokenData || !walletAddress) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/FetchBurns`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            burnedBy: walletAddress,
            additionalKey: tokenData.additionalKey,
            category: tokenData.category,
            collection: tokenData.collection,
            grantedTo: walletAddress,
            type: tokenData.type,
            instance: tokenData?.id || '0',
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch allowances');
      }
      const data = await response.json();
      setBurns(data.Data || []);
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
    fetchBurns();
  }, [tokenData, walletAddress]);

  function compileLockName(lockedHold) {
    const { collection, category, type, id } = tokenData;
    const instanceId = lockedHold.instanceId || id || '0';
    const quantity = lockedHold.quantity || '0';
    const lockAuthority = lockedHold.lockAuthority || walletAddress;
    const owner = walletAddress;
    const createdDate = new Date(lockedHold.created)
      .toISOString()
      .slice(0, 16)
      .replace('T', '-');
    return `lock-${collection}-${category}-${type}-${instanceId}-${quantity}-${owner}-${lockAuthority}-${createdDate}`;
  }

  // Get instance IDs from balances (if available)
  const instanceIds =
    balances.length > 0 &&
    balances[0].balance &&
    Array.isArray(balances[0].balance.instanceIds) &&
    balances[0].balance.instanceIds.length > 0
      ? balances[0].balance.instanceIds
      : [];

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
                  <tr>
                    <td>
                      {allowances.reduce((total, allowance) => {
                        const remaining =
                          allowance.quantity && allowance.quantitySpent
                            ? parseFloat(allowance.quantity) - parseFloat(allowance.quantitySpent)
                            : 0;
                        return total + remaining;
                      }, 0)}
                    </td>
                  </tr>
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
                    <th>Minted (Available after locks)</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.length > 0 ? (
                    balances.map((balance, index) => {
                      const totalLocked = Array.isArray(balance.balance.lockedHolds)
                        ? balance.balance.lockedHolds.reduce(
                            (sum, lockedHold) => sum + parseFloat(lockedHold.quantity || 0),
                            0
                          )
                        : 0;
                      const availableBalance = parseFloat(balance.balance.quantity || 0) - totalLocked;
                      return (
                        <tr key={index}>
                          <td>{availableBalance > 0 ? availableBalance : 0}</td>
                        </tr>
                      );
                    })
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
                    (() => {
                      const totalLocked = balances.reduce((sum, balance) => {
                        if (Array.isArray(balance.balance.lockedHolds)) {
                          return (
                            sum +
                            balance.balance.lockedHolds.reduce(
                              (lockedSum, lockedHold) => lockedSum + parseFloat(lockedHold.quantity || 0),
                              0
                            )
                          );
                        }
                        return sum;
                      }, 0);
                      return (
                        <tr>
                          <td>{totalLocked > 0 ? totalLocked : 0}</td>
                        </tr>
                      );
                    })()
                  ) : (
                    <tr>
                      <td>0</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {instanceIds.length > 0 && (
            <div className="instanceids-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Collection</th>
                    <th>
                      {tokenData.additionalKey && tokenData.additionalKey.startsWith('/')
                        ? ''
                        : 'Rarity'}
                    </th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {instanceIds.map((instanceId, idx) => {
                    const segment = tokenData.additionalKey.startsWith('/')
                      ? 'ERC721/' + instanceId
                      : tokenData.additionalKey + '/' + instanceId;
                    return (
                      <tr
                        key={idx}
                        onClick={() =>
                          router.push(
                            `/manage/${tokenData.collection}/${tokenData.category}/${tokenData.type}/${segment}`
                          )
                        }
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#313131')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'transparent')
                        }
                      >
                        <td>{instanceId}</td>
                        <td>{tokenData.type || 'N/A'}</td>
                        <td>{tokenData.category || 'N/A'}</td>
                        <td>{tokenData.collection || 'N/A'}</td>
                        <td>
                          {tokenData.additionalKey && tokenData.additionalKey.startsWith('/')
                            ? ''
                            : tokenData.additionalKey || 'N/A'}
                        </td>
                        <td>{tokenData.additionalKey.startsWith('/') ? 'ERC721' : 'ERC1155'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <MintToken
            tokenData={tokenData}
            walletAddress={walletAddress}
            metamaskClient={metamaskClient}
          />
          <LockToken
            tokenData={tokenData}
            walletAddress={walletAddress}
            metamaskClient={metamaskClient}
          />
          {totalLockedQuantity > 0 && (
            <UnlockToken
              lockInfo={{
                quantity: totalLockedQuantity,
                lockAuthority: walletAddress,
                name: compileLockName({
                  instanceId: tokenData?.id || '0',
                  quantity: totalLockedQuantity,
                  lockAuthority: walletAddress,
                  created: new Date().getTime(),
                }),
              }}
              tokenData={tokenData}
              walletAddress={walletAddress}
              metamaskClient={metamaskClient}
            />
          )}
          <TransferToken
            tokenData={tokenData}
            walletAddress={walletAddress}
            metamaskClient={metamaskClient}
          />
          <BurnToken
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
