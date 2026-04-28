import { useState, useEffect, useRef } from 'react';
import CVForm from './components/CVForm';
import CVPreview from './components/CVPreview';
import { Printer, FileText, Upload, Save, Clock, Download, ChevronDown } from 'lucide-react';
import { generateDocx } from './utils/exportDocx';
import { parseCVText } from './utils/parseCV';
import { saveCV, getHistory, loadCV } from './utils/blobStorage';
import * as mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from "@clerk/clerk-react";
import './index.css';

const defaultData = {
  sectionOrder: ['experience', 'projects', 'education', 'skills'],
  templateId: 'classic',
  personalInfo: {
    fullName: '',
    city: '',
    country: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: ''
  },
  experience: [],
  projects: [],
  education: [],
  skills: []
};

function App() {
  const { user } = useUser();
  const userId = user?.primaryEmailAddress?.emailAddress || user?.id;

  const [historyData, setHistoryData] = useState({ profiles: {}, allBlobs: [] });
  const [showHistory, setShowHistory] = useState(false);
  const [selectedProfileHistory, setSelectedProfileHistory] = useState(null);
  
  const [cvName, setCvName] = useState('My Resume');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

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
    if (userId) {
      fetchHistory();
    } else {
      setHistoryData({ profiles: {}, allBlobs: [] });
      setCvData(defaultData);
      setCvName('My Resume');
      localStorage.removeItem('cv-data');
    }
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const data = await getHistory(userId);
      setHistoryData(data);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const handleSaveToCloud = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await saveCV(userId, cvName, cvData);
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

  const handleExportPDF = () => {
    const element = document.getElementById('cv-printable');
    const opt = {
      margin:       0,
      filename:     `${cvName.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    setShowExportMenu(false);
  };

  return (
    <>
      <SignedOut>
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-app)' }}>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="app-container">
          {/* HISTORY MODAL/SIDEBAR */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '400px', background: 'var(--bg-card)', height: '100%', borderLeft: '1px solid var(--border-card)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{selectedProfileHistory ? `Profile: ${selectedProfileHistory.replace(/_/g, ' ')}` : 'Your CV Profiles'}</h2>
              <div style={{display:'flex', gap:'0.5rem'}}>
                {selectedProfileHistory && <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setSelectedProfileHistory(null)}>Back</button>}
                <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setShowHistory(false); setSelectedProfileHistory(null); }}>Close</button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {!selectedProfileHistory ? (
                Object.keys(historyData.profiles).length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No saved CVs found.</p> : (
                  Object.entries(historyData.profiles).map(([name, blobs]) => (
                    <div key={name} style={{ padding: '1rem', border: '1px solid var(--border-card)', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }} onClick={() => setSelectedProfileHistory(name)} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}>
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{name.replace(/_/g, ' ')}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{blobs.length} version{blobs.length !== 1 ? 's' : ''}</p>
                      </div>
                      <span style={{color: 'var(--accent)', fontSize: '0.9rem'}}>View &rarr;</span>
                    </div>
                  ))
                )
              ) : (
                historyData.profiles[selectedProfileHistory]?.map((h, i) => (
                  <div key={h.url} style={{ padding: '1rem', border: '1px solid var(--border-card)', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Version {historyData.profiles[selectedProfileHistory].length - i}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{new Date(h.uploadedAt).toLocaleString()}</p>
                    <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { handleLoadFromCloud(h.url); setCvName(selectedProfileHistory.replace(/_/g, ' ')); }}>
                      Load This Version
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="left-pane">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-card)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Resume Builder</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Profile:</span>
              <input 
                type="text" 
                value={cvName} 
                onChange={(e) => setCvName(e.target.value)} 
                className="form-control" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', height: 'auto', width: '180px' }} 
                placeholder="e.g. Software Engineer CV"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
            <div style={{ marginLeft: '0.5rem' }}>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
        <CVForm data={cvData} setData={setCvData} />
      </div>
      <div className="right-pane">
        <div className="right-pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Template:</span>
            <select 
              value={cvData.templateId || 'classic'} 
              onChange={e => setCvData({ ...cvData, templateId: e.target.value })}
              className="form-control"
              style={{ padding: '0.25rem 0.5rem', height: 'auto', width: 'auto', cursor: 'pointer', background: 'var(--bg-app)' }}
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern (Two-Column)</option>
              <option value="minimal">Minimalist</option>
            </select>
          </div>
          
          <div className="export-actions" style={{ position: 'relative' }}>
            <button className="btn" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download size={18} />
              Export
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', zIndex: 50, display: 'flex', flexDirection: 'column', minWidth: '180px', overflow: 'hidden' }}>
                <button className="btn-secondary" style={{ border: 'none', borderRadius: 0, justifyContent: 'flex-start', padding: '0.75rem 1rem', background: 'transparent' }} onClick={handleExportPDF}>
                  <Printer size={16} /> Download PDF
                </button>
                <button className="btn-secondary" style={{ border: 'none', borderRadius: 0, justifyContent: 'flex-start', padding: '0.75rem 1rem', borderTop: '1px solid var(--border-card)', background: 'transparent' }} onClick={() => { generateDocx(cvData); setShowExportMenu(false); }}>
                  <FileText size={16} /> Download DOCX
                </button>
              </div>
            )}
          </div>
        </div>
          <CVPreview data={cvData} />
        </div>
        </div>
      </SignedIn>
    </>
  );
}

export default App;
