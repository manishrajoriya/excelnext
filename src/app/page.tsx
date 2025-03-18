import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Excel Tracker</h1>
          <p className="text-xl mb-8">
            Upload, compare, and manage your Excel data with ease.
          </p>
          <Link
            href="/upload"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Upload Excel Files</h3>
            <p className="text-gray-600">
              Easily upload your Excel files to track and manage data.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Compare Data</h3>
            <p className="text-gray-600">
              Compare uploaded data with existing records in the database.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Download Results</h3>
            <p className="text-gray-600">
              Download comparison results as a new Excel file.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Your File</h3>
              <p className="text-gray-600">
                Upload an Excel file containing your data.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Compare Data</h3>
              <p className="text-gray-600">
                The system compares your data with existing records.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Download Results</h3>
              <p className="text-gray-600">
                Download the comparison results as a new Excel file.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto text-center">
          <p className="mb-4">© 2023 Excel Tracker. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <Link href="/about" className="hover:text-blue-400">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-400">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-blue-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}