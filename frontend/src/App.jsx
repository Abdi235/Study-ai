import React, { useState } from "react";
// Assuming these components will be available or aliased in Vite config
// For now, this might cause issues if these paths are not resolvable
// e.g. import { Button } from "@/components/ui/button";
// We might need to install shadcn/ui or similar if these are actual paths
// For a pure Vite setup without such a library, these would be standard HTML elements or custom components.
// For now, I'll keep them as they are, but this is a point of attention for local setup.

// Placeholder for actual UI component imports if shadcn/ui is not set up for this new Vite app
const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
const Input = (props) => <input {...props} />;
const Card = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardContent = ({ children, ...props }) => <div {...props}>{children}</div>;


export default function App() { // Renamed from StudyApp to App for typical Vite convention
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [materialType, setMaterialType] = useState("flashcards");
  const [error, setError] = useState(""); // For displaying file validation errors
  const [isLoading, setIsLoading] = useState(false); // For loading state

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setError(""); // Reset error on new file selection

    if (!uploadedFile) {
      setFile(null);
      setFileName("");
      return;
    }

    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "text/plain",
      "application/msword", // .doc
    ];
    const allowedExtensions = ["pdf", "docx", "txt", "doc"];

    const fileExtension = uploadedFile.name.split(".").pop().toLowerCase();

    if (allowedMimeTypes.includes(uploadedFile.type) || allowedExtensions.includes(fileExtension)) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
    } else {
      setFile(null);
      setFileName("");
      setError("Invalid file type. Please upload a .pdf, .docx, or .txt file.");
      e.target.value = null; // Clear the file input visually
    }
  };

  const handleSubmit = async () => { // Made async to use await for fetch
    if (!file) {
      alert("Please upload a file first.");
      setError("Please upload a file first.");
      return;
    }
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("studyDocument", file);
    formData.append("materialType", materialType);

    try {
      // IMPORTANT: The URL '/api/generate' needs to be correctly routed by Vercel
      // and handled by the backend server.
      // If running locally, ensure your Vite dev server is proxying /api to your backend,
      // or use the full backend URL (e.g., http://localhost:3001/api/generate).
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      setIsLoading(false);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "An unknown error occurred during submission." }));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert("Generated Content:\n" + data.result.substring(0, 500) + (data.result.length > 500 ? "..." : ""));
      // Reset form after successful submission
      setFile(null);
      setFileName("");
      const fileInput = document.getElementById("file-upload");
      if (fileInput) {
        fileInput.value = null;
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Submission error:", error);
      setError(error.message || "Failed to generate study material.");
      alert("Error: " + (error.message || "Failed to generate study material."));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">Study Material Generator</h1>

        <Card className="p-4 space-y-4 shadow-lg rounded-md bg-white">
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block mb-1 font-semibold text-gray-700">Upload Study File (.pdf, .docx, .txt)</label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              />
              {fileName && <p className="text-sm mt-1 text-gray-600">Selected: {fileName}</p>}
              {error && <p className="text-sm mt-1 text-red-500">{error}</p>}
            </div>

            <div>
              <label htmlFor="material-type" className="block mb-1 font-semibold text-gray-700">Select Material Type</label>
              <select
                id="material-type"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
              >
                <option value="flashcards">Flash Cards</option>
                <option value="multiple_choice">Multiple Choice Questions</option>
                <option value="short_answer">Short Answer Questions</option>
                <option value="practice_exam">Practice Exam</option>
              </select>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate Study Material"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
