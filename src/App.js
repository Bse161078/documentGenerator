import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [currentAction, setCurrentAction] = useState('');
  const [formData, setFormData] = useState({
    abFlug: '',
    cityFrom: '',
    cityTo: '',
    ankunft: '',
    from: '',
    to: '',
    flight: '',
    date: '',
    klasse: '',
    terminal: '',
    reiseDeur: '',
    partnerName: '',
  });
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [excelFile, setExcelFile] = useState(null);
  const [templateImageFile, setTemplateImageFile] = useState(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleActionChange = (action) => {
    setCurrentAction(action);
    setDownloadLink(''); // Reset download link on action change
  };

  const handleExcelUpload = (event) => {
    setExcelFile(event.target.files[0]);
  };

  const handleTemplateUpload = (event) => {
    setTemplateImageFile(event.target.files[0]);
  };

  const generateDocuments = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (currentAction === 'boardingPass' && (!excelFile || !templateImageFile)) {
      alert("Please upload both Excel and Template files for Boarding Passes.");
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    if (currentAction === 'boardingPass') {
      formDataToSend.append("logo", templateImageFile);
      formDataToSend.append("file", excelFile);
      // Append other form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
    } else if (currentAction === 'excelPassport') {
      formDataToSend.append("image", excelFile); // Assuming the passport image is reused
    }

    try {
      const endpoint = currentAction === 'boardingPass' ? 
        "https://backend.halal-fly.de/boarding" : 
        "https://backend.halal-fly.de/passport"; // Placeholder URL for passport processing

      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDownloadLink(result.data.boarding); // Adjust according to API response
        alert(`Success! ${result.message}`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error while sending files to API:", error);
      alert("Failed to upload files to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Document Generator</h1>
      <div>
        <button style={{ marginRight: "10px" }} onClick={() => handleActionChange('boardingPass')}>
          Generate Boarding Pass
        </button>
        <button onClick={() => handleActionChange('excelPassport')}>
          Generate Excel through Passport
        </button>
      </div>

      {currentAction && (
        <form onSubmit={generateDocuments}>
          {currentAction === 'boardingPass' && (
            <div className="form-container">
              <h2>Boarding Pass Generator</h2>
              <input type="file" accept=".csv" onChange={handleExcelUpload} />
              <input type="file" accept="image/*" onChange={handleTemplateUpload} />
              {Object.keys(formData).map(key => (
                <input
                  key={key}
                  type="text"
                  name={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                  value={formData[key]}
                  onChange={handleInputChange}
                />
              ))}
              <button type="submit" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Boarding Passes'}
              </button>
            </div>
          )}

          {currentAction === 'excelPassport' && (
            <div className="form-container">
              <h2>Excel Generation from Passport Data</h2>
              <input type="file" accept="image/*" onChange={handleExcelUpload} />
              <button type="submit" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Excel'}
              </button>
            </div>
          )}
        </form>
      )}

      {downloadLink && (
        <div className="download-link">
          <a href={downloadLink} target="_blank" rel="noopener noreferrer">Download Files</a>
          <p>This link will expire in 1 hour.</p>
        </div>
      )}
    </div>
  );
};

export default App;