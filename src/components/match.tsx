'use client';

import { useState, ChangeEvent } from 'react';

export default function MatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [commonData, setCommonData] = useState<string[]>([]);
  const [unmatchedData, setUnmatchedData] = useState<string[]>([]);
  const [fileData, setFileData] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      const response = await fetch('/api/match', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('File processed successfully!');
        setCommonData(data.commonData);
        setUnmatchedData(data.unmatchedData);
        setFileData(data.file);
      } else {
        setMessage(data.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      setMessage('Error uploading file. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (commonData.length === 0) {
      setMessage('No common data to delete.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete the common data?');
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ devices: commonData }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Common data deleted successfully!');
        setCommonData([]);
      } else {
        setMessage(data.error || 'Delete failed. Please try again.');
      }
    } catch (error) {
      setMessage('Error deleting data. Please check your connection and try again.');
    }
  };

  const handleDownload = () => {
    if (!fileData) {
      setMessage('No file data available to download.');
      return;
    }

    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${fileData}`;
    link.download = 'comparison_results.xlsx';
    link.click();
    setMessage('File downloaded successfully!');
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
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isUploading}
          aria-label="Upload and compare"
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <span className="mr-2">Processing...</span>
              <div className="w-4 h-4 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            'Upload and Compare'
          )}
        </button>
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

      {commonData.length > 0 && (
        <div className="mt-8 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">Comparison Results</h3>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                aria-label="Delete common data"
              >
                Delete Common Data
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                aria-label="Download results"
              >
                Download Results
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Common Data</h4>
                <ul>
                  {commonData.map((device, index) => (
                    <li key={index} className="mb-2">
                      {device}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Unmatched Data</h4>
                <ul>
                  {unmatchedData.map((device, index) => (
                    <li key={index} className="mb-2">
                      {device}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}