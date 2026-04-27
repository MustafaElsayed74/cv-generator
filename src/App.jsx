import { useState, useEffect } from 'react';
import CVForm from './components/CVForm';
import CVPreview from './components/CVPreview';
import { Printer, FileText } from 'lucide-react';
import { generateDocx } from './utils/exportDocx';
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      <div className="left-pane">
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
