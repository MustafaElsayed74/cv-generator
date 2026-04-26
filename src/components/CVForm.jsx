import { Plus, Trash2 } from 'lucide-react';

export default function CVForm({ data, setData }) {
  const updatePersonal = (field, value) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateArrayItem = (arrayName, id, field, value) => {
    setData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (arrayName, emptyItem) => {
    setData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...emptyItem, id: Date.now().toString() }]
    }));
  };

  const removeArrayItem = (arrayName, id) => {
    setData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter(item => item.id !== id)
    }));
  };

  return (
    <div className="cv-form">
      {/* PERSONAL INFO */}
      <div className="form-section">
        <h2>Personal Information</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input className="form-control" value={data.personalInfo.fullName} onChange={e => updatePersonal('fullName', e.target.value)} />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>City</label>
            <input className="form-control" value={data.personalInfo.city} onChange={e => updatePersonal('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input className="form-control" value={data.personalInfo.country} onChange={e => updatePersonal('country', e.target.value)} />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={data.personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" value={data.personalInfo.phone} onChange={e => updatePersonal('phone', e.target.value)} />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>LinkedIn</label>
            <input className="form-control" value={data.personalInfo.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} placeholder="in/username" />
          </div>
          <div className="form-group">
            <label>Portfolio / Website</label>
            <input className="form-control" value={data.personalInfo.portfolio} onChange={e => updatePersonal('portfolio', e.target.value)} placeholder="portfolio.com" />
          </div>
        </div>
      </div>

      {/* EXPERIENCE */}
      <div className="form-section">
        <h2>Experience 
          <button className="btn btn-secondary" onClick={() => addArrayItem('experience', { position:'', company:'', date:'', location:'', description:'' })}>
            <Plus size={16} /> Add
          </button>
        </h2>
        {data.experience.map(exp => (
          <div key={exp.id} className="item-card">
            <button className="remove-btn" onClick={() => removeArrayItem('experience', exp.id)}><Trash2 size={16} /></button>
            <div className="grid-2">
              <div className="form-group">
                <label>Position</label>
                <input className="form-control" value={exp.position} onChange={e => updateArrayItem('experience', exp.id, 'position', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input className="form-control" value={exp.company} onChange={e => updateArrayItem('experience', exp.id, 'company', e.target.value)} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Date (e.g. July 2024 - Present)</label>
                <input className="form-control" value={exp.date} onChange={e => updateArrayItem('experience', exp.id, 'date', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="form-control" value={exp.location} onChange={e => updateArrayItem('experience', exp.id, 'location', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Description (Bullet points, one per line)</label>
              <textarea className="form-control" value={exp.description} onChange={e => updateArrayItem('experience', exp.id, 'description', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      {/* PROJECTS */}
      <div className="form-section">
        <h2>Projects
          <button className="btn btn-secondary" onClick={() => addArrayItem('projects', { name:'', type:'', link:'', description:'' })}>
            <Plus size={16} /> Add
          </button>
        </h2>
        {data.projects.map(proj => (
          <div key={proj.id} className="item-card">
            <button className="remove-btn" onClick={() => removeArrayItem('projects', proj.id)}><Trash2 size={16} /></button>
            <div className="grid-2">
              <div className="form-group">
                <label>Project Name</label>
                <input className="form-control" value={proj.name} onChange={e => updateArrayItem('projects', proj.id, 'name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Project Type</label>
                <input className="form-control" value={proj.type} onChange={e => updateArrayItem('projects', proj.id, 'type', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Link</label>
              <input className="form-control" value={proj.link} onChange={e => updateArrayItem('projects', proj.id, 'link', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" style={{minHeight:'60px'}} value={proj.description} onChange={e => updateArrayItem('projects', proj.id, 'description', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      {/* EDUCATION */}
      <div className="form-section">
        <h2>Education
          <button className="btn btn-secondary" onClick={() => addArrayItem('education', { degree:'', institution:'', location:'' })}>
            <Plus size={16} /> Add
          </button>
        </h2>
        {data.education.map(edu => (
          <div key={edu.id} className="item-card">
            <button className="remove-btn" onClick={() => removeArrayItem('education', edu.id)}><Trash2 size={16} /></button>
            <div className="form-group">
              <label>Degree</label>
              <input className="form-control" value={edu.degree} onChange={e => updateArrayItem('education', edu.id, 'degree', e.target.value)} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Institution</label>
                <input className="form-control" value={edu.institution} onChange={e => updateArrayItem('education', edu.id, 'institution', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location & Year</label>
                <input className="form-control" value={edu.location} onChange={e => updateArrayItem('education', edu.id, 'location', e.target.value)} placeholder="Country, 2024" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SKILLS */}
      <div className="form-section">
        <h2>Skills
          <button className="btn btn-secondary" onClick={() => addArrayItem('skills', { category:'', items:'' })}>
            <Plus size={16} /> Add
          </button>
        </h2>
        {data.skills.map(skill => (
          <div key={skill.id} className="item-card">
            <button className="remove-btn" onClick={() => removeArrayItem('skills', skill.id)}><Trash2 size={16} /></button>
            <div className="form-group">
              <label>Category (e.g. Languages)</label>
              <input className="form-control" value={skill.category} onChange={e => updateArrayItem('skills', skill.id, 'category', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Items (Comma separated)</label>
              <input className="form-control" value={skill.items} onChange={e => updateArrayItem('skills', skill.id, 'items', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
