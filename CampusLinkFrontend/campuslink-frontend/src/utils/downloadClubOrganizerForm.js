import { jsPDF } from 'jspdf';

function drawFieldBox(doc, x, y, width, height, label, value = '') {
  doc.rect(x, y, width, height);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(label, x + 2, y + 5);
  if (value) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(value, width - 4);
    doc.text(lines, x + 2, y + 10);
  }
}

export function downloadClubOrganizerForm(options = {}) {
  const {
    fullName = '',
    matricNumber = '',
    clubName = '',
    position = '',
    advisorName = '',
    advisorPosition = '',
    advisorDate = '',
    filename = 'UMT_Club_Organizer_Approval_Form.pdf',
  } = options;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 18;
  const width = 210 - margin * 2;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITI MALAYSIA TERENGGANU', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('BORANG PENGESAHAN PENASIHAT KELAB', 105, 28, { align: 'center' });
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, 32, margin + width, 32);

  let y = 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('A. MAKLUMAT PEMOHON', margin, y);
  y += 6;

  const rowHeight = 12;
  const fieldWidth = width / 2 - 4;

  drawFieldBox(doc, margin, y, fieldWidth, rowHeight, 'Nama Pemohon:', fullName);
  drawFieldBox(doc, margin + fieldWidth + 4, y, fieldWidth, rowHeight, 'No. Matrik:', matricNumber);
  y += rowHeight + 4;

  drawFieldBox(doc, margin, y, fieldWidth, rowHeight, 'Nama Kelab:', clubName);
  drawFieldBox(doc, margin + fieldWidth + 4, y, fieldWidth, rowHeight, 'Jawatan dalam Kelab:', position || 'Setiausaha / Secretary');
  y += rowHeight + 6;

  doc.setFont('helvetica', 'bold');
  doc.text('B. PENGESAHAN PENASIHAT KELAB', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  drawFieldBox(doc, margin, y, fieldWidth, rowHeight, 'Nama Penasihat:', advisorName);
  drawFieldBox(doc, margin + fieldWidth + 4, y, fieldWidth, rowHeight, 'Jawatan Penasihat:', advisorPosition);
  y += rowHeight + 4;
  doc.rect(margin, y, width, rowHeight * 1.4);
  doc.text('Tandatangan Penasihat:', margin + 2, y + 6);
  if (advisorName) {
    doc.setFont('helvetica', 'bold');
    doc.text(advisorName, margin + 2, y + 11);
    doc.setFont('helvetica', 'normal');
  }
  doc.text('Tarikh:', margin + width - 35, y + 6);
  if (advisorDate) {
    doc.text(advisorDate, margin + width - 35, y + 11);
  }
  y += rowHeight * 1.4 + 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Nota:', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  const note = 'Dokumen ini mesti dilengkapkan oleh pelajar dan penasihat kelab. Penandatanganan oleh penasihat kelab mengesahkan bahawa pelajar adalah wakil rasmi kelab UMT. Kelulusan HEPA dilakukan melalui sistem CampusLink+.';
  doc.text(doc.splitTextToSize(note, width), margin, y);
  doc.save(filename);
}

export function downloadHepaOrganizerApprovalForm(request) {
  const safeClub = (request?.clubName || 'Club').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
  downloadClubOrganizerForm({
    fullName: request?.requesterName || '',
    matricNumber: request?.requesterMatric || '',
    clubName: request?.clubName || '',
    position: 'Setiausaha / Secretary',
    filename: `HEPA_Club_Approval_${safeClub || 'Form'}.pdf`,
  });
}

export default downloadClubOrganizerForm;
