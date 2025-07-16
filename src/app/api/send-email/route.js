export const runtime = "nodejs";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import pug from "pug";
import path from "path";
const xlsx = require("xlsx");
const renderTemplate = (templateFileName, data) => {
  const templatePath = path.resolve(__dirname, templateFileName); // this is the fix
  const compiledFunction = pug.compileFile(templatePath);
  return compiledFunction(data);
};

export async function POST(request) {
  const data = await request.formData();
  console.log(data);
  const file = data.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({
      success: false,
      message: "Invalid file uploaded",
    });
  }

  const workbook = xlsx.read(await file.arrayBuffer());
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(rows);
  const emails = rows
    .map((row) => row[0])
    .filter((email) => typeof email === "string" && email.includes("@"));

  console.log(emails);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const results = [];

  const sendEmail = async (email) => {
    const html = renderTemplate("template.pug", { email }); // just the file name now
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "AI-Driven Tech That Moves Your Business Forward",
      html,
    });
  };

  for (let i = 0; i < emails.length; i++) {
    try {
      await sendEmail(emails[i]);
      results.push({ email: emails[i], status: "sent" });
    } catch (err) {
      results.push({ email: emails[i], status: "failed", error: err.message });
    }

    if ((i + 1) % 3 === 0 && i < emails.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }

  return NextResponse.json({ success: true, results });
}
