import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getCertificateTemplateLabel, normalizeCertificateOrientation } from '../constants/certificateTemplates';
import { buildCertificatePreviewData } from '../utils/certificatePreviewUtils';
import generateParticipationCertificatePdf from '../utils/generateParticipationCertificatePdf';

const ZOOM_STEPS = [50, 75, 100, 125, 150, 175, 200];

const CertificatePreviewDialog = ({
  open,
  onClose,
  formData,
  templateId,
  orientation,
  onOrientationChange,
}) => {
  const [previewOrientation, setPreviewOrientation] = useState(
    normalizeCertificateOrientation(orientation),
  );
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (open) {
      setPreviewOrientation(normalizeCertificateOrientation(orientation));
      setZoom(100);
    }
  }, [open, orientation]);

  const isLandscape = previewOrientation === 'LANDSCAPE';

  const handleOrientationChange = (value) => {
    setPreviewOrientation(value);
    setZoom(100);
    onOrientationChange?.(value);
  };

  const changeZoom = (delta) => {
    setZoom((current) => {
      const idx = ZOOM_STEPS.indexOf(current);
      const base = idx === -1 ? ZOOM_STEPS.findIndex((z) => z >= current) : idx;
      const next = Math.max(0, Math.min(ZOOM_STEPS.length - 1, base + delta));
      return ZOOM_STEPS[next];
    });
  };

  useEffect(() => {
    if (!open) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
      setError('');
      return undefined;
    }

    let cancelled = false;
    let objectUrl = '';

    const renderPreview = async () => {
      setLoading(true);
      setError('');
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
      try {
        const previewData = buildCertificatePreviewData(formData, {
          certificateTemplate: templateId,
          certificateOrientation: previewOrientation,
        });
        const { blob } = await generateParticipationCertificatePdf(previewData, { download: false });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch {
        if (!cancelled) setError('Unable to generate certificate preview. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    renderPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, formData, templateId, previewOrientation]);

  const handleDownload = async () => {
    const previewData = buildCertificatePreviewData(formData, {
      certificateTemplate: templateId,
      certificateOrientation: previewOrientation,
    });
    await generateParticipationCertificatePdf(previewData, { download: true });
  };

  const baseWidth = isLandscape ? 900 : 520;
  const baseHeight = isLandscape ? 520 : 680;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Certificate Preview — {getCertificateTemplateLabel(templateId)}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 2 }}>
          Sample data is used for preview. Use zoom controls or your browser PDF toolbar to inspect details.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <RadioGroup
            row
            value={previewOrientation}
            onChange={(e) => handleOrientationChange(e.target.value)}
          >
            <FormControlLabel value="PORTRAIT" control={<Radio />} label="Portrait" />
            <FormControlLabel value="LANDSCAPE" control={<Radio />} label="Landscape" />
          </RadioGroup>

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: { sm: 'auto' } }}>
            <IconButton size="small" onClick={() => changeZoom(-1)} disabled={zoom <= ZOOM_STEPS[0] || loading}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ minWidth: 48, textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
              {zoom}%
            </Typography>
            <IconButton size="small" onClick={() => changeZoom(1)} disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1] || loading}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setZoom(100)} disabled={loading} title="Reset zoom">
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          sx={{
            minHeight: isLandscape ? 360 : 500,
            maxHeight: '70vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            bgcolor: '#e2e8f0',
            borderRadius: 2,
            border: '1px solid rgba(148,163,184,0.35)',
            p: 2,
            overflow: 'auto',
          }}
        >
          {loading && <CircularProgress sx={{ m: 'auto' }} />}
          {!loading && error && (
            <Typography color="error" sx={{ m: 'auto' }}>{error}</Typography>
          )}
          {!loading && !error && pdfUrl && (
            <Box
              sx={{
                width: baseWidth * (zoom / 100),
                height: baseHeight * (zoom / 100),
                flexShrink: 0,
                boxShadow: '0 12px 32px rgba(15,23,42,0.15)',
                bgcolor: '#fff',
              }}
            >
              <Box
                component="iframe"
                key={`${templateId}-${previewOrientation}-${pdfUrl}`}
                title="Certificate preview"
                src={pdfUrl}
                sx={{
                  display: 'block',
                  width: baseWidth,
                  height: baseHeight,
                  border: 'none',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />}>Close</Button>
        <Button variant="contained" onClick={handleDownload} startIcon={<DownloadIcon />} disabled={loading}>
          Download Preview PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CertificatePreviewDialog;
