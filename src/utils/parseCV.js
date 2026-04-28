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
    projects: ['projects', 'personal projects', 'key projects'],
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
      const isActionLine = line.match(/^(built|implemented|developed|designed|collaborated|architected|applied|added|secured|documented)/i) || line.includes('•') || line.startsWith('-');
      const isHeader = (line.includes('\t') && !isActionLine) || (line.length < 120 && !isActionLine);

      if (isHeader) {
        if (currentExp) result.experience.push(currentExp);
        currentExp = {
          id: Date.now().toString() + Math.random().toString(),
          position: '',
          company: '',
          date: '',
          location: '',
          description: ''
        };

        let headerText = line;
        if (line.includes('\t')) {
           const parts = line.split('\t');
           headerText = parts[0];
           currentExp.date = parts[parts.length - 1].trim();
        }
        
        if (headerText.includes('·')) {
           const parts = headerText.split('·');
           currentExp.position = parts[0].trim();
           currentExp.company = parts[1].trim();
        } else if (headerText.includes(' - ')) {
           const parts = headerText.split(' - ');
           currentExp.position = parts[0].trim();
           currentExp.company = parts[1].trim();
        } else {
           currentExp.position = headerText;
        }
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
      const isHeader = line.includes('|') || line.includes('\t') || (line.length < 80 && !line.includes('•') && !line.startsWith('-'));
      if (isHeader) {
        if (currentEdu) result.education.push(currentEdu);
        currentEdu = {
           id: Date.now().toString() + Math.random().toString(),
           degree: '',
           institution: '',
           location: ''
        };
        
        let headerText = line;
        if (line.includes('\t')) {
           const parts = line.split('\t');
           headerText = parts[0];
           currentEdu.location = parts[parts.length - 1].trim();
        }
        
        if (headerText.includes('|')) {
           const parts = headerText.split('|');
           currentEdu.degree = parts[0].trim();
           currentEdu.institution = parts[1].trim();
        } else {
           currentEdu.degree = headerText;
        }
      } else if (currentEdu) {
        currentEdu.institution += (currentEdu.institution ? ', ' : '') + line;
      }
    });
    if (currentEdu) result.education.push(currentEdu);
  }

  // Parse Projects
  if (sectionContent.projects.length > 0) {
    let currentProj = null;
    sectionContent.projects.forEach(line => {
      const isActionLine = line.match(/^(built|implemented|developed|designed|collaborated|architected|applied|added|secured|documented)/i) || line.includes('•') || line.startsWith('-');
      const isHeader = !isActionLine && (line.includes('·') || line.includes('–') || line.includes(' - ') || line.includes(' | ') || line.length < 60);

      if (isHeader) {
        if (currentProj) result.projects.push(currentProj);
        currentProj = {
          id: Date.now().toString() + Math.random().toString(),
          name: '',
          type: '',
          link: '',
          description: ''
        };

        if (line.includes(' – ')) {
          const parts = line.split(' – ');
          currentProj.name = parts[0].trim();
          currentProj.type = parts.slice(1).join(' – ').trim();
        } else if (line.includes(' - ')) {
          const parts = line.split(' - ');
          currentProj.name = parts[0].trim();
          currentProj.type = parts.slice(1).join(' - ').trim();
        } else {
          currentProj.name = line;
        }
      } else if (currentProj) {
        currentProj.description += (currentProj.description ? '\n' : '') + line.replace(/^[•-]\s*/, '');
      }
    });
    if (currentProj) result.projects.push(currentProj);
  }

  // Parse Skills
  if (sectionContent.skills.length > 0) {
    const rawSkillsStr = sectionContent.skills.join('\n').replace('Extracted Skills:', '').trim();
    const categoryMatches = [...rawSkillsStr.matchAll(/([A-Z][a-zA-Z &()]+):/g)];
    
    if (categoryMatches.length > 0) {
      for (let i = 0; i < categoryMatches.length; i++) {
        const match = categoryMatches[i];
        const category = match[1].trim();
        const startIdx = match.index + match[0].length;
        const endIdx = (i + 1 < categoryMatches.length) ? categoryMatches[i + 1].index : rawSkillsStr.length;
        
        let items = rawSkillsStr.substring(startIdx, endIdx).trim();
        items = items.replace(/,\s*$/, '');
        
        if (category && items) {
          result.skills.push({
             id: Date.now().toString() + Math.random().toString(),
             category: category,
             items: items
          });
        }
      }
    } else {
       result.skills.push({
           id: Date.now().toString() + Math.random().toString(),
           category: 'Core Skills',
           items: rawSkillsStr
       });
    }
  }

  return result;
};
