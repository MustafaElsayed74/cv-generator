import { useState, useEffect, useRef } from 'react';
import CVForm from './components/CVForm';
import CVPreview from './components/CVPreview';
import { Printer, FileText, Upload } from 'lucide-react';
import { generateDocx } from './utils/exportDocx';
import { parseCVText } from './utils/parseCV';
import * as mammoth from 'mammoth';
import './index.css';

const defaultData = {
  personalInfo: {
    fullName: 'Jane Doe',
    city: 'San Francisco',
    country: 'USA',
    email: 'jane.doe@example.com',
    phone: '+1 234 567 8900',
    linkedin: 'linkedin.com/in/janedoe',
    portfolio: 'janedoe.com'
  },
  experience: [
    {
      id: '1',
      position: 'Senior Software Engineer',
      company: 'TechCorp',
      date: 'July 2022 - Present',
      location: 'San Francisco, CA (Remote)',
      description: 'Led development of the core product achieving a 40% increase in user retention.\nStreamlined design-to-development collaboration.\nPartnered with cross-functional teams to deliver 3 full products in under 6 months.'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'CV Generator Web App',
      type: 'Full-Stack Application',
      link: 'github.com/janedoe/cv-gen',
      description: 'Designed & optimized a platform that allows users to generate ATS-friendly CVs dynamically.'
    }
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. in Computer Science',
      institution: 'University of Technology',
      location: 'USA, 2021'
    }
  ],
  skills: [
    {
      id: '1',
      category: 'Languages',
      items: 'JavaScript, TypeScript, Python, C#'
    },
    {
      id: '2',
      category: 'Frameworks',
      items: 'React, Angular, .NET Core, Express'
    }
  ]
};

function App() {
  const [cvData, setCvData] = useState(() => {
    const saved = localStorage.getItem('cv-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('cv-data', JSON.stringify(cvData));
  }, [cvData]);

  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const parsedData = parseCVText(result.value);
      
      setCvData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          ...parsedData.personalInfo
        },
        experience: parsedData.experience.length > 0 ? parsedData.experience : prev.experience,
        projects: parsedData.projects.length > 0 ? parsedData.projects : prev.projects,
        education: parsedData.education.length > 0 ? parsedData.education : prev.education,
        skills: parsedData.skills.length > 0 ? parsedData.skills : prev.skills,
      }));
    } catch (error) {
      console.error("Error parsing DOCX:", error);
      alert("Failed to parse the DOCX file. Please ensure it is a valid Word Document.");
    }
    
    e.target.value = null;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      <div className="left-pane">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Resume Builder</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Fill in the details below or import an existing DOCX</p>
          </div>
          <input 
            type="file" 
            accept=".docx" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
            <Upload size={18} />
            Import DOCX
          </button>
        </div>
        <CVForm data={cvData} setData={setCvData} />
      </div>
      <div className="right-pane">
        <div className="export-actions">
          <button className="btn" onClick={handlePrint}>
            <Printer size={18} />
            Export as PDF
          </button>
          <button className="btn btn-secondary" style={{ background: '#3b82f6', color: 'white', border: 'none' }} onClick={() => generateDocx(cvData)}>
            <FileText size={18} />
            Export as DOCX
          </button>
        </div>
        <CVPreview data={cvData} />
      </div>
    </div>
  );
}

export default App;
