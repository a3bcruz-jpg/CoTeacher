import { Document, Packer, Paragraph, TextRun } from "docx";

export async function documentAsDocx(title: string, content: string) {
  const paragraphs = content.split(/\r?\n/).map((line) => new Paragraph({ children: [new TextRun(line)] }));
  const document = new Document({ sections: [{ properties: {}, children: [new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 28 })] }), ...paragraphs] }] });
  return Packer.toBuffer(document);
}
