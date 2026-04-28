export default function CVPreview({ data }) {
  const { personalInfo, experience, projects, education, skills, sectionOrder = ['experience', 'projects', 'education', 'skills'] } = data;

  const formatLink = (url) => {
    if (!url) return '';
    let formatted = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    if (formatted.endsWith('/')) formatted = formatted.slice(0, -1);
    return formatted;
  };

  const formatDates = (item) => {
    if (item.date && !item.startYear) return item.date; // Support old/unstructured data
    if (!item.startYear) return '';
    
    // Simple month name map if we want to look nicer, or just use the number
    const getMonthStr = (m) => m ? m + '/' : '';
    const start = `${getMonthStr(item.startMonth)}${item.startYear}`;
    const end = item.isCurrent ? 'Present' : `${getMonthStr(item.endMonth)}${item.endYear}`;
    
    if (!item.endYear && !item.isCurrent) return start;
    return `${start} - ${end}`;
  };

  const renderers = {
    experience: () => (
      experience && experience.length > 0 && (
        <div className="cv-section" key="experience">
          <h2 className="cv-section-title">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="cv-item">
              <div className="cv-item-header">
                <span>{exp.position} {exp.company && `| ${exp.company}`}</span>
                <span>{formatDates(exp)}</span>
              </div>
              <div className="cv-item-sub">
                <span></span>
                <span>{exp.location}</span>
              </div>
              <div className="cv-item-desc">
                {exp.description && (
                  <ul>
                    {exp.description.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    ),
    projects: () => (
      projects && projects.length > 0 && (
        <div className="cv-section" key="projects">
          <h2 className="cv-section-title">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="cv-item">
              <div className="cv-item-header">
                <span>{proj.name} {proj.type && `- ${proj.type}`}</span>
                {proj.link && <span><a href={`https://${formatLink(proj.link)}`} target="_blank" rel="noreferrer" className="cv-link">{formatLink(proj.link)}</a></span>}
              </div>
              <div className="cv-item-desc">
                {proj.description && (
                  <ul>
                    {proj.description.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    ),
    education: () => (
      education && education.length > 0 && (
        <div className="cv-section" key="education">
          <h2 className="cv-section-title">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="cv-item" style={{ marginBottom: '6pt' }}>
              <div className="cv-item-header">
                <span>{edu.degree} {edu.institution && `| ${edu.institution}`}</span>
                <span>{edu.location ? `${edu.location} | ` : ''}{formatDates(edu)}</span>
              </div>
            </div>
          ))}
        </div>
      )
    ),
    skills: () => (
      skills && skills.length > 0 && (
        <div className="cv-section" key="skills">
          <h2 className="cv-section-title">Skills</h2>
          {skills.map((skill) => (
            <div key={skill.id} className="cv-item" style={{ marginBottom: '4pt' }}>
              <div>
                <strong>{skill.category}: </strong>
                <span>{skill.items}</span>
              </div>
            </div>
          ))}
        </div>
      )
    )
  };

  return (
    <div className="cv-wrapper" id="cv-printable">
      <div className="cv-header">
        <h1 className="cv-name">{personalInfo.fullName || 'Full Name'}</h1>
        <div className="cv-contact">
          {personalInfo.city && personalInfo.country && (
            <span>{personalInfo.city}, {personalInfo.country}</span>
          )}
          {personalInfo.email && <span><a href={`mailto:${personalInfo.email}`} className="cv-link">{personalInfo.email}</a></span>}
          {personalInfo.phone && <span><a href={`tel:${personalInfo.phone.replace(/\s+/g, '')}`} className="cv-link">{personalInfo.phone}</a></span>}
          {personalInfo.linkedin && <span><a href={`https://${formatLink(personalInfo.linkedin)}`} target="_blank" rel="noreferrer" className="cv-link">{formatLink(personalInfo.linkedin)}</a></span>}
          {personalInfo.portfolio && <span><a href={`https://${formatLink(personalInfo.portfolio)}`} target="_blank" rel="noreferrer" className="cv-link">{formatLink(personalInfo.portfolio)}</a></span>}
        </div>
      </div>

      {sectionOrder.map(section => renderers[section] && renderers[section]())}
    </div>
  );
}
