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
NEXT_PUBLIC_TESTNET_PUBLIC_KEY_CONTRACT='https://gateway-testnet.galachain.com/<api root public key contract>'
NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT='https://gateway-testnet.galachain.com/<api root token contract>'
PRIVATE_KEY=<your private key>
```
Replace <your project id> with your actual project ID.

## Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Features

- **MetaMask Wallet Connection:** Seamlessly connect your MetaMask wallet.

## Project Structure

- `pages/index.js` - The main entry point for the application.
- `components/`
  - `WalletConnect.js` - Manages wallet connections and interactions.

Environment variables are defined in `.env`. Next.js configuration is managed through `next.config.js`.

## Development

This application is built using:

- **Next.js** for server-side rendering and static generation.
- **React** for building user interfaces.
- **GalaChain Connect library** for blockchain interactions.
