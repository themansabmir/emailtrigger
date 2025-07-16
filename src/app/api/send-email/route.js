import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import pug from 'pug';
import path from 'path';
import multer from 'multer';
import xlsx from 'xlsx';

const upload = multer({ dest: '/tmp' });

const renderTemplate = (templatePath, options) => {
  const absolutePath = path.resolve(process.cwd(), templatePath);
  return pug.renderFile(absolutePath, options);
};

export async function POST(request) {
  const data = await request.formData();
  const file = data.get('file');

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' });
  }

  const workbook = xlsx.read(await file.arrayBuffer());
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const emails = xlsx.utils.sheet_to_json(sheet, { header: 1 }).flat();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const sendEmail = async (email) => {
    const html = renderTemplate('src/app/api/send-email/template.pug');
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Beautiful Websites, Software, and Mobile Apps for Your Business',
      html,
    });
  };

  for (let i = 0; i < emails.length; i++) {
    await sendEmail(emails[i]);
    if ((i + 1) % 3 === 0 && i < emails.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }

  return NextResponse.json({ success: true });
}
