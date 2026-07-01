import { fileUrl } from '../services/registrationApi';
import { normalizeCertificateOrientation, normalizeCertificateTemplate } from '../constants/certificateTemplates';

const NAVY = [6, 46, 89];
const GOLD = [212, 175, 55];
const GOLD_DARK = [184, 148, 42];
const MUTED = [100, 116, 136];
const LIGHT = [230, 234, 240];
const WHITE = [255, 255, 255];

const FRAME_OUTER = 5;
const FRAME_INNER = 8;
const CONTENT_PAD = 12;

const LEGACY_TEMPLATE_MAP = {
  CLASSIC_GOLD: 'GEOMETRIC_MODERN',
  MINIMAL_GEO: 'GEOMETRIC_MODERN',
  FORMAL_FRAME: 'GEOMETRIC_MODERN',
  ELEGANT_BORDER: 'GEOMETRIC_MODERN',
  ELEGANT_RIBBON: 'LAUREL_AWARD',
  MODERN_SEAL: 'GEOMETRIC_MODERN',
  DIAGONAL_CONTEMPORARY: 'LAUREL_AWARD',
};

export function getPageSize(orientation) {
  const landscape = normalizeCertificateOrientation(orientation) === 'LANDSCAPE';
  const w = landscape ? 297 : 210;
  const h = landscape ? 210 : 297;
  return {
    w,
    h,
    cx: w / 2,
    cy: h / 2,
    landscape,
    orientation: landscape ? 'landscape' : 'portrait',
    frameOuter: FRAME_OUTER,
    frameInner: FRAME_INNER,
    contentLeft: FRAME_INNER + CONTENT_PAD,
    contentRight: w - FRAME_INNER - CONTENT_PAD,
    contentTop: FRAME_INNER + CONTENT_PAD,
    contentBottom: h - FRAME_INNER - CONTENT_PAD,
  };
}

function resolveTemplateId(value) {
  const normalized = normalizeCertificateTemplate(value);
  return LEGACY_TEMPLATE_MAP[normalized] || normalized;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCertificateNo(id) {
  if (id == null || id === '') return '';
  return `No. ${String(id).padStart(6, '0')}`;
}

export async function loadImageDataUrl(url) {
  if (!url) return null;
  if (url.startsWith('blob:')) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const response = await fetch(fileUrl(url));
  if (!response.ok) throw new Error('Unable to load advisor signature.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fillTriangle(doc, x1, y1, x2, y2, x3, y3) {
  doc.lines([[x2 - x1, y2 - y1], [x3 - x2, y3 - y2], [x1 - x3, y1 - y3]], x1, y1, [1, 1], 'F', true);
}

function drawWrappedCenter(doc, text, x, y, maxWidth, fontSize, options = {}) {
  const { font = 'helvetica', fontStyle = 'normal', color = NAVY, lineHeight = 5.5 } = options;
  doc.setFont(font, fontStyle);
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(String(text || ''), maxWidth);
  doc.text(lines, x, y, { align: 'center' });
  return y + lines.length * lineHeight;
}

function drawFullPageFrame(doc, w, h) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.65);
  doc.rect(FRAME_OUTER, FRAME_OUTER, w - FRAME_OUTER * 2, h - FRAME_OUTER * 2);
  doc.setLineWidth(0.22);
  doc.rect(FRAME_INNER, FRAME_INNER, w - FRAME_INNER * 2, h - FRAME_INNER * 2);
}

function drawPageCornerTriangle(doc, w, h, landscape) {
  const size = landscape ? 48 : 52;
  drawCornerTriangle(doc, 0, 0, 1, 1, size);
  drawCornerTriangle(doc, w, 0, -1, 1, size);
  drawCornerTriangle(doc, 0, h, 1, -1, size);
  drawCornerTriangle(doc, w, h, -1, -1, size);
}

