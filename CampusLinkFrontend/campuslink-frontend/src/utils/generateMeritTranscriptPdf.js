import { jsPDF } from 'jspdf';
import {
  REPORT_COLORS,
  REPORT_SUBTITLE,
  buildReportId,
  formatReportDateTime,
} from './reportPdfTheme';
import { drawReportMetaGrid, stampReportFooters } from './reportPdfLayout';

const MARGIN = 14;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_RESERVE = 24;

const COLUMNS = [
  { key: 'programmeTitle', label: 'Programme Title', width: 42, align: 'left' },
  { key: 'category', label: 'Category', width: 24, align: 'left' },
  { key: 'programmeLevel', label: 'Level', width: 18, align: 'center' },
  { key: 'startDate', label: 'Start', width: 19, align: 'center' },
  { key: 'endDate', label: 'End', width: 19, align: 'center' },
  { key: 'role', label: 'Role', width: 28, align: 'left' },
  { key: 'meritAwarded', label: 'Merit', width: 14, align: 'center' },
  { key: 'status', label: 'Status', width: 16, align: 'center' },
];

const TABLE_WIDTH = CONTENT_WIDTH;

function setColor(doc, rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function setFill(doc, rgb) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setDraw(doc, rgb) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function drawTranscriptHeader(doc) {
  let y = 14;

  setFill(doc, REPORT_COLORS.primary);
  doc.rect(PAGE_WIDTH - MARGIN - 18, y - 4, 18, 3, 'F');

  setDraw(doc, REPORT_COLORS.primary);
  doc.setLineWidth(0.9);
  doc.line(MARGIN, y + 10, PAGE_WIDTH - MARGIN, y + 10);
  y += 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setColor(doc, REPORT_COLORS.primary);
  doc.text('OFFICIAL CO-CURRICULAR MERIT TRANSCRIPT', MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  setColor(doc, REPORT_COLORS.primaryLight);
  doc.text(REPORT_SUBTITLE, MARGIN, y);
  y += 8;

  setDraw(doc, REPORT_COLORS.border);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  return y + 8;
}

function getCellValue(record, key) {
  if (key === 'meritAwarded') return String(record.meritAwarded);
  if (key === 'status') {
    const status = record.status || '';
    return status.toLowerCase() === 'completed' ? 'Completed' : status || '—';
  }
  return record[key] || '—';
}

function measureRowHeight(doc, record, rowPadding = 3) {
  let maxLines = 1;
  COLUMNS.forEach((col) => {
    const colWidth = (col.width / COLUMNS.reduce((s, c) => s + c.width, 0)) * TABLE_WIDTH;
    const text = getCellValue(record, col.key);
    const lines = doc.splitTextToSize(text, colWidth - 4);
    maxLines = Math.max(maxLines, lines.length);
  });
  return maxLines * 4 + rowPadding * 2;
}

function drawTableHeader(doc, y) {
  const headerH = 9;
  setFill(doc, REPORT_COLORS.primary);
  doc.rect(MARGIN, y, TABLE_WIDTH, headerH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let x = MARGIN;
  COLUMNS.forEach((col) => {
    const colWidth = (col.width / COLUMNS.reduce((s, c) => s + c.width, 0)) * TABLE_WIDTH;
    const textX = col.align === 'center' ? x + colWidth / 2 : x + 2.5;
    doc.text(col.label.toUpperCase(), textX, y + 6, { align: col.align === 'center' ? 'center' : 'left' });
    x += colWidth;
  });

  return y + headerH;
}

function drawTableRow(doc, record, y, rowIndex) {
  const rowH = measureRowHeight(doc, record);
  const fill = rowIndex % 2 === 0 ? REPORT_COLORS.rowAlt : REPORT_COLORS.white;
  setFill(doc, fill);
  setDraw(doc, REPORT_COLORS.border);
  doc.setLineWidth(0.15);
  doc.rect(MARGIN, y, TABLE_WIDTH, rowH, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(doc, REPORT_COLORS.text);

  let x = MARGIN;
  COLUMNS.forEach((col) => {
    const colWidth = (col.width / COLUMNS.reduce((s, c) => s + c.width, 0)) * TABLE_WIDTH;
    const text = getCellValue(record, col.key);
    const lines = doc.splitTextToSize(text, colWidth - 4);
    const textX = col.align === 'center' ? x + colWidth / 2 : x + 2.5;
    const startY = y + 3 + (rowH - lines.length * 4) / 2;
    lines.forEach((line, i) => {
      doc.text(line, textX, startY + i * 4, { align: col.align === 'center' ? 'center' : 'left' });
    });
    x += colWidth;
  });

  return y + rowH;
}

function drawSummarySection(doc, y, totals) {
  const boxH = 24;
  setFill(doc, REPORT_COLORS.rowAlt);
  setDraw(doc, REPORT_COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, TABLE_WIDTH, boxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  setColor(doc, REPORT_COLORS.primary);
  doc.text('MERIT SUMMARY', MARGIN + 4, y + 6);

  const items = [
    ['Total Merit', totals.total],
    ['Participant', totals.participant],
    ['Committee', totals.committee],
    ['Special Contribution', totals.special],
  ];

  const colW = TABLE_WIDTH / 4;
  items.forEach(([label, value], i) => {
    const cx = MARGIN + colW * i + colW / 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    setColor(doc, REPORT_COLORS.muted);
    doc.text(label, cx, y + 13, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setColor(doc, REPORT_COLORS.primary);
    doc.text(String(value), cx, y + 20, { align: 'center' });
  });

  return y + boxH + 6;
}

export function generateMeritTranscriptPdf({ user, records, totals }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedOn = formatReportDateTime(new Date());

  let y = drawTranscriptHeader(doc);
  y = drawReportMetaGrid(doc, MARGIN, PAGE_WIDTH, {
    programmeTitle: user.fullName || '—',
    organizerClub: user.faculty || '—',
    venue: 'Universiti Malaysia Terengganu',
    programmeDate: 'Co-Curricular Activities',
    reportId: buildReportId(),
    generatedOn,
    generatedBy: 'CampusLink+ System',
    reportTypeLabel: 'Merit Transcript',
  }, y);

  y += 4;
  y = drawTableHeader(doc, y);

  records.forEach((record, index) => {
    const rowH = measureRowHeight(doc, record);
    if (y + rowH > pageHeight - FOOTER_RESERVE) {
      doc.addPage();
      y = drawTableHeader(doc, 18);
    }
    y = drawTableRow(doc, record, y, index);
  });

  if (y + 36 > pageHeight - FOOTER_RESERVE) {
    doc.addPage();
    y = 18;
  }
  drawSummarySection(doc, y, totals);

  stampReportFooters(doc, MARGIN, generatedOn);

  const safeMatric = (user.matricNumber || 'student').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`CampusLink_Merit_Transcript_${safeMatric}.pdf`);
}

export default generateMeritTranscriptPdf;
