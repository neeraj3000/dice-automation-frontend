import React from 'react';
import { Chip, CircularProgress } from '@mui/material';
import {
  CheckCircleRounded as CheckCircleIcon,
  SendRounded as SendIcon,
  WarningRounded as WarningIcon,
  ErrorOutlineRounded as ErrorIcon,
  BoltRounded as BoltIcon,
  SearchRounded as SearchIcon,
  AutoAwesomeRounded as SparklesIcon,
} from '@mui/icons-material';

export type BadgeStatus =
  | 'APPLIED'
  | 'READY'
  | 'REVIEW'
  | 'APPLYING'
  | 'FAILED'
  | 'DISCOVERED'
  | 'ANALYZED'
  | 'MATCHED'
  | string;

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'small',
  showIcon = true,
}) => {
  const normStatus = (status || '').toUpperCase();

  switch (normStatus) {
    case 'APPLIED':
      return (
        <Chip
          icon={showIcon ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} /> : undefined}
          label="Applied"
          size={size}
          sx={{
            bgcolor: '#ecfdf5',
            color: '#065f46',
            fontWeight: 700,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            border: '1px solid #a7f3d0',
            letterSpacing: '0.01em',
          }}
        />
      );

    case 'READY':
      return (
        <Chip
          icon={showIcon ? <SendIcon sx={{ fontSize: '13px !important', color: '#2563eb !important' }} /> : undefined}
          label="Ready to Submit"
          size={size}
          sx={{
            bgcolor: '#eff6ff',
            color: '#1e40af',
            fontWeight: 700,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            border: '1px solid #bfdbfe',
            letterSpacing: '0.01em',
          }}
        />
      );

    case 'REVIEW':
      return (
        <Chip
          icon={showIcon ? <WarningIcon sx={{ fontSize: '13px !important', color: '#d97706 !important' }} /> : undefined}
          label="Needs Review"
          size={size}
          sx={{
            bgcolor: '#fffbeb',
            color: '#92400e',
            fontWeight: 700,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            border: '1px solid #fde68a',
            letterSpacing: '0.01em',
          }}
        />
      );

    case 'APPLYING':
      return (
        <Chip
          icon={showIcon ? <CircularProgress size={12} sx={{ color: '#4f46e5' }} /> : undefined}
          label="Submitting..."
          size={size}
          sx={{
            bgcolor: '#eef2ff',
            color: '#3730a3',
            fontWeight: 600,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            border: '1px solid #c7d2fe',
          }}
        />
      );

    case 'FAILED':
      return (
        <Chip
          icon={showIcon ? <ErrorIcon sx={{ fontSize: '13px !important', color: '#e11d48 !important' }} /> : undefined}
          label="Failed"
          size={size}
          sx={{
            bgcolor: '#fef2f2',
            color: '#991b1b',
            fontWeight: 700,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            border: '1px solid #fecaca',
          }}
        />
      );

    case 'MATCHED':
      return (
        <Chip
          icon={showIcon ? <SparklesIcon sx={{ fontSize: '13px !important', color: '#6366f1 !important' }} /> : undefined}
          label="AI Matched"
          size={size}
          sx={{
            bgcolor: '#f5f3ff',
            color: '#5b21b6',
            fontWeight: 700,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            border: '1px solid #ddd6fe',
          }}
        />
      );

    case 'ANALYZED':
      return (
        <Chip
          icon={showIcon ? <BoltIcon sx={{ fontSize: '13px !important', color: '#0284c7 !important' }} /> : undefined}
          label="Analyzed"
          size={size}
          sx={{
            bgcolor: '#f0f9ff',
            color: '#0369a1',
            fontWeight: 600,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            border: '1px solid #bae6fd',
          }}
        />
      );

    case 'DISCOVERED':
      return (
        <Chip
          icon={showIcon ? <SearchIcon sx={{ fontSize: '13px !important', color: '#64748b !important' }} /> : undefined}
          label="Discovered"
          size={size}
          sx={{
            bgcolor: '#f8fafc',
            color: '#475569',
            fontWeight: 600,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            border: '1px solid #e2e8f0',
          }}
        />
      );

    default:
      return (
        <Chip
          label={status || 'Unknown'}
          size={size}
          sx={{
            fontWeight: 600,
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            bgcolor: '#f1f5f9',
            color: '#334155',
            border: '1px solid #e2e8f0',
          }}
        />
      );
  }
};
