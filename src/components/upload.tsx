'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [devices, setDevices] = useState<{ id: number; name: string }[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setMessage('');
      } else {
        setMessage('Please upload a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setIsUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('File uploaded and data inserted successfully!');
        fetchDevices(); // Fetch and display the uploaded data
        setFile(null); // Clear the file input
      } else {
        setMessage(data.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      setMessage('Error uploading file. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setMessage('Error fetching devices. Please try again.');
    }
  };

  const handleClear = () => {
    setFile(null);
    setDevices([]);
    setMessage('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="mb-4 w-full p-2 border border-gray-300 rounded"
          disabled={isUploading}
          aria-label="Upload Excel file"
        />
        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isUploading}
            aria-label="Upload file"
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">Uploading...</span>
                <div className="w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              'Upload'
            )}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            aria-label="Clear file and data"
          >
            Clear
          </button>
        </div>
        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {devices.length > 0 && (
        <div className="mt-8 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">Uploaded Devices</h3>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <ul>
              {devices.map((device) => (
                <li key={device.id} className="mb-2 p-2 border-b border-gray-200">
                  {device.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}