function drawCornerTriangle(doc, x, y, flipX, flipY, size) {
  doc.setFillColor(...NAVY);
  if (flipX > 0 && flipY > 0) fillTriangle(doc, x, y, x + size, y, x, y + size);
  else if (flipX < 0 && flipY > 0) fillTriangle(doc, x, y, x - size, y, x, y + size);
  else if (flipX > 0 && flipY < 0) fillTriangle(doc, x, y, x, y - size, x + size, y);
  else fillTriangle(doc, x, y, x - size, y, x, y - size);

  doc.setFillColor(...GOLD);
  const o = 9;
  if (flipX > 0 && flipY > 0) fillTriangle(doc, x + o, y + o, x + size - 6, y + o, x + o, y + size - 6);
  else if (flipX < 0 && flipY > 0) fillTriangle(doc, x - o, y + o, x - size + 6, y + o, x - o, y + size - 6);
  else if (flipX > 0 && flipY < 0) fillTriangle(doc, x + o, y - o, x + o, y - size + 6, x + size - 6, y - o);
  else fillTriangle(doc, x - o, y - o, x - o, y - size + 6, x - size + 6, y - o);
}

function drawCornerBracket(doc, x, y, flipX, flipY, len = 18) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.45);
  doc.line(x, y + len * flipY, x, y);
  doc.line(x, y, x + len * flipX, y);
}

function drawFiligreeCorner(doc, x, y, flipX = 1, flipY = 1) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(x, y, x + 14 * flipX, y + 4 * flipY);
  doc.line(x, y, x + 4 * flipX, y + 14 * flipY);
  doc.circle(x + 7 * flipX, y + 7 * flipY, 0.9, 'S');
}

function drawGoldSubtitle(doc, cx, y, lineWidth) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.32);
  doc.line(cx - lineWidth / 2, y, cx - 42, y);
  doc.line(cx + 42, y, cx + lineWidth / 2, y);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD_DARK);
  doc.text('CERTIFICATE OF PARTICIPATION', cx, y + 3.2, { align: 'center' });
}

function drawDetailIcon(doc, type, x, y) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.25);
  if (type === 'date') {
    doc.rect(x - 3, y - 2, 6, 5);
    doc.line(x - 3, y, x + 3, y);
  } else if (type === 'location') {
    doc.setFillColor(...GOLD);
    doc.circle(x, y - 1, 1.4, 'F');
    fillTriangle(doc, x, y + 2.5, x - 1.8, y - 0.5, x + 1.8, y - 0.5);
  } else {
    doc.setFillColor(...GOLD);
    doc.circle(x - 1.8, y - 0.5, 1.1, 'F');
    doc.circle(x + 1.8, y - 0.5, 1.1, 'F');
  }
}

function getLayout(page) {
  const { w, h, landscape, cx, contentTop, contentBottom } = page;
  const maxWidth = w - (FRAME_INNER + CONTENT_PAD) * 2;
  const zone = contentBottom - contentTop;

  if (landscape) {
    const top = contentTop + 4;
    return {
      cx,
      maxWidth,
      umtY: top + 2,
      titleY: top + 12,
      subtitleY: top + 20,
      introY: top + 30,
      nameY: top + 42,
      participateY: top + 58,
      programmeY: top + 66,
      detailsY: top + 82,
      sigY: contentBottom - 18,
      metaLeftY: contentBottom - 4,
      footerY: h - FRAME_INNER - 3,
    };
  }

  const top = contentTop + 6;
  const step = zone / 11;
  return {
    cx,
    maxWidth,
    umtY: top,
    titleY: top + step * 1.1,
    subtitleY: top + step * 2.1,
    introY: top + step * 3.2,
    nameY: top + step * 4.5,
    participateY: top + step * 6.2,
    programmeY: top + step * 7.2,
    detailsY: top + step * 8.5,
    sigY: contentBottom - 22,
    metaLeftY: contentBottom - 6,
    footerY: h - FRAME_INNER - 3,
  };
}

