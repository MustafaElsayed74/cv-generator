import { Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

export default function CVForm({ data, setData }) {
  const updatePersonal = (field, value) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }],
      ['clean']
    ]
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event, arrayName) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev[arrayName].findIndex((item) => item.id === active.id);
        const newIndex = prev[arrayName].findIndex((item) => item.id === over.id);
        return {
          ...prev,
          [arrayName]: arrayMove(prev[arrayName], oldIndex, newIndex),
        };
      });
    }
  };

  const handleSectionDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.sectionOrder.findIndex((s) => s === active.id);
        const newIndex = prev.sectionOrder.findIndex((s) => s === over.id);
        return {
          ...prev,
          sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex),
        };
      });
    }
  };

  // Helper renderers for sections
  const renderExperience = () => (
    <div className="form-section">
      <h2>Experience 
        <button className="btn btn-secondary" onClick={() => addArrayItem('experience', { position:'', company:'', startMonth:'', startYear:'', endMonth:'', endYear:'', isCurrent: false, location:'', description:'' })}>
          <Plus size={16} /> Add
        </button>
      </h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'experience')}>
        <SortableContext items={data.experience.map(e => e.id)} strategy={verticalListSortingStrategy}>
          {data.experience.map(exp => (
            <SortableItem key={exp.id} id={exp.id} onRemove={(id) => removeArrayItem('experience', id)}>
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
                  <label>Start Date</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="form-control" value={exp.startMonth || ''} onChange={e => updateArrayItem('experience', exp.id, 'startMonth', e.target.value)}>
                      <option value="">Month</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="form-control" value={exp.startYear || ''} onChange={e => updateArrayItem('experience', exp.id, 'startYear', e.target.value)}>
                      <option value="">Year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!exp.isCurrent ? (
                      <>
                        <select className="form-control" value={exp.endMonth || ''} onChange={e => updateArrayItem('experience', exp.id, 'endMonth', e.target.value)}>
                          <option value="">Month</option>
                          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select className="form-control" value={exp.endYear || ''} onChange={e => updateArrayItem('experience', exp.id, 'endYear', e.target.value)}>
                          <option value="">Year</option>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </>
                    ) : (
                      <span style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Present</span>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', marginLeft: 'auto', margin: 0 }}>
                      <input type="checkbox" checked={exp.isCurrent || false} onChange={e => updateArrayItem('experience', exp.id, 'isCurrent', e.target.checked)} />
                      Current
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="form-control" value={exp.location} onChange={e => updateArrayItem('experience', exp.id, 'location', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <ReactQuill 
                  theme="snow" 
                  value={exp.description} 
                  onChange={content => updateArrayItem('experience', exp.id, 'description', content)}
                  modules={quillModules}
                  placeholder="Press Enter to send or Shift+Enter for a new line"
                />
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );

  const renderProjects = () => (
    <div className="form-section">
      <h2>Projects
        <button className="btn btn-secondary" onClick={() => addArrayItem('projects', { name:'', type:'', link:'', description:'' })}>
          <Plus size={16} /> Add
        </button>
      </h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'projects')}>
        <SortableContext items={data.projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {data.projects.map(proj => (
            <SortableItem key={proj.id} id={proj.id} onRemove={(id) => removeArrayItem('projects', id)}>
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
                <ReactQuill 
                  theme="snow" 
                  value={proj.description} 
                  onChange={content => updateArrayItem('projects', proj.id, 'description', content)}
                  modules={quillModules}
                  placeholder="Press Enter to send or Shift+Enter for a new line"
                />
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );

  const renderEducation = () => (
    <div className="form-section">
      <h2>Education
        <button className="btn btn-secondary" onClick={() => addArrayItem('education', { degree:'', institution:'', location:'', startMonth:'', startYear:'', endMonth:'', endYear:'', isCurrent: false })}>
          <Plus size={16} /> Add
        </button>
      </h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'education')}>
        <SortableContext items={data.education.map(e => e.id)} strategy={verticalListSortingStrategy}>
          {data.education.map(edu => (
            <SortableItem key={edu.id} id={edu.id} onRemove={(id) => removeArrayItem('education', id)}>
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
                  <label>Location</label>
                  <input className="form-control" value={edu.location} onChange={e => updateArrayItem('education', edu.id, 'location', e.target.value)} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Start Date</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="form-control" value={edu.startMonth || ''} onChange={e => updateArrayItem('education', edu.id, 'startMonth', e.target.value)}>
                      <option value="">Month</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="form-control" value={edu.startYear || ''} onChange={e => updateArrayItem('education', edu.id, 'startYear', e.target.value)}>
                      <option value="">Year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!edu.isCurrent ? (
                      <>
                        <select className="form-control" value={edu.endMonth || ''} onChange={e => updateArrayItem('education', edu.id, 'endMonth', e.target.value)}>
                          <option value="">Month</option>
                          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select className="form-control" value={edu.endYear || ''} onChange={e => updateArrayItem('education', edu.id, 'endYear', e.target.value)}>
                          <option value="">Year</option>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </>
                    ) : (
                      <span style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Present</span>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', marginLeft: 'auto', margin: 0 }}>
                      <input type="checkbox" checked={edu.isCurrent || false} onChange={e => updateArrayItem('education', edu.id, 'isCurrent', e.target.checked)} />
                      Current
                    </label>
                  </div>
                </div>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );

  const renderSkills = () => (
    <div className="form-section">
      <h2>Skills
        <button className="btn btn-secondary" onClick={() => addArrayItem('skills', { category:'', items:'' })}>
          <Plus size={16} /> Add
        </button>
      </h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'skills')}>
        <SortableContext items={data.skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {data.skills.map(skill => (
            <SortableItem key={skill.id} id={skill.id} onRemove={(id) => removeArrayItem('skills', id)}>
              <div className="form-group">
                <label>Category (e.g. Languages)</label>
                <input className="form-control" value={skill.category} onChange={e => updateArrayItem('skills', skill.id, 'category', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Items (Comma separated)</label>
                <input className="form-control" value={skill.items} onChange={e => updateArrayItem('skills', skill.id, 'items', e.target.value)} />
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );

  const renderers = {
    experience: renderExperience,
    projects: renderProjects,
    education: renderEducation,
    skills: renderSkills
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
        <div className="form-group">
          <label>Professional Title</label>
          <input className="form-control" value={data.personalInfo.title || ''} onChange={e => updatePersonal('title', e.target.value)} placeholder="e.g. Backend .NET Developer | ASP.NET Core" />
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

      <div className="form-section">
        <h2>Layout Order</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Drag to reorder the main sections of your resume.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={data.sectionOrder} strategy={verticalListSortingStrategy}>
            {data.sectionOrder.map(section => (
              <SortableItem key={section} id={section} onRemove={() => {}}>
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{section}</span>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {data.sectionOrder.map(section => (
        <div key={`render-${section}`}>
          {renderers[section]()}
        </div>
      ))}
    </div>
  );
}
