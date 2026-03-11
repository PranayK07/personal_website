import { NextRequest } from 'next/server';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from 'docx';
import { internalErrorResponse, requireAdvisorAuth } from '@/lib/resume-advisor/api';
import { exportSchema } from '@/lib/resume-advisor/schemas';

function sectionHeading(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 60 },
  });
}

function rightAlignedRow(left: string, right: string, italic = false) {
  return new Paragraph({
    children: [
      new TextRun({ text: left, bold: !italic, italics: italic }),
      new TextRun({ text: '\t' }),
      new TextRun({ text: right }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { after: 60 },
  });
}

export async function POST(req: NextRequest) {
  const authError = requireAdvisorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { tailoredResume } = exportSchema.parse(body);

    const children: Paragraph[] = [];

    children.push(
      new Paragraph({
        text: tailoredResume.basics.name,
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.TITLE,
      }),
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun(`${tailoredResume.basics.location} | ${tailoredResume.basics.email}${tailoredResume.basics.phone ? ` | ${tailoredResume.basics.phone}` : ''}`),
        ],
      }),
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun(tailoredResume.basics.links.map((link) => `${link.label}: ${link.url}`).join(' | '))],
        spacing: { after: 120 },
      }),
    );

    children.push(sectionHeading('Education'));
    for (const edu of tailoredResume.education) {
      children.push(rightAlignedRow(edu.school, edu.location, false));
      children.push(rightAlignedRow(edu.degree, edu.graduationDate, true));

      if (edu.gpa) {
        children.push(new Paragraph({
          text: `- GPA: ${edu.gpa}`,
          spacing: { after: 40 },
        }));
      }

      if (edu.coursework && edu.coursework.length > 0) {
        children.push(new Paragraph({
          text: `- Relevant Coursework: ${edu.coursework.join(', ')}`,
          spacing: { after: 60 },
        }));
      }
    }

    children.push(sectionHeading('Experience'));
    for (const exp of tailoredResume.experience) {
      children.push(rightAlignedRow(exp.company, exp.location, false));
      children.push(rightAlignedRow(exp.title, exp.date, true));
      for (const bullet of exp.bullets) {
        children.push(new Paragraph({
          text: bullet.text,
          bullet: { level: 0 },
          spacing: { after: 40 },
        }));
      }
    }

    children.push(sectionHeading('Projects'));
    for (const project of tailoredResume.projects) {
      const projectLeft = `${project.title} | ${project.role}${project.company ? ` | ${project.company}` : ''}`;
      children.push(rightAlignedRow(projectLeft, project.date, false));
      for (const bullet of project.bullets) {
        children.push(new Paragraph({
          text: bullet.text,
          bullet: { level: 0 },
          spacing: { after: 40 },
        }));
      }
    }

    children.push(sectionHeading('Skills'));
    for (const group of tailoredResume.skills) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${group.label}: `, bold: true }),
          new TextRun(group.skills.join(', ')),
        ],
        spacing: { after: 40 },
      }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const bytes = Uint8Array.from(buffer);
    const docxBlob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    return new Response(docxBlob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="tailored-resume.docx"',
      },
    });
  } catch (error) {
    return internalErrorResponse(error);
  }
}
