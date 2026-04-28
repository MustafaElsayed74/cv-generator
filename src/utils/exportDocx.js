import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const generateDocx = async (data) => {
  const { personalInfo, experience, projects, education, skills, sectionOrder = ['experience', 'projects', 'education', 'skills'] } = data;

  const children = [];

  const formatDates = (item) => {
    if (item.date && !item.startYear) return item.date;
    if (!item.startYear) return '';
    const getMonthStr = (m) => m ? m + '/' : '';
    const start = `${getMonthStr(item.startMonth)}${item.startYear}`;
    const end = item.isCurrent ? 'Present' : `${getMonthStr(item.endMonth)}${item.endYear}`;
    if (!item.endYear && !item.isCurrent) return start;
    return `${start} - ${end}`;
  };

  // Personal Info
  children.push(
    new Paragraph({
      text: personalInfo.fullName || 'Full Name',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 100,
      }
    })
  );

  const contactInfo = [];
  if (personalInfo.city && personalInfo.country) {
    contactInfo.push(`${personalInfo.city}, ${personalInfo.country}`);
  }
  if (personalInfo.email) contactInfo.push(personalInfo.email);
  if (personalInfo.phone) contactInfo.push(personalInfo.phone);
  if (personalInfo.linkedin) contactInfo.push(personalInfo.linkedin);
  if (personalInfo.portfolio) contactInfo.push(personalInfo.portfolio);

  if (contactInfo.length > 0) {
    const contactRuns = contactInfo.map((part, index) => {
      return new TextRun(index === 0 ? part : ` | ${part}`);
    });
    
    children.push(
      new Paragraph({
        children: contactRuns,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 200,
        }
      })
    );
  }

  const createSectionHeading = (title) => {
    return new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_2,
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: "single",
          size: 6,
        },
      },
      spacing: {
        before: 200,
        after: 100,
      }
    });
  };

  const renderers = {
    experience: () => {
      if (!experience || experience.length === 0) return;
      children.push(createSectionHeading("Experience"));
      experience.forEach(exp => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.position, bold: true }),
              new TextRun({ text: exp.company ? ` | ${exp.company}` : '' }),
              new TextRun({ text: `\t${formatDates(exp)}` }),
            ],
            tabStops: [
              {
                type: "right",
                position: 9500,
              },
            ],
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.location || '', italics: true }),
            ],
            spacing: { after: 100 }
          })
        );
        if (exp.description) {
          exp.description.split('\n').filter(line => line.trim() !== '').forEach(line => {
            children.push(
              new Paragraph({
                text: line,
                bullet: {
                  level: 0
                },
                spacing: {
                  after: 50,
                }
              })
            );
          });
        }
        children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      });
    },
    projects: () => {
      if (!projects || projects.length === 0) return;
      children.push(createSectionHeading("Projects"));
      projects.forEach(proj => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.name, bold: true }),
              new TextRun({ text: proj.type ? ` - ${proj.type}` : '' }),
              new TextRun({ text: proj.link ? ` | ${proj.link}` : '' }),
            ],
            spacing: { after: 100 }
          })
        );
        if (proj.description) {
          proj.description.split('\n').filter(line => line.trim() !== '').forEach(line => {
            children.push(
              new Paragraph({
                text: line,
                bullet: {
                  level: 0
                },
                spacing: {
                  after: 50,
                }
              })
            );
          });
        }
        children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      });
    },
    education: () => {
      if (!education || education.length === 0) return;
      children.push(createSectionHeading("Education"));
      education.forEach(edu => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true }),
              new TextRun({ text: edu.institution ? ` | ${edu.institution}` : '' }),
              new TextRun({ text: `\t${edu.location ? edu.location + ' | ' : ''}${formatDates(edu)}` }),
            ],
            tabStops: [
              {
                type: "right",
                position: 9500,
              },
            ],
            spacing: { after: 100 }
          })
        );
        children.push(new Paragraph({ text: "", spacing: { after: 50 } }));
      });
    },
    skills: () => {
      if (!skills || skills.length === 0) return;
      children.push(createSectionHeading("Skills"));
      skills.forEach(skill => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${skill.category}: `, bold: true }),
              new TextRun({ text: skill.items }),
            ],
            spacing: { after: 50 }
          })
        );
      });
    }
  };

  sectionOrder.forEach(section => {
    if (renderers[section]) renderers[section]();
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
          },
        },
        heading1: {
          run: {
            size: 48,
            bold: true,
            color: "000000",
          },
          paragraph: {
            spacing: {
              after: 120,
            },
          },
        },
        heading2: {
          run: {
            size: 28,
            bold: true,
            color: "2B579A",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = personalInfo.fullName ? `${personalInfo.fullName.replace(/\s+/g, '_')}_CV.docx` : 'CV.docx';
  saveAs(blob, fileName);
};
