import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generatePDFSlip = ({ token, date, time, location, user }, filePath) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(24).text("Microfinance Loan Slip", { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Token No: ${token}`);
  doc.text(`Date: ${date}`);
  doc.text(`Time: ${time}`);
  doc.text(`Office: ${location}`);
  doc.moveDown();
  doc.text(`Name: ${user.name}`);
  doc.text(`CNIC: ${user.cnic}`);
  doc.text(`Email: ${user.email}`);

  doc.end();
};
