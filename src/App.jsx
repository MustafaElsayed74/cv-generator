import { useState, useEffect, useRef } from 'react';
import CVForm from './components/CVForm';
import CVPreview from './components/CVPreview';
import { Printer, FileText, Upload, Save, Clock, LogOut } from 'lucide-react';
import { generateDocx } from './utils/exportDocx';
import { parseCVText } from './utils/parseCV';
import { saveCV, getHistory, loadCV } from './utils/blobStorage';
import * as mammoth from 'mammoth';
import './index.css';

const defaultData = {
  sectionOrder: ['experience', 'projects', 'education', 'skills'],
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
      startMonth: '07',
      startYear: '2022',
      endMonth: '',
      endYear: '',
      isCurrent: true,
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
      location: 'USA, 2021',
      startMonth: '09',
      startYear: '2017',
      endMonth: '05',
      endYear: '2021',
      isCurrent: false
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
  const [username, setUsername] = useState(() => localStorage.getItem('cv-username') || '');
  const [tempUsername, setTempUsername] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [cvData, setCvData] = useState(() => {
    const saved = localStorage.getItem('cv-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.sectionOrder) parsed.sectionOrder = defaultData.sectionOrder;
        return parsed;
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('cv-data', JSON.stringify(cvData));
  }, [cvData]);

  useEffect(() => {
    if (username) {
      localStorage.setItem('cv-username', username);
      fetchHistory();
    } else {
      localStorage.removeItem('cv-username');
      setHistory([]);
    }
  }, [username]);

  const fetchHistory = async () => {
    try {
      const data = await getHistory(username);
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      await saveCV(username, cvData);
      await fetchHistory();
      alert("CV successfully saved to your history!");
    } catch (e) {
      console.error("Failed to save:", e);
      alert("Failed to save to cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadFromCloud = async (url) => {
    try {
      const loadedData = await loadCV(url);
      if (!loadedData.sectionOrder) loadedData.sectionOrder = defaultData.sectionOrder;
      setCvData(loadedData);
      setShowHistory(false);
      alert("CV loaded successfully!");
    } catch (e) {
      console.error("Failed to load CV:", e);
      alert("Failed to load CV from cloud.");
    }
  };

  if (!username) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
        <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border-card)', textAlign: 'center', width: '400px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Welcome to Resume Builder</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Enter your email or a unique username to access and save your resume history.</p>
          <input 
            className="form-control" 
            placeholder="Email or Username" 
            value={tempUsername} 
            onChange={(e) => setTempUsername(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setUsername(tempUsername)}>
            Login
          </button>
        </div>
      </div>
    );
  }

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
      {/* HISTORY MODAL/SIDEBAR */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '350px', background: 'var(--bg-card)', height: '100%', borderLeft: '1px solid var(--border-card)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Your History</h2>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setShowHistory(false)}>Close</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {history.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No saved CVs found.</p> : null}
              {history.map((h, i) => (
                <div key={h.url} style={{ padding: '1rem', border: '1px solid var(--border-card)', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Version {history.length - i}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{new Date(h.uploadedAt).toLocaleString()}</p>
                  <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleLoadFromCloud(h.url)}>
                    Load This Version
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="left-pane">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Resume Builder</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Logged in as <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{username}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="file" 
              accept=".docx" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <button className="btn btn-secondary" title="Import DOCX" onClick={() => fileInputRef.current.click()}>
              <Upload size={18} />
            </button>
            <button className="btn btn-secondary" title="View History" onClick={() => setShowHistory(true)}>
              <Clock size={18} />
            </button>
            <button className="btn" title="Save to History" disabled={isSaving} onClick={handleSaveToCloud}>
              <Save size={18} />
              {isSaving ? "..." : ""}
            </button>
            <button className="btn btn-danger" title="Logout" onClick={() => setUsername('')}>
              <LogOut size={18} />
            </button>
          </div>
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
