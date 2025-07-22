import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePDFSlip = async ({ token, date, time, location, user }) => {
  const fileName = `${token}.pdf`; // File name should be unique, like MF-1234.pdf
  const filePath = path.join('/tmp', fileName); // Saving in /tmp directory for serverless

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  // PDF content
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

  return filePath; // Return the file path in /tmp
};




// import PDFDocument from 'pdfkit';
// import fs from 'fs';

// export const generatePDFSlip = ({ token, date, time, location, user }, filePath) => {
//   const doc = new PDFDocument();
//   const outputFilePath = `/tmp/${filePath}`; 
//   doc.pipe(fs.createWriteStream(outputFilePath));

//   doc.fontSize(24).text("Microfinance Loan Slip", { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(16).text(`Token No: ${token}`);
//   doc.text(`Date: ${date}`);
//   doc.text(`Time: ${time}`);
//   doc.text(`Office: ${location}`);
//   doc.moveDown();
//   doc.text(`Name: ${user.name}`);
//   doc.text(`CNIC: ${user.cnic}`);
//   doc.text(`Email: ${user.email}`);

//   doc.end();

//   return outputFilePath;
// };


