import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const generateDocx = async (data) => {
  const { personalInfo, experience, projects, education, skills } = data;

  const children = [];

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

  const contactParts = [];
  if (personalInfo.city && personalInfo.country) {
    contactParts.push(`${personalInfo.city}, ${personalInfo.country}`);
  }
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);
  if (personalInfo.portfolio) contactParts.push(personalInfo.portfolio);

  if (contactParts.length > 0) {
    const contactInfo = contactParts.map((part, index) => {
      return new TextRun(index === 0 ? part : ` | ${part}`);
    });
    
    children.push(
      new Paragraph({
        children: contactInfo,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 200,
        }
      })
    );
  }

  // Section helper
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

  const createItemHeader = (title, subtitle, rightTitle, rightSubtitle) => {
    return [
      new Paragraph({
        children: [
          new TextRun({ text: title, bold: true }),
          new TextRun({ text: subtitle ? ` | ${subtitle}` : '' }),
          new TextRun({ text: `\t${rightTitle || ''}`, bold: true }), // Using tab to right align
        ],
        tabStops: [
          {
            type: "right",
            position: 9000, // Position for right alignment (approx right margin)
          },
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: rightSubtitle || '', italics: true }),
        ],
      })
    ];
  };

  // Experience
  if (experience && experience.length > 0) {
    children.push(createSectionHeading("Experience"));
    experience.forEach(exp => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true }),
            new TextRun({ text: exp.company ? ` | ${exp.company}` : '' }),
            new TextRun({ text: `\t${exp.date || ''}` }),
          ],
          tabStops: [
            {
              type: "right",
              position: 9500, // Adjust position as needed to reach the right margin
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
  }

  // Projects
  if (projects && projects.length > 0) {
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
  }

  // Education
  if (education && education.length > 0) {
    children.push(createSectionHeading("Education"));
    education.forEach(edu => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true }),
            new TextRun({ text: edu.institution ? ` | ${edu.institution}` : '' }),
            new TextRun({ text: `\t${edu.location || ''}` }),
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
  }

  // Skills
  if (skills && skills.length > 0) {
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

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22, // 11pt
          },
        },
        heading1: {
          run: {
            size: 48, // 24pt
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
            size: 28, // 14pt
            bold: true,
            color: "2B579A", // A nice professional blue
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
