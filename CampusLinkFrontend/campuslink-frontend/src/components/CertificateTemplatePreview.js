import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { CERTIFICATE_TEMPLATES } from '../constants/certificateTemplates';

const NAVY = '#062E59';
const GOLD = '#D4AF37';
const MUTED = '#64748b';

function CornerTriangles({ isPrestige }) {
  if (isPrestige) return null;
  return (
    <>
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '22%', height: '20%',
        bgcolor: NAVY, clipPath: 'polygon(0 0, 100% 0, 0 100%)',
      }}
      />
      <Box sx={{
        position: 'absolute', top: 0, right: 0, width: '22%', height: '20%',
        bgcolor: NAVY, clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
      }}
      />
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, width: '22%', height: '20%',
        bgcolor: NAVY, clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
      }}
      />
      <Box sx={{
        position: 'absolute', bottom: 0, right: 0, width: '22%', height: '20%',
        bgcolor: NAVY, clipPath: 'polygon(100% 100%, 0 100%, 100% 0)',
      }}
      />
    </>
  );
}

function FiligreeCorners() {
  return (
    <>
      {[
        { top: 10, left: 10 },
        { top: 10, right: 10 },
        { bottom: 10, left: 10 },
        { bottom: 10, right: 10 },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute', width: 18, height: 18, ...pos,
            borderTop: pos.top !== undefined ? `2px solid ${GOLD}` : undefined,
            borderBottom: pos.bottom !== undefined ? `2px solid ${GOLD}` : undefined,
            borderLeft: pos.left !== undefined ? `2px solid ${GOLD}` : undefined,
            borderRight: pos.right !== undefined ? `2px solid ${GOLD}` : undefined,
          }}
        />
      ))}
    </>
  );
}

function CertificateFrontMock({ templateId, orientation, selected }) {
  const isPortrait = orientation === 'PORTRAIT';
  const isPrestige = templateId === 'LAUREL_AWARD';
  const aspect = isPortrait ? '210 / 297' : '297 / 210';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        aspectRatio: aspect,
        borderRadius: 1.5,
        overflow: 'hidden',
        border: selected ? '3px solid #2563eb' : '1px solid rgba(148,163,184,0.5)',
        bgcolor: '#fff',
        boxShadow: selected
          ? '0 8px 28px rgba(37,99,235,0.18)'
          : '0 4px 16px rgba(15,23,42,0.08)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: '2.5%', border: `1.5px solid ${GOLD}` }} />
      <Box sx={{ position: 'absolute', inset: '3.8%', border: `0.5px solid ${GOLD}`, opacity: 0.7 }} />
      <CornerTriangles isPrestige={isPrestige} />
      {isPrestige && <FiligreeCorners />}

      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        px: isPortrait ? '10%' : '12%',
        py: isPortrait ? '8%' : '6%',
        textAlign: 'center',
      }}
      >
        <Typography sx={{ fontSize: isPortrait ? 7 : 6.5, color: MUTED, letterSpacing: 0.5, mb: 0.5 }}>
          UNIVERSITI MALAYSIA TERENGGANU
        </Typography>
        <Typography sx={{
          fontSize: isPortrait ? 13 : 11, fontWeight: 800, color: NAVY,
          fontFamily: 'Georgia, serif', lineHeight: 1.1,
        }}
        >
          SIJIL PENYERTAAN
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, my: 0.6, width: '80%' }}>
          <Box sx={{ flex: 1, height: 1, bgcolor: GOLD }} />
          <Typography sx={{ fontSize: 6, color: GOLD, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
            CERTIFICATE OF PARTICIPATION
          </Typography>
          <Box sx={{ flex: 1, height: 1, bgcolor: GOLD }} />
        </Box>
        <Typography sx={{ fontSize: 7, color: MUTED, mb: 0.8 }}>
          Dengan ini disahkan bahawa
        </Typography>
        <Typography sx={{
          fontSize: isPortrait ? 16 : 13, fontWeight: 700, color: GOLD,
          fontFamily: 'Georgia, serif', lineHeight: 1.15, mb: 0.3,
        }}
        >
          Nama Peserta
        </Typography>
        <Box sx={{ width: '55%', height: 1, bgcolor: GOLD, mb: 0.8 }} />
        <Typography sx={{ fontSize: 7, color: MUTED, mb: 0.5 }}>telah menyertai</Typography>
        <Typography sx={{
          fontSize: isPortrait ? 9 : 8, fontWeight: 700, color: NAVY,
          fontFamily: 'Georgia, serif', lineHeight: 1.2, mb: 1.2,
        }}
        >
          Program Kokurikulum
        </Typography>

        <Box sx={{ width: '100%', borderTop: `1px solid ${GOLD}`, pt: 0.8, mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            {['Tarikh', 'Lokasi', 'Anjuran'].map((label) => (
              <Box key={label} sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 5.5, color: MUTED }}>{label}</Typography>
                <Typography sx={{ fontSize: 6, fontWeight: 700, color: NAVY }}>—</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 1, width: '40%' }}>
          <Box sx={{ height: 1, bgcolor: GOLD, mb: 0.4 }} />
          <Typography sx={{ fontSize: 6.5, fontWeight: 700, color: NAVY }}>Penasihat Kelab</Typography>
          <Typography sx={{ fontSize: 5.5, color: MUTED }}>Club Advisor</Typography>
        </Box>
      </Box>
    </Box>
  );
}

const CertificateTemplatePreview = ({ templateId, selected = false, orientation = 'PORTRAIT' }) => {
  const template = CERTIFICATE_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return null;

  const normalizedOrientation = orientation === 'LANDSCAPE' ? 'LANDSCAPE' : 'PORTRAIT';

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Chip
          size="small"
          label={normalizedOrientation === 'PORTRAIT' ? 'Portrait preview' : 'Landscape preview'}
          sx={{ fontSize: '0.72rem', height: 22 }}
        />
      </Box>
      <CertificateFrontMock
        templateId={templateId}
        orientation={normalizedOrientation}
        selected={selected}
      />
    </Box>
  );
};

export default CertificateTemplatePreview;
