import { jsPDF } from 'jspdf';
import { buildReportId, formatReportDate } from './reportPdfTheme';
import {
  buildReportMeta,
  drawReportHeader,
  drawReportMetaGrid,
  drawReportTable,
  drawSummaryBox,
  stampReportFooters,
} from './reportPdfLayout';

function escapeCsv(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildFileStem(programmeTitle, reportType) {
  const safeProgramme = (programmeTitle || 'programme').replace(/[^a-zA-Z0-9_-]+/g, '_');
  const safeReport = (reportType || 'report').replace(/[^a-zA-Z0-9_-]+/g, '_');
  return `${safeReport}_${safeProgramme}`;
}

function buildProgrammeDateLabel(startDate, endDate) {
  const start = formatReportDate(startDate);
  if (!endDate || endDate === startDate) return start;
  return `${start} – ${formatReportDate(endDate)}`;
}

export function exportReportCsv({ programmeTitle, reportType, headers, rows }) {
  const csvLines = [
    ['No.', ...headers].map(escapeCsv).join(','),
    ...rows.map((row, index) => [index + 1, ...row].map(escapeCsv).join(',')),
  ];
  const blob = new Blob([`\uFEFF${csvLines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${buildFileStem(programmeTitle, reportType)}.csv`);
}

export function exportReportPdf({
  programmeTitle,
  organizerClub,
  reportType,
  headers,
  rows,
  summaryLines = [],
  venue = '',
  startDate = '',
  endDate = '',
  generatedBy = 'CampusLink+ System',
  programmeId = null,
}) {
  const landscape = headers.some((h) => String(h).toLowerCase().includes('registration'))
    || headers.length > 5
    || rows.length > 18;
  const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  const meta = buildReportMeta({
    programmeTitle,
    organizerClub,
    reportType,
    venue,
    programmeDate: buildProgrammeDateLabel(startDate, endDate),
    generatedBy,
    reportId: buildReportId(programmeId),
  });

  let y = drawReportHeader(doc, margin, pageWidth, reportType);
  y = drawReportMetaGrid(doc, margin, pageWidth, meta, y);
  y = drawSummaryBox(doc, margin, pageWidth, summaryLines, y);

  if (rows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No records available for this report.', margin, y + 4);
    stampReportFooters(doc, margin, meta.generatedOn);
    doc.save(`${buildFileStem(programmeTitle, reportType)}.pdf`);
    return;
  }

  y = drawReportTable({
    doc,
    margin,
    pageWidth,
    headers,
    rows,
    startY: y,
    landscape,
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Participants: ${rows.length}`, margin, y + 2);

  stampReportFooters(doc, margin, meta.generatedOn);
  doc.save(`${buildFileStem(programmeTitle, reportType)}.pdf`);
}

export default exportReportPdf;