function drawDetailsRow(doc, page, date, location, organizer) {
  const { w, landscape } = page;
  const L = getLayout(page);
  const y = L.detailsY;
  const colWidth = landscape ? 72 : 54;
  const left = FRAME_INNER + CONTENT_PAD;
  const right = w - FRAME_INNER - CONTENT_PAD;
  const span = right - left;
  const cols = [
    { x: left + span * 0.17, label: 'Tarikh', value: date, type: 'date' },
    { x: left + span * 0.5, label: 'Lokasi', value: location, type: 'location' },
    { x: left + span * 0.83, label: 'Anjuran', value: organizer, type: 'org' },
  ];

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.22);
  doc.line(left, y - 5, right, y - 5);

  cols.forEach(({ x, label, value, type }) => {
    drawDetailIcon(doc, type, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...MUTED);
    doc.text(label, x, y + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(landscape ? 7 : 7.5);
    doc.setTextColor(...NAVY);
    const lines = doc.splitTextToSize(String(value || '—'), colWidth);
    doc.text(lines, x, y + 10, { align: 'center' });
  });
}

function shortenSignatureLabel(name) {
  if (!name || name === 'Penasihat Kelab') return '';
  const trimmed = name
    .replace(/^(Dr\.|Prof\. Dr\.|Prof\.|Pn\.|Encik\.|Puan\.)\s*/i, '')
    .replace(/\s+binti\s+/i, ' ')
    .replace(/\s+bin\s+/i, ' ')
    .trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}. ${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
  }
  return trimmed;
}

