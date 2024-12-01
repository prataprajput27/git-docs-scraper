import React, { useState } from "react";
import { ClipLoader } from "react-spinners"; // Import the spinner

const RepoLister = ({ data, owner, repo, isLoading }) => {
  const [format, setFormat] = useState("md"); // State to track the selected format

  // Function to handle downloading
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/files/downloadCombined?owner=${owner}&repo=${repo}&outputFormat=${format}`
      );
      if (!response.ok) {
        throw new Error("Failed to download file.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `repository.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Function to handle file preview in a new window
  const handlePreview = async (filePath) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/files/preview?owner=${owner}&repo=${repo}&filePath=${filePath}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch file preview.");
      }
      const data = await response.text();

      // Open a new window and write the preview content into it
      const previewWindow = window.open("", "_blank");
      if (previewWindow) {
        previewWindow.document.write("<html><head><title>File Preview</title></head><body>");
        previewWindow.document.write("<h1><strong><u>File Preview</u></strong></h1>");
        previewWindow.document.write("<pre style='white-space: pre-wrap; word-wrap: break-word;'>" + data + "</pre>");
        previewWindow.document.write("</body></html>");
        previewWindow.document.close(); // Close the document to render the content
      }
    } catch (error) {
      console.error("Error previewing file:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-60vh">
        <ClipLoader size={50} color={"#00bcd4"} loading={isLoading} />
      </div>
    ); // Display the spinner while loading
  }

  if (!data || !data.files || data.files.length === 0) {
    return <div className="text-white">No data available. Please search or select a repository.</div>;
  }

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-md w-full max-w-5xl">
      <h2 className="text-xl font-bold mb-4 text-white underline text-center">Repository Files</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-300">
            <th className="border border-gray-400 px-4 py-2">Filename</th>
            <th className="border border-gray-400 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.files.map((file, index) => (
            <tr key={index} className="text-center bg-gray-400 bg-opacity-15">
              <td className="border text-white px-4 py-2 text-xl ">{file}</td>
              <td className="border border-gray-400 px-4 py-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handlePreview(file)} // Trigger preview in new window
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end items-center space-x-4">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="px-6 py-2 border border-gray-400 rounded-md"
        >
          <option value="md">MD</option>
          <option value="txt">TXT</option>
          <option value="pdf">PDF</option>
        </select>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default RepoLister;
