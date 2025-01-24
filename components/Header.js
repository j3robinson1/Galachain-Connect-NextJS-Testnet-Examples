import React from 'react';
import Link from 'next/link';
import WalletConnect from './WalletConnect';

function Header() {
  return (
    <header>
      <nav>
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: '10px', alignItems: 'center' }}>
          <li style={{ flexGrow: 1 }}>
            <Link href="/">Home</Link>
          </li>
          <li>
            <WalletConnect />
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
