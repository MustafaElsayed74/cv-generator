/**
 * ATS Compliance Scorer
 * Analyzes parsed CV data against industry-standard ATS rules
 * and returns a detailed score report with actionable feedback.
 */

const ACTION_VERBS = [
  'achieved', 'administered', 'analyzed', 'architected', 'automated',
  'built', 'championed', 'collaborated', 'configured', 'consolidated',
  'contributed', 'created', 'decreased', 'delivered', 'deployed',
  'designed', 'developed', 'directed', 'documented', 'drove',
  'enabled', 'engineered', 'enhanced', 'established', 'evaluated',
  'executed', 'expanded', 'facilitated', 'generated', 'grew',
  'headed', 'identified', 'implemented', 'improved', 'increased',
  'initiated', 'integrated', 'introduced', 'launched', 'led',
  'leveraged', 'maintained', 'managed', 'mentored', 'migrated',
  'modernized', 'monitored', 'negotiated', 'operated', 'optimized',
  'orchestrated', 'organized', 'overhauled', 'partnered', 'performed',
  'pioneered', 'planned', 'presented', 'produced', 'programmed',
  'proposed', 'provided', 'published', 'reduced', 'refactored',
  'refined', 'resolved', 'restructured', 'revamped', 'reviewed',
  'scaled', 'secured', 'simplified', 'spearheaded', 'standardized',
  'streamlined', 'strengthened', 'supervised', 'supported', 'surpassed',
  'tested', 'trained', 'transformed', 'troubleshot', 'unified',
  'upgraded', 'utilized', 'validated', 'wrote', 'applied', 'added'
];

/**
 * Strip HTML tags from a string to get raw text for analysis.
 */
function stripHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Extract individual bullet points from an HTML description.
 * Handles both <li> tags from rich text and plain text split by newlines.
 */
