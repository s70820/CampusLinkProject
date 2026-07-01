import { jsPDF } from 'jspdf';
import { renderParticipationCertificate } from './participationCertificateLayouts';
import { normalizeCertificateOrientation } from '../constants/certificateTemplates';

export async function generateParticipationCertificatePdf(data, { download = true } = {}) {
  const orientation = normalizeCertificateOrientation(data.certificateOrientation);
  const isLandscape = orientation === 'LANDSCAPE';
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  await renderParticipationCertificate(doc, data);

  const safeName = (data.matricNumber || data.studentName || 'peserta').replace(/[^a-zA-Z0-9_-]/g, '_');
  const outputName = data.fileName || `Certificate_Participation_${safeName}.pdf`;

  if (download) {
    doc.save(outputName);
  }
  return { doc, fileName: outputName, blob: doc.output('blob') };
}

export async function getCertificatePdfBlobUrl(data) {
  const { blob } = await generateParticipationCertificatePdf(data, { download: false });
  return URL.createObjectURL(blob);
}

export default generateParticipationCertificatePdf;
