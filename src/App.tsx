import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return;

    try {
      // 1. Get presigned URLs from backend
      const res = await axios.get<{ uploadUrl: string; downloadUrl: string }>(
        "http://localhost:3001/api/get-presigned-url",
        {
          params: { filename: file.name },
        }
      );

      const { uploadUrl, downloadUrl } = res.data;

      // 2. Upload file directly to S3
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      // 3. Set shareable link
      setLink(downloadUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
  <div className="container">
    <h1>🥁 SnareShare</h1>
    <p>Upload your Ableton project & drop it like a snare</p>

    <div className="upload-area">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>

    {link && (
      <div className="share-link">
        <h3>✅ Share this link:</h3>
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      </div>
    )}

    <div className="coming-soon">
      🔒 Sign in & project history — <strong>coming soon</strong>  
      <br />
      Free to use for now 🚀
    </div>
  </div>
);
}

export default App;