function extractBullets(description) {
  if (!description) return [];
  
  const bullets = [];
  
  // Try to extract <li> content from HTML
  const liMatches = description.match(/<li[^>]*>(.*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    liMatches.forEach(li => {
      const text = stripHtml(li).trim();
      if (text) bullets.push(text);
    });
  }
  
  // Also extract <p> content
  const pMatches = description.match(/<p[^>]*>(.*?)<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    pMatches.forEach(p => {
      const text = stripHtml(p).trim();
      if (text && !bullets.includes(text)) bullets.push(text);
    });
  }
  
  // Fallback: split plain text by newlines
  if (bullets.length === 0) {
    const plainText = stripHtml(description);
    plainText.split('\n').forEach(line => {
      const trimmed = line.replace(/^[•\-]\s*/, '').trim();
      if (trimmed) bullets.push(trimmed);
    });
  }
  
  return bullets;
}

/**
 * Main scoring function.
 * Returns an object: { score, maxScore, percentage, checks }
 * Each check: { id, label, passed, severity, detail }
 */
export function scoreATS(cvData) {
  const checks = [];
  const { personalInfo, experience, projects, education, skills } = cvData;

  // ──────────── CONTACT INFORMATION ────────────
  checks.push({
    id: 'contact-name',
    category: 'Contact Information',
    label: 'Full name is present',
    passed: !!(personalInfo?.fullName && personalInfo.fullName.trim().length > 1),
    severity: 'critical',
    detail: personalInfo?.fullName ? null : 'Your name is the first thing ATS looks for. Add your full name.'
  });

  checks.push({
    id: 'contact-email',
    category: 'Contact Information',
    label: 'Professional email address',
    passed: !!(personalInfo?.email && personalInfo.email.includes('@')),
    severity: 'critical',
    detail: personalInfo?.email ? null : 'Add a professional email address (e.g. name@gmail.com).'
  });

  checks.push({
    id: 'contact-phone',
    category: 'Contact Information',
    label: 'Phone number provided',
    passed: !!(personalInfo?.phone && personalInfo.phone.trim().length >= 7),
    severity: 'high',
    detail: personalInfo?.phone ? null : 'Add a phone number so recruiters can reach you.'
  });

  checks.push({
    id: 'contact-location',
    category: 'Contact Information',
    label: 'City & Country included',
    passed: !!(personalInfo?.city && personalInfo?.country),
    severity: 'medium',
    detail: (!personalInfo?.city || !personalInfo?.country) ? 'Include your City and Country for location-based filtering.' : null
  });

  checks.push({
    id: 'contact-linkedin',
    category: 'Contact Information',
    label: 'LinkedIn profile URL',
    passed: !!(personalInfo?.linkedin && personalInfo.linkedin.trim().length > 3),
    severity: 'low',
    detail: personalInfo?.linkedin ? null : 'Adding your LinkedIn URL strengthens your profile.'
  });

  // ──────────── WORK EXPERIENCE ────────────
  const hasExperience = experience && experience.length > 0;

  checks.push({
    id: 'exp-present',
    category: 'Work Experience',
    label: 'Work experience section exists',
    passed: hasExperience,
    severity: 'critical',
    detail: hasExperience ? null : 'ATS strongly expects a Work Experience section.'
  });

  if (hasExperience) {
    // Check that all roles have dates
    const rolesWithDates = experience.filter(exp => 
      (exp.startYear || exp.date) && exp.position
    );
    checks.push({
      id: 'exp-dates',
      category: 'Work Experience',
      label: 'All roles have dates',
      passed: rolesWithDates.length === experience.length,
      severity: 'high',
      detail: rolesWithDates.length < experience.length 
        ? `${experience.length - rolesWithDates.length} role(s) are missing dates. ATS filters by employment timeline.`
        : null
    });

    // Check for bullet points (not paragraphs)
    let totalBullets = 0;
    experience.forEach(exp => {
      const bullets = extractBullets(exp.description);
      totalBullets += bullets.length;
    });
    checks.push({
      id: 'exp-bullets',
      category: 'Work Experience',
      label: 'Uses bullet points (not paragraphs)',
      passed: totalBullets >= experience.length,
      severity: 'high',
      detail: totalBullets < experience.length
        ? 'Each role should have 3–6 bullet points. Avoid long paragraphs.'
        : null
    });

    // Check for action verbs
    let bulletsWithActionVerbs = 0;
    let totalBulletCount = 0;
    experience.forEach(exp => {
      const bullets = extractBullets(exp.description);
      bullets.forEach(bullet => {
        totalBulletCount++;
        const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
        if (ACTION_VERBS.includes(firstWord)) {
          bulletsWithActionVerbs++;
        }
      });
    });
    const actionVerbRatio = totalBulletCount > 0 ? bulletsWithActionVerbs / totalBulletCount : 0;
    checks.push({
      id: 'exp-action-verbs',
      category: 'Work Experience',
      label: 'Bullets start with strong action verbs',
      passed: actionVerbRatio >= 0.5,
      severity: 'medium',
      detail: actionVerbRatio < 0.5
        ? `Only ${Math.round(actionVerbRatio * 100)}% of bullets start with action verbs. Use words like "Developed", "Implemented", "Led", "Optimized".`
        : `${Math.round(actionVerbRatio * 100)}% of bullets use action verbs — great!`
    });

    // Check for quantified achievements
    let quantifiedBullets = 0;
    experience.forEach(exp => {
      const bullets = extractBullets(exp.description);
      bullets.forEach(bullet => {
        // Look for numbers, percentages, dollar signs, time frames
        if (/\d+/.test(bullet) || /%/.test(bullet) || /\$/.test(bullet)) {
          quantifiedBullets++;
        }
      });
    });
    checks.push({
      id: 'exp-quantified',
      category: 'Work Experience',
      label: 'Quantified achievements (numbers, %, $)',
      passed: quantifiedBullets >= 3,
      severity: 'high',
      detail: quantifiedBullets < 3
        ? `Only ${quantifiedBullets} bullet(s) contain metrics. Aim for at least 3 quantified achievements (e.g., "Reduced load time by 40%").`
        : `${quantifiedBullets} quantified achievements found — excellent!`
    });

    // Check for job title presence
    const rolesWithTitles = experience.filter(exp => exp.position && exp.position.trim().length > 2);
    checks.push({
      id: 'exp-titles',
      category: 'Work Experience',
      label: 'All roles have job titles',
      passed: rolesWithTitles.length === experience.length,
      severity: 'critical',
      detail: rolesWithTitles.length < experience.length
        ? `${experience.length - rolesWithTitles.length} role(s) missing a job title. This is critical for ATS keyword matching.`
        : null
    });
  }

  // ──────────── EDUCATION ────────────
  const hasEducation = education && education.length > 0;
  checks.push({
    id: 'edu-present',
    category: 'Education',
    label: 'Education section exists',
    passed: hasEducation,
    severity: 'high',
    detail: hasEducation ? null : 'Most ATS systems expect an Education section.'
  });

  if (hasEducation) {
    const eduWithDegree = education.filter(edu => edu.degree && edu.degree.trim().length > 2);
    checks.push({
      id: 'edu-degree',
      category: 'Education',
      label: 'Degree names are specified',
      passed: eduWithDegree.length === education.length,
      severity: 'medium',
      detail: eduWithDegree.length < education.length
        ? 'Include degree names (e.g., "B.Sc. Computer Science").'
        : null
    });
  }

  // ──────────── SKILLS ────────────
  const hasSkills = skills && skills.length > 0;
  checks.push({
    id: 'skills-present',
    category: 'Skills',
    label: 'Skills / Technical Skills section exists',
    passed: hasSkills,
    severity: 'high',
    detail: hasSkills ? null : 'Add a Skills section with your tools, languages, and frameworks.'
  });

  if (hasSkills) {
    const totalSkillItems = skills.reduce((acc, cat) => {
      const items = cat.items ? cat.items.split(/[,|;]/).filter(s => s.trim()) : [];
      return acc + items.length;
    }, 0);
    checks.push({
      id: 'skills-count',
      category: 'Skills',
      label: 'Sufficient skills listed (8+)',
      passed: totalSkillItems >= 8,
      severity: 'medium',
      detail: totalSkillItems < 8
        ? `Only ${totalSkillItems} skills found. Aim for 8+ relevant hard skills for better ATS keyword matching.`
        : `${totalSkillItems} skills listed — solid coverage.`
    });
  }

  // ──────────── FORMAT & STRUCTURE ────────────
  checks.push({
    id: 'format-single-col',
    category: 'Format',
    label: 'Single-column layout (ATS-safe)',
    passed: true, // Our builder enforces this
    severity: 'info',
    detail: 'Your builder uses a single-column layout — fully ATS-compliant.'
  });

  checks.push({
    id: 'format-no-images',
    category: 'Format',
    label: 'No images, icons, or graphics',
    passed: true, // Our builder doesn't allow these
    severity: 'info',
    detail: 'No images or icons detected — ATS can parse all content.'
  });

  checks.push({
    id: 'format-text-selectable',
    category: 'Format',
    label: 'Output is text-selectable (not scanned)',
    passed: true,
    severity: 'info',
    detail: 'DOCX/PDF exports from this builder are always text-based.'
  });

  // ──────────── SCORING ────────────
  const severityWeights = { critical: 3, high: 2, medium: 1, low: 0.5, info: 0 };
  let earnedPoints = 0;
  let maxPoints = 0;

  checks.forEach(check => {
    const weight = severityWeights[check.severity] || 1;
    maxPoints += weight;
    if (check.passed) earnedPoints += weight;
  });

  const percentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

  return {
    score: earnedPoints,
    maxScore: maxPoints,
    percentage,
    checks,
    grade: percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F'
  };
}
