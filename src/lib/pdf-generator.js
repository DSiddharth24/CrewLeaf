import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import CertificatePDF from '@/components/CertificatePDF';

export async function generateCertificate(pdfData, filePath) {
  const CertificateDocument = () => <CertificatePDF data={pdfData} />;
  await ReactPDF.renderToFile(<CertificateDocument />, filePath);
}
