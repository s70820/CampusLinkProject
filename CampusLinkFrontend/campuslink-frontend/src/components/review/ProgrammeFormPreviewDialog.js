import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { buildProgrammeFormFileName } from '../../utils/programmeFormConstants';
import { downloadProgrammeFormPreview, generateProgrammeFormPreview } from '../../utils/programmeFormPreview';

const ZOOM_STEPS = [50, 75, 100, 125, 150, 175, 200];

function ProgrammeFormPreviewDialog({
  open,
  onClose,
  fullDetails,
  organizerName = '',
  programmeTitle = '',
}) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);

  const pageTitle = fileName.replace(/\.pdf$/i, '') || buildProgrammeFormFileName(programmeTitle).replace(/\.pdf$/i, '');

  useEffect(() => {
    if (open) setZoom(100);
  }, [open]);

  useEffect(() => {
    if (!open) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
      setFileName('');
      setError('');
      return undefined;
    }

    if (!fullDetails) return undefined;

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
        const result = await generateProgrammeFormPreview(fullDetails, organizerName);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(result.blob);
        setFileName(result.fileName);
        setPdfUrl(objectUrl);
      } catch {
        if (!cancelled) setError('Unable to generate programme form preview. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    renderPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, fullDetails, organizerName]);

  const changeZoom = (delta) => {
    setZoom((current) => {
      const idx = ZOOM_STEPS.indexOf(current);
      const base = idx === -1 ? ZOOM_STEPS.findIndex((z) => z >= current) : idx;
      const next = Math.max(0, Math.min(ZOOM_STEPS.length - 1, base + delta));
      return ZOOM_STEPS[next];
    });
  };

  const handleDownload = async () => {
    if (!fullDetails) return;
    await downloadProgrammeFormPreview(fullDetails, organizerName);
  };

  const baseWidth = 520;
  const baseHeight = 680;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {pageTitle}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 2 }}>
          Advisor-signed programme form generated from the organizer submission.
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
          <IconButton size="small" onClick={() => changeZoom(-1)} disabled={zoom <= ZOOM_STEPS[0] || loading}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ minWidth: 48, textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
            {zoom}%
          </Typography>
          <IconButton
            size="small"
            onClick={() => changeZoom(1)}
            disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1] || loading}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setZoom(100)} disabled={loading} title="Reset zoom">
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box
          sx={{
            minHeight: 500,
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
                key={pdfUrl}
                title={pageTitle}
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
        <Button variant="contained" onClick={handleDownload} startIcon={<DownloadIcon />} disabled={loading || !fullDetails}>
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProgrammeFormPreviewDialog;
