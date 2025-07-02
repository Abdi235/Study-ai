import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Textarea import removed as it's not used
import { Card, CardContent } from "@/components/ui/card";

export default function StudyApp() {
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

    // Check MIME type first, then extension as a fallback
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

  const handleSubmit = () => {
    if (!file) {
      // Prefer alert for this specific submit action as per original code and common UX
      alert("Please upload a file first.");
      // Optionally set error state if needed for UI consistency, though alert is primary
      setError("Please upload a file first.");
      return;
    }
    setError(""); // Clear any previous errors shown in the UI
    setIsLoading(true);

    // Simulate backend call
    setTimeout(() => {
      setIsLoading(false);
      alert(`File '${fileName}' submitted for ${materialType} creation. (Simulated)`);
      // Reset form after successful "submission"
      setFile(null);
      setFileName("");
      // Consider resetting materialType or keeping it as is
      // e.target.value = null for file input needs to be handled carefully if we want to reset it here
      // For now, clearing file and fileName is a good step.
      const fileInput = document.getElementById("file-upload");
      if (fileInput) {
        fileInput.value = null;
      }
    }, 2000); // Simulate 2 seconds loading time
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Study Material Generator</h1>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label htmlFor="file-upload" className="block mb-1 font-semibold">Upload Study File (.pdf, .docx, .txt)</label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="w-full" // Ensure input takes full width if not by default
                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              />
              {fileName && <p className="text-sm mt-1 text-gray-600">Selected: {fileName}</p>}
              {error && <p className="text-sm mt-1 text-red-500">{error}</p>}
            </div>

            <div>
              <label htmlFor="material-type" className="block mb-1 font-semibold">Select Material Type</label>
              <select
                className="w-full border p-2 rounded-md"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
              >
                <option value="flashcards">Flash Cards</option>
                <option value="multiple_choice">Multiple Choice Questions</option>
                <option value="short_answer">Short Answer Questions</option>
                <option value="practice_exam">Practice Exam</option>
              </select>
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Study Material"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
