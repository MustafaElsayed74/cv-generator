export const parseCVText = (text) => {
  const result = {
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

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) return result;

  // 1. Basic Personal Info
  result.personalInfo.fullName = lines[0];

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkRegex = /(linkedin\.com\/in\/[a-zA-Z0-9_-]+|github\.com\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+\.(com|net|io|me))/i;

  // Scan first 15 lines for contact info
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    
    if (!result.personalInfo.email) {
      const emailMatch = line.match(emailRegex);
      if (emailMatch) result.personalInfo.email = emailMatch[0];
    }
    
    if (!result.personalInfo.phone) {
      const phoneMatch = line.match(phoneRegex);
      if (phoneMatch) result.personalInfo.phone = phoneMatch[0];
    }

    if (!result.personalInfo.linkedin && line.toLowerCase().includes('linkedin')) {
      const linkMatch = line.match(linkRegex);
      if (linkMatch) result.personalInfo.linkedin = linkMatch[0];
    }
    
    if (!result.personalInfo.portfolio && (line.toLowerCase().includes('github') || line.toLowerCase().includes('.com'))) {
      const linkMatch = line.match(linkRegex);
      if (linkMatch && !linkMatch[0].includes('linkedin')) result.personalInfo.portfolio = linkMatch[0];
    }
  }

  // Section parsing
  let currentSection = null;
  let sectionContent = {
    experience: [],
    education: [],
    projects: [],
    skills: []
  };

  const sectionKeywords = {
    experience: ['experience', 'work history', 'employment history', 'professional experience'],
    education: ['education', 'academic background'],
    projects: ['projects', 'personal projects'],
    skills: ['skills', 'technologies', 'core competencies', 'technical skills']
  };

  const findSection = (line) => {
    const lowerLine = line.toLowerCase();
    for (const [key, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(k => lowerLine === k || lowerLine === k + ':')) {
        return key;
      }
    }
    return null;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const detectedSection = findSection(line);
    
    if (detectedSection) {
      currentSection = detectedSection;
      continue;
    }

    if (currentSection) {
      sectionContent[currentSection].push(line);
    }
  }

  // Parse Experience
  if (sectionContent.experience.length > 0) {
    let currentExp = null;
    sectionContent.experience.forEach(line => {
      // Short lines might be titles or dates, long lines are descriptions
      if (line.length < 60 && !line.includes('•') && !line.startsWith('-') && !line.toLowerCase().includes('achieved') && !line.toLowerCase().includes('developed')) {
        if (currentExp) result.experience.push(currentExp);
        currentExp = {
          id: Date.now().toString() + Math.random().toString(),
          position: line,
          company: '',
          date: '',
          location: '',
          description: ''
        };
      } else if (currentExp) {
        currentExp.description += (currentExp.description ? '\n' : '') + line.replace(/^[•-]\s*/, '');
      }
    });
    if (currentExp) result.experience.push(currentExp);
  }

  // Parse Education
  if (sectionContent.education.length > 0) {
    let currentEdu = null;
    sectionContent.education.forEach(line => {
      if (line.length < 70 && !line.includes('•') && !line.startsWith('-')) {
        if (currentEdu) result.education.push(currentEdu);
        currentEdu = {
           id: Date.now().toString() + Math.random().toString(),
           degree: line,
           institution: '',
           location: ''
        };
      } else if (currentEdu) {
        // Just append to institution if there's extra info
        currentEdu.institution += (currentEdu.institution ? ', ' : '') + line;
      }
    });
    if (currentEdu) result.education.push(currentEdu);
  }

  // Parse Projects
  if (sectionContent.projects.length > 0) {
    let currentProj = null;
    sectionContent.projects.forEach(line => {
      if (line.length < 50 && !line.includes('•')) {
        if (currentProj) result.projects.push(currentProj);
        currentProj = {
          id: Date.now().toString() + Math.random().toString(),
          name: line,
          type: '',
          link: '',
          description: ''
        };
      } else if (currentProj) {
        currentProj.description += (currentProj.description ? '\n' : '') + line.replace(/^[•-]\s*/, '');
      }
    });
    if (currentProj) result.projects.push(currentProj);
  }

  // Parse Skills
  if (sectionContent.skills.length > 0) {
    const allSkills = sectionContent.skills.join(', ').replace(/, \s*,/g, ',');
    result.skills.push({
      id: Date.now().toString(),
      category: 'Extracted Skills',
      items: allSkills
    });
  }

  return result;
};
