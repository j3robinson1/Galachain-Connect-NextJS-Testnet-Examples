import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import TransferTestnetGala from '../../components/TransferTestnetGala';

export default function WalletManagePage() {
    const router = useRouter();
    const { walletAddress, metamaskClient, isConnected, isRegistered } = useWallet();
    const [mainnetBalance, setMainnetBalance] = useState('0');
    const [testnetBalance, setTestnetBalance] = useState('0');

    useEffect(() => {
        if (walletAddress) {
            fetchMainnetBalance(walletAddress);
            fetchTestnetBalance(walletAddress);
        }
    }, [walletAddress]);

    async function fetchMainnetBalance(address) {
        const payload = {
            additionalKey: "none",
            category: "Unit",
            collection: "GALA",
            instance: "0",
            owner: address,
            type: "none"
        };
        const response = await fetch(`${process.env.NEXT_PUBLIC_ASSET_MAINNET_TOKEN_CONTRACT}/FetchBalances`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log(data);
        if (data.Status === 1 && data.Data.length > 0) {
            setMainnetBalance(data.Data[0].quantity);
        } else {
            setMainnetBalance('0');
            console.error('Failed to fetch balance or no balance data available');
        }
    }

    async function fetchTestnetBalance(address) {
        const payload = {
            additionalKey: "none",
            category: "Unit",
            collection: "GALA",
            instance: "0",
            owner: address,
            type: "none"
        };
        const response = await fetch(`${process.env.NEXT_PUBLIC_ASSET_TESTNET_TOKEN_CONTRACT}/FetchBalances`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.Status === 1 && data.Data.length > 0) {
            setTestnetBalance(data.Data[0].quantity);
        } else {
            setTestnetBalance('0');
            console.error('Failed to fetch balance or no balance data available');
        }
    }

    return (
        <div>
            <h1>Wallet Management: {walletAddress}</h1>
            {isConnected ? (
                <div>
                    <p>Mainnet Balance: {mainnetBalance ? mainnetBalance + ' GALA' : 'Loading...'}</p>
                    <p>Testnet Balance: {testnetBalance ? testnetBalance + ' GALA' : 'Loading...'}</p>
                    <TransferTestnetGala walletAddress={walletAddress} metamaskClient={metamaskClient} isConnected={isConnected} />
                </div>
            ) : (
                <p>Wallet is not connected.</p>
            )}
        </div>
    );
}
