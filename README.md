# Galachain Connect NextJS

A Next.js-based web application designed to showcase achievements and connect users' wallets for interactions within the GalaChain ecosystem.

## Prerequisites

- Node.js (v14 or later)
- npm, yarn, or pnpm
- MetaMask or compatible Web3 wallet

## Setup and Installation

### Clone the repository

```bash
git clone https://github.com/j3robinson1/Galachain-Connect-NextJS-Testnet-Examples.git
cd Galachain-Connect-NextJS-Testnet-Examples
```

## Setup and Installation

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Configure the Environment
Create a `.env` file in the root directory and add the following:

```plaintext
NEXT_PUBLIC_TESTNET_PUBLIC_KEY_CONTRACT='https://gateway-testnet.galachain.com/api/testnet03/gc-bf369906e680527735ef1a8571a71318f3ebacb9-PublicKeyContract'
NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT='https://gateway-testnet.galachain.com/api/testnet03/gc-bf369906e680527735ef1a8571a71318f3ebacb9-GalaChainToken'
PRIVATE_KEY=<Testnet Admin Private Key>
NEXT_PUBLIC_ASSET_PUBLIC_KEY_CONTRACT='https://api-galaswap.gala.com/galachain/api/asset/public-key-contract'
NEXT_PUBLIC_ASSET_TESTNET_TOKEN_CONTRACT='https://galachain-gateway-chain-platform.ue1.tnt.galachain.com/api/testnet01/gc-a9b8b472b035c0510508c248d1110d3162b7e5f4-GalaChainToken'
NEXT_PUBLIC_ASSET_MAINNET_TOKEN_CONTRACT='https://galachain-gateway-chain-platform-prod-chain-platform-eks.prod.galachain.com/api/asset/token-contract'
NEXT_PUBLIC_ASSET_TESTNET_PUBLIC_KEY_CONTRACT='https://galachain-gateway-chain-platform.ue1.tnt.galachain.com/api/testnet01/gc-a9b8b472b035c0510508c248d1110d3162b7e5f4-PublicKeyContract'
NEXT_PUBLIC_GALASWAP_API=https://api-galaswap.gala.com/v1
```
Replace <Testnet Admin Private Key> with your actual testnet deployment admin key.
Replace Testnet urls with your Testnet URLs.

## Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Development

This application is built using:

- **Next.js** for server-side rendering and static generation.
- **React** for building user interfaces.
- **GalaChain Connect library** for blockchain interactions.
