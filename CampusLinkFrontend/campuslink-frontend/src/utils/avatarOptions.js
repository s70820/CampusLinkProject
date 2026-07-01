import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export const AVATAR_OPTIONS = [
  {
    id: 'scholar',
    icon: SchoolIcon,
    bg: '#2563eb',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    label: 'Scholar',
    description: 'Academic achiever',
  },
  {
    id: 'user',
    icon: PersonIcon,
    bg: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    label: 'User',
    description: 'Campus explorer',
  },
  {
    id: 'champion',
    icon: EmojiEventsIcon,
    bg: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    label: 'Champion',
    description: 'Merit leader',
  },
];

export const getAvatarOption = (index = 0) => AVATAR_OPTIONS[index] || AVATAR_OPTIONS[0];
