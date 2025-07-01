import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function StudyApp() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [materialType, setMaterialType] = useState("flashcards");

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile ? uploadedFile.name : "");
  };

  const handleSubmit = () => {
    if (!file) return alert("Please upload a file first.");
    // Placeholder for backend interaction
    alert(`File '${fileName}' submitted for ${materialType} creation.`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Study Material Generator</h1>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Upload Study File</label>
              <Input type="file" onChange={handleFileChange} />
              {fileName && <p className="text-sm mt-1 text-gray-600">Selected: {fileName}</p>}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Select Material Type</label>
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

            <Button className="w-full" onClick={handleSubmit}>
              Generate Study Material
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
