export function buildCertificatePreviewData(formData, overrides = {}) {
  const advisorSignatureUrl = formData.advisorSignaturePreview
    || (formData.advisorSignatureFile ? URL.createObjectURL(formData.advisorSignatureFile) : '');

  const today = new Date().toISOString().slice(0, 10);

  return {
    studentName: overrides.studentName || 'Ahmad bin Ali',
    matricNumber: overrides.matricNumber || 'S70482',
    programmeTitle: formData.title || 'Introduction to Robotics Workshop 2026',
    eventDate: formData.endDate || formData.startDate || today,
    venue: formData.venue || 'FSKM Programming Lab 1',
    organizerClub: formData.organizerClub || 'Robotics & AI Club',
    advisorName: formData.advisor?.advisorName || 'Dr. Siti Aminah binti Yusof',
    advisorSignatureUrl,
    certificateId: overrides.certificateId || 100001,
    issueDate: overrides.issueDate || today,
    certificateTemplate: overrides.certificateTemplate || formData.certificateTemplate,
    certificateOrientation: overrides.certificateOrientation || formData.certificateOrientation,
    fileName: 'Certificate_Preview.pdf',
  };
}
