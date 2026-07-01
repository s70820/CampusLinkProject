import React from 'react';
import { Avatar } from '@mui/material';
import { getAvatarOption } from '../../../utils/avatarOptions';

const UserAvatar = ({ avatarIndex = 0, size = 40, sx = {} }) => {
  const option = getAvatarOption(avatarIndex);
  const Icon = option.icon;
  const iconSize = Math.round(size * 0.52);

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        background: option.gradient,
        boxShadow: `0 4px 14px ${option.bg}44`,
        fontWeight: 700,
        ...sx,
      }}
    >
      <Icon sx={{ fontSize: iconSize }} />
    </Avatar>
  );
};

export default UserAvatar;