async function drawAdvisorSignature(doc, cx, sigY, advisorName, advisorSignatureUrl, landscape) {
  let drewSignature = false;
  if (advisorSignatureUrl) {
    try {
      const imageData = await loadImageDataUrl(advisorSignatureUrl);
      if (imageData) {
        doc.addImage(imageData, 'PNG', cx - 30, sigY - 16, 60, 14);
        drewSignature = true;
      }
    } catch {
      // Optional signature image.
    }
  }
  if (!drewSignature && advisorName && advisorName !== 'Penasihat Kelab') {
    const sigLabel = shortenSignatureLabel(advisorName);
    doc.setFont('times', 'italic');
    doc.setFontSize(landscape ? 13 : 14);
    doc.setTextColor(...NAVY);
    doc.text(sigLabel, cx, sigY - 4, { align: 'center' });
  }
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.38);
  doc.line(cx - 36, sigY, cx + 36, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(landscape ? 8 : 8.5);
  doc.setTextColor(...NAVY);
  doc.text(advisorName || 'Penasihat Kelab', cx, sigY + 5.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(landscape ? 6.8 : 7.2);
  doc.setTextColor(...MUTED);
  doc.text('Penasihat Kelab', cx, sigY + 11, { align: 'center' });
}

async function drawCertificateContent(doc, data, page) {
  const L = getLayout(page);
  const recipientName = data.studentName || data.recipientName || 'Nama Peserta';
  const programmeTitle = data.programmeTitle || 'Program Kokurikulum';
  const programmeDate = formatDate(data.eventDate || data.programmeDate);
  const programmeLocation = data.venue || data.programmeLocation || '—';
  const organizerName = data.organizerClub || data.organizerName || '—';
  const advisorName = data.advisorName || 'Penasihat Kelab';
  const certificateNo = formatCertificateNo(data.certificateId);
  const issueDate = formatDate(data.issueDate || new Date().toISOString().slice(0, 10));
  const { landscape, w } = page;

  if (certificateNo) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(certificateNo, w - FRAME_INNER - 4, FRAME_INNER + 5, { align: 'right' });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(landscape ? 6.5 : 7);
  doc.setTextColor(...MUTED);
  doc.text('UNIVERSITI MALAYSIA TERENGGANU', L.cx, L.umtY, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(landscape ? 19 : 23);
  doc.setTextColor(...NAVY);
  doc.text('SIJIL PENYERTAAN', L.cx, L.titleY, { align: 'center' });

  drawGoldSubtitle(doc, L.cx, L.subtitleY, landscape ? 120 : 100);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(landscape ? 7.5 : 8.5);
  doc.setTextColor(...MUTED);
  doc.text('Dengan ini disahkan bahawa', L.cx, L.introY, { align: 'center' });

  const nameSize = landscape ? 21 : 25;
  doc.setFont('times', 'bold');
  doc.setFontSize(nameSize);
  doc.setTextColor(...GOLD_DARK);
  const nameEnd = drawWrappedCenter(doc, recipientName, L.cx, L.nameY, L.maxWidth, nameSize, {
    font: 'times', fontStyle: 'bold', color: GOLD_DARK, lineHeight: landscape ? 9 : 11,
  });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.28);
  const underlineW = Math.min(L.maxWidth * 0.88, landscape ? 110 : 130);
  doc.line(L.cx - underlineW / 2, nameEnd - 1, L.cx + underlineW / 2, nameEnd - 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(landscape ? 7.5 : 8.5);
  doc.setTextColor(...MUTED);
  doc.text('telah menyertai', L.cx, L.participateY, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(landscape ? 11 : 12.5);
  doc.setTextColor(...NAVY);
  drawWrappedCenter(doc, programmeTitle, L.cx, L.programmeY, L.maxWidth, landscape ? 11 : 12.5, {
    font: 'times', fontStyle: 'bold', color: NAVY, lineHeight: 5.8,
  });

  drawDetailsRow(doc, page, programmeDate, programmeLocation, organizerName);
  await drawAdvisorSignature(doc, L.cx, L.sigY, advisorName, data.advisorSignatureUrl, landscape);

  const metaX = FRAME_INNER + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...MUTED);
  doc.text('Tarikh Dikeluarkan', metaX, L.metaLeftY - 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...NAVY);
  doc.text(issueDate, metaX, L.metaLeftY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(...MUTED);
  doc.text('CampusLink+ · Universiti Malaysia Terengganu', L.cx, L.footerY, { align: 'center' });
}

async function renderGeometricModern(doc, data, page) {
  const { w, h, landscape } = page;

  doc.setFillColor(...WHITE);
  doc.rect(0, 0, w, h, 'F');
  drawPageCornerTriangle(doc, w, h, landscape);
  drawFullPageFrame(doc, w, h);
  const b = FRAME_INNER + 2;
  drawCornerBracket(doc, b, b, 1, 1, landscape ? 14 : 16);
  drawCornerBracket(doc, w - b, b, -1, 1, landscape ? 14 : 16);
  drawCornerBracket(doc, b, h - b, 1, -1, landscape ? 14 : 16);
  drawCornerBracket(doc, w - b, h - b, -1, -1, landscape ? 14 : 16);
  await drawCertificateContent(doc, data, page);
}

async function renderLaurelAward(doc, data, page) {
  const { w, h } = page;
  const b = FRAME_INNER + 3;

  doc.setFillColor(...WHITE);
  doc.rect(0, 0, w, h, 'F');
  drawFullPageFrame(doc, w, h);
  drawFiligreeCorner(doc, b, b);
  drawFiligreeCorner(doc, w - b, b, -1, 1);
  drawFiligreeCorner(doc, b, h - b, 1, -1);
  drawFiligreeCorner(doc, w - b, h - b, -1, -1);
  drawCornerBracket(doc, b, b, 1, 1, 14);
  drawCornerBracket(doc, w - b, b, -1, 1, 14);
  drawCornerBracket(doc, b, h - b, 1, -1, 14);
  drawCornerBracket(doc, w - b, h - b, -1, -1, 14);

  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.18);
  const left = FRAME_INNER + CONTENT_PAD;
  const right = w - FRAME_INNER - CONTENT_PAD;
  doc.line(left, h * 0.38, right, h * 0.38);

  await drawCertificateContent(doc, data, page);
}

const TEMPLATE_RENDERERS = {
  GEOMETRIC_MODERN: renderGeometricModern,
  LAUREL_AWARD: renderLaurelAward,
};

export async function renderParticipationCertificate(doc, data) {
  const templateId = resolveTemplateId(data.certificateTemplate);
  const page = getPageSize(data.certificateOrientation);
  const renderer = TEMPLATE_RENDERERS[templateId] || renderGeometricModern;
  await renderer(doc, data, page);
}
