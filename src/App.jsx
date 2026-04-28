import { useState, useEffect, useRef } from 'react';
import CVForm from './components/CVForm';
import CVPreview from './components/CVPreview';
import { Printer, FileText, Upload, Save, Clock, Download, ChevronDown, LayoutTemplate, FilePlus2, ArrowLeft, FileCode2 } from 'lucide-react';
import { generateDocx, generateCustomDocx } from './utils/exportDocx';
import { parseCVText } from './utils/parseCV';
import { saveCV, getHistory, loadCV } from './utils/blobStorage';
import * as mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from "@clerk/clerk-react";
import './index.css';

const emptyData = {
  sectionOrder: ['experience', 'projects', 'education', 'skills'],
  templateId: 'classic',
  customTemplateBase64: null,
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

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'gallery', 'builder'
  
  const [historyData, setHistoryData] = useState({ profiles: {}, allBlobs: [] });
  const [showHistory, setShowHistory] = useState(false);
  const [selectedProfileHistory, setSelectedProfileHistory] = useState(null);
  
  const [cvName, setCvName] = useState('My Resume');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const customTemplateRef = useRef(null);

  const [cvData, setCvData] = useState(() => {
    const saved = localStorage.getItem('cv-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.sectionOrder) parsed.sectionOrder = emptyData.sectionOrder;
        return parsed;
      } catch (e) {
        return emptyData;
      }
    }
    return emptyData;
  });

  useEffect(() => {
    localStorage.setItem('cv-data', JSON.stringify(cvData));
  }, [cvData]);

  useEffect(() => {
    if (userId) {
      fetchHistory();
    } else {
      setHistoryData({ profiles: {}, allBlobs: [] });
      setCvData(emptyData);
      setCvName('My Resume');
      localStorage.removeItem('cv-data');
      setCurrentView('dashboard');
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
      if (!loadedData.sectionOrder) loadedData.sectionOrder = emptyData.sectionOrder;
      setCvData(loadedData);
      setCurrentView('builder');
      setShowHistory(false);
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

  const handleCreateNew = (templateId) => {
    setCvData({ ...emptyData, templateId, customTemplateBase64: null });
    setCvName('Untitled CV');
    setCurrentView('builder');
  };

  const handleCustomTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCvData({ ...emptyData, templateId: 'custom', customTemplateBase64: event.target.result });
      setCvName('Custom Template CV');
      setCurrentView('builder');
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const renderDashboard = () => (
    <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="CV Gen Logo" style={{ height: '48px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.2rem', lineHeight: 1 }}>My Resumes</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage and edit your CV profiles</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn" onClick={() => setCurrentView('gallery')} style={{ padding: '0.75rem 1.5rem', fontSize: '1.1rem' }}>
            <FilePlus2 size={20} /> Create New CV
          </button>
          <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {Object.entries(historyData.profiles).length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-card)' }}>
             <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>No resumes yet!</h3>
             <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Create your first CV to get started.</p>
             <button className="btn" onClick={() => setCurrentView('gallery')} style={{ margin: '0 auto' }}>
               <FilePlus2 size={18} /> Create New CV
             </button>
          </div>
        ) : (
          Object.entries(historyData.profiles).map(([name, blobs]) => (
            <div key={name} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-card)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} 
                 onClick={() => {
                   const latestBlob = blobs[0];
                   handleLoadFromCloud(latestBlob.url);
                   setCvName(name.replace(/_/g, ' '));
                 }}
                 onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.3)'; }}
                 onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ height: '160px', background: 'var(--bg-app)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid var(--border-card)' }}>
                <LayoutTemplate size={48} color="var(--accent)" opacity={0.5} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{name.replace(/_/g, ' ')}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{blobs.length} Version{blobs.length !== 1 ? 's' : ''} • Last updated {new Date(blobs[0].uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderGallery = () => (
    <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setCurrentView('dashboard')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src="/logo.png" alt="CV Gen Logo" style={{ height: '40px', objectFit: 'contain' }} />
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.2rem', lineHeight: 1 }}>Choose a Template</h1>
          <p style={{ color: 'var(--text-muted)' }}>Select a design to get started, or upload your own DOCX file.</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem' }}>
        <input type="file" accept=".docx" ref={customTemplateRef} style={{ display: 'none' }} onChange={handleCustomTemplateUpload} />
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1rem', border: '2px dashed var(--accent)', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}
             onClick={() => customTemplateRef.current.click()}
             onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
             onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FileCode2 size={64} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem', color: 'var(--accent)' }}>Upload Custom Template</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>Upload a .docx file containing placeholder tags (like {'{fullName}'}) to generate a highly customized resume.</p>
        </div>
        {[
          { id: 'classic', name: 'Classic', desc: 'Standard, professional ATS-friendly layout' },
          { id: 'modern', name: 'Modern', desc: 'Two-column design with emphasized contact details' },
          { id: 'minimal', name: 'Minimalist', desc: 'Clean, spacious, typography-focused layout' }
        ].map(t => (
          <div key={t.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1rem', border: '2px solid transparent', cursor: 'pointer', transition: 'border-color 0.2s' }}
               onClick={() => handleCreateNew(t.id)}
               onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
               onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ height: '350px', background: '#fff', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative' }}>
               {t.id === 'classic' && <div style={{ padding: '2rem' }}><div style={{ width: '60%', height: '20px', background: '#e2e8f0', marginBottom: '1rem' }} /><div style={{ width: '40%', height: '10px', background: '#cbd5e1', marginBottom: '2rem' }} /><div style={{ width: '100%', height: '2px', background: '#0f172a', marginBottom: '2rem' }} /><div style={{ width: '100%', height: '40px', background: '#f1f5f9', marginBottom: '1rem' }} /></div>}
               {t.id === 'modern' && <div style={{ display: 'flex', height: '100%' }}><div style={{ flex: '0 0 30%', background: '#f8fafc', padding: '1rem' }}><div style={{ width: '80%', height: '15px', background: '#cbd5e1', marginBottom: '2rem' }} /><div style={{ width: '60%', height: '8px', background: '#e2e8f0', marginBottom: '0.5rem' }} /></div><div style={{ flex: 1, padding: '1rem' }}><div style={{ width: '100%', height: '30px', background: '#f1f5f9', marginBottom: '1rem' }} /></div></div>}
               {t.id === 'minimal' && <div style={{ padding: '2rem' }}><div style={{ width: '50%', height: '25px', background: '#e2e8f0', margin: '0 auto 1rem auto' }} /><div style={{ width: '30%', height: '8px', background: '#cbd5e1', margin: '0 auto 2rem auto' }} /><div style={{ width: '100%', height: '1px', background: '#e2e8f0', marginBottom: '2rem' }} /></div>}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>{t.name}</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center' }}>{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <SignedOut>
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-app)' }}>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="app-container" style={currentView !== 'builder' ? { display: 'block', height: 'auto', minHeight: '100vh', overflowY: 'auto' } : {}}>
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'gallery' && renderGallery()}
          {currentView === 'builder' && (
            <>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setCurrentView('dashboard')}>
                <ArrowLeft size={14} /> Dashboard
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <img src="/logo.png" alt="CV Gen Logo" style={{ height: '24px', objectFit: 'contain' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Resume Builder</h2>
            </div>
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
        <div className="right-pane-inner">
          <div className="right-pane-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
            
            <div className="export-actions" style={{ position: 'relative' }}>
              <button className="btn" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => setShowExportMenu(!showExportMenu)}>
                <Download size={18} />
                Export
                <ChevronDown size={14} />
              </button>
              {showExportMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', zIndex: 50, display: 'flex', flexDirection: 'column', minWidth: '180px', overflow: 'hidden' }}>
                  <button className="btn-secondary" style={{ border: 'none', borderRadius: 0, justifyContent: 'flex-start', padding: '0.75rem 1rem', background: 'transparent' }} onClick={handleExportPDF} disabled={cvData.templateId === 'custom'}>
                    <Printer size={16} /> Download PDF
                  </button>
                  <button className="btn-secondary" style={{ border: 'none', borderRadius: 0, justifyContent: 'flex-start', padding: '0.75rem 1rem', borderTop: '1px solid var(--border-card)', background: 'transparent' }} onClick={() => { 
                    if (cvData.templateId === 'custom' && cvData.customTemplateBase64) {
                      generateCustomDocx(cvData);
                    } else {
                      generateDocx(cvData); 
                    }
                    setShowExportMenu(false); 
                  }}>
                    <FileText size={16} /> Download DOCX
                  </button>
                </div>
              )}
            </div>
          </div>
          <CVPreview data={cvData} />
        </div>
      </div>
            </>
          )}
        </div>
      </SignedIn>
    </>
  );
}

export default App;
