import { useState } from "react";
import axios from "axios";
import "./App.css";

interface AdFormData {
  eventName: string;
  eventDate: string;
  ticketLink: string;
  budget: number;
  location: string;
  radiusMiles: number;
  runDates: string;
  audienceTags: string;
  audienceTypes: string[];
  conversionType: "Traffic" | "Conversions";
  pageSource: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<AdFormData>({
    eventName: "",
    eventDate: "",
    ticketLink: "",
    budget: 0,
    location: "",
    radiusMiles: 10,
    runDates: "",
    audienceTags: "",
    audienceTypes: [],
    conversionType: "Conversions",
    pageSource: "",
  });
  const [link, setLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const apiUrl = "https://snareshare-backend.onrender.com";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setLink("");

    try {
      // Step 1 – get presigned URLs
      const res = await axios.get<{ uploadUrl: string; downloadUrl: string }>(
        `${apiUrl}/api/get-presigned-url`,
        { params: { filename: file.name } }
      );
      const { uploadUrl, downloadUrl } = res.data;

      // Step 2 – upload file to S3
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      // Step 3 – post metadata to backend
      await axios.post(`${apiUrl}/api/ad-form`, {
        ...formData,
        creativeUrl: downloadUrl,
      });

      setLink(downloadUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("❌ Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎯 AdForge (beta)</h1>
      <p>Generate and launch event ads in minutes</p>

      <div className="form-area">
        <input
          type="text"
          name="eventName"
          placeholder="Event Name"
          value={formData.eventName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="eventDate"
          placeholder="Event Date"
          value={formData.eventDate}
          onChange={handleChange}
        />
        <input
          type="url"
          name="ticketLink"
          placeholder="Ticket Link"
          value={formData.ticketLink}
          onChange={handleChange}
        />
        <input
          type="number"
          name="budget"
          placeholder="Budget (£)"
          value={formData.budget}
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        <input
          type="number"
          name="radiusMiles"
          placeholder="Radius (miles)"
          value={formData.radiusMiles}
          onChange={handleChange}
        />
        <input
          type="text"
          name="runDates"
          placeholder="Run Dates (e.g. Wed–Sat)"
          value={formData.runDates}
          onChange={handleChange}
        />
        <input
          type="text"
          name="audienceTags"
          placeholder="Audience Tags (comma separated)"
          value={formData.audienceTags}
          onChange={handleChange}
        />
        <select
          name="conversionType"
          value={formData.conversionType}
          onChange={handleChange}
        >
          <option value="Conversions">Conversions (Ticket Sales)</option>
          <option value="Traffic">Traffic (Link Clicks)</option>
        </select>

        <input
          type="text"
          name="pageSource"
          placeholder="Page Source (e.g. Fire London)"
          value={formData.pageSource}
          onChange={handleChange}
        />

        <div className="upload-section">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Uploading..." : "Upload Creative & Submit"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {link && (
        <div className="share-link">
          <h3>✅ File Uploaded:</h3>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
