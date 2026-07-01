import React, { useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { downloadFileFromUrl } from '../../utils/fileDownload';

function DocumentCard({
  index,
  displayLabel,
  fileName,
  description,
  viewUrl,
  accent = 'primary',
  onView,
  onDownload,
  viewLoading = false,
  downloadLoading = false,
}) {
  const [localDownloadLoading, setLocalDownloadLoading] = useState(false);
  const borderColor = accent === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(37, 99, 235, 0.15)';
  const iconColor = accent === 'success' ? '#059669' : '#dc2626';

  const viewButtonProps = onView
    ? { onClick: onView, disabled: viewLoading }
    : {
      component: 'a',
      href: viewUrl,
      target: '_blank',
      rel: 'noopener noreferrer',
    };

  const downloadButtonProps = onDownload
    ? { onClick: onDownload, disabled: downloadLoading }
    : {
      onClick: async (event) => {
        event.preventDefault();
        if (!viewUrl || localDownloadLoading || downloadLoading) return;
        setLocalDownloadLoading(true);
        try {
          await downloadFileFromUrl(viewUrl, fileName || displayLabel || 'document');
        } finally {
          setLocalDownloadLoading(false);
        }
      },
      disabled: !viewUrl || downloadLoading || localDownloadLoading,
    };

  const isDownloadLoading = downloadLoading || localDownloadLoading;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        p: 1.75,
        borderRadius: 2,
        border: `1px solid ${borderColor}`,
        bgcolor: '#fff',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: accent === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(220, 38, 38, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {typeof index === 'number' ? (
          <Typography sx={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.95rem' }}>{index}</Typography>
        ) : (
          <PictureAsPdfIcon sx={{ color: iconColor }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
            {displayLabel}
          </Typography>
          {fileName && fileName !== displayLabel && (
            <Chip label={fileName} size="small" variant="outlined" sx={{ maxWidth: '100%' }} />
          )}
        </Stack>
        {description && (
          <Typography sx={{ color: '#64748b', fontSize: '0.82rem', mb: 1 }}>
            {description}
          </Typography>
        )}
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityOutlinedIcon />}
            {...viewButtonProps}
          >
            {viewLoading ? 'Opening...' : 'View'}
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<DownloadOutlinedIcon />}
            {...downloadButtonProps}
          >
            {isDownloadLoading ? 'Preparing...' : 'Download'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default DocumentCard;
