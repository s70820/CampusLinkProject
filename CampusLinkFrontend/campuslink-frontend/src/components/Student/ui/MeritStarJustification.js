import React from 'react';
import {
  Box,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { MERIT_STAR_ROWS } from '../../../utils/meritStars';

const MeritStarJustification = () => (
  <Box sx={{ color: '#0f172a' }}>
    <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', mb: 0.5 }}>
      Star Rating Justification
    </Typography>
    <Typography sx={{ color: '#475569', fontSize: '0.85rem', mb: 2, fontWeight: 500 }}>
      Guide for merit star assessment based on total points and committee/organizer contribution.
    </Typography>

    <TableContainer sx={{ borderRadius: '10px', border: '1px solid rgba(37,99,235,0.12)' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(239,246,255,0.9)' }}>
            <TableCell sx={{ fontWeight: 700, color: '#1e3a8a !important' }}>Number of Stars</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#1e3a8a !important' }}>Merit Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {MERIT_STAR_ROWS.map((row, index) => (
            <TableRow key={`${row.stars}-${index}`} hover>
              <TableCell sx={{ color: '#0f172a !important', fontWeight: row.stars === 0 ? 700 : 600 }}>
                {row.stars === 0 ? (
                  row.label
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={row.stars} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#2563eb' } }} />
                    <Typography component="span" sx={{ fontSize: '0.85rem', color: '#0f172a !important', fontWeight: 600 }}>
                      {row.label}
                    </Typography>
                  </Box>
                )}
              </TableCell>
              <TableCell sx={{ color: '#334155 !important', fontSize: '0.85rem', fontWeight: 500 }}>
                {row.range}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Box sx={{ mt: 2, p: 1.5, borderRadius: '10px', bgcolor: 'rgba(239,246,255,0.7)', border: '1px solid rgba(37,99,235,0.1)' }}>
      <Typography sx={{ fontSize: '0.85rem', color: '#334155 !important', lineHeight: 1.6, fontWeight: 500 }}>
        From 2024 onward, to receive 5 stars a student must reach 1,000 merit points with at least
        300 points from committee or organizer (AJK/Penganjur) contributions. If points exceed 1,000
        but come only from participation as an attendee, the maximum rating is 4 stars.
      </Typography>
    </Box>
  </Box>
);

export default MeritStarJustification;
