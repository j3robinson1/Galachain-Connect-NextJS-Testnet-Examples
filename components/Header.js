import Link from 'next/link';

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/">
              Home
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
