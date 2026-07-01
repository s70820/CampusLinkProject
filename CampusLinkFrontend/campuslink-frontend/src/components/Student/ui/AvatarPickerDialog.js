import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import { AVATAR_OPTIONS } from '../../../utils/avatarOptions';
import UserAvatar from './UserAvatar';

const AvatarPickerDialog = ({ open, onClose, currentIndex = 0, onSave }) => {
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);

  useEffect(() => {
    if (open) setSelectedIndex(currentIndex);
  }, [open, currentIndex]);

  const handleSave = () => {
    onSave(selectedIndex);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #f5f3ff 100%)',
          px: 3,
          pt: 3,
          pb: 4,
          position: 'relative',
          borderBottom: '1px solid rgba(37,99,235,0.12)',
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255,255,255,0.8)',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PaletteOutlinedIcon sx={{ color: '#2563eb', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
            Choose Your Avatar
          </Typography>
        </Box>
        <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mb: 3 }}>
          Pick a profile style that represents you across CampusLink+
        </Typography>

        {/* Live preview */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              p: 0.75,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.25)',
            }}
          >
            <Box
              sx={{
                p: 0.5,
                borderRadius: '50%',
                bgcolor: '#fff',
              }}
            >
              <UserAvatar avatarIndex={selectedIndex} size={88} />
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
            {AVATAR_OPTIONS[selectedIndex]?.label}
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>
            {AVATAR_OPTIONS[selectedIndex]?.description}
          </Typography>
        </Box>
      </Box>

      {/* Options */}
      <Box sx={{ px: 3, py: 3 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.8rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            mb: 2,
          }}
        >
          Available styles
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {AVATAR_OPTIONS.map((option, index) => {
            const isSelected = selectedIndex === index;
            const OptionIcon = option.icon;
            return (
              <Box
                key={option.id}
                onClick={() => setSelectedIndex(index)}
                sx={{
                  position: 'relative',
                  p: 2,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: isSelected ? '2px solid #2563eb' : '1px solid rgba(15,23,42,0.08)',
                  bgcolor: isSelected ? '#eff6ff' : '#fff',
                  boxShadow: isSelected
                    ? '0 8px 24px rgba(37,99,235,0.18)'
                    : '0 2px 8px rgba(15,23,42,0.04)',
                  transition: 'all 0.22s ease',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  '&:hover': {
                    borderColor: '#93c5fd',
                    boxShadow: '0 8px 20px rgba(37,99,235,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {isSelected && (
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: 20,
                      color: '#2563eb',
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: option.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.25,
                    boxShadow: `0 4px 16px ${option.bg}33`,
                  }}
                >
                  <OptionIcon sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                  {option.label}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.25 }}>
                  {option.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid rgba(15,23,42,0.06)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.5,
          bgcolor: '#f8fafc',
        }}
      >
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ fontWeight: 700, px: 3 }}>
          Apply Avatar
        </Button>
      </Box>
    </Dialog>
  );
};

export default AvatarPickerDialog;
