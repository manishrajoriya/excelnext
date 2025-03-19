import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4">
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none"
          aria-label="Close sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <nav className="mt-4">
        <ul>
          <li>
            <Link href="/" className="block px-4 py-2 hover:bg-gray-700">
              Home
            </Link>
          </li>
          <li>
            <Link href="/match" className="block px-4 py-2 hover:bg-gray-700">
              Match
            </Link>
          </li>
          <li>
            <Link href="/upload" className="block px-4 py-2 hover:bg-gray-700">
              Upload
            </Link>
          </li>
          <li>
            <Link href="/display" className="block px-4 py-2 hover:bg-gray-700">
              Display
            </Link>
          </li>
          <li>
            <Link href="/pdftoexcle" className="block px-4 py-2 hover:bg-gray-700">
              PDF to Excel
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}