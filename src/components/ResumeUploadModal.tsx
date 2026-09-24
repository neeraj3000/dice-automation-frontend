import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocxIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { api } from '../services/api';

interface ResumeUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  open,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    setError(null);
    const valid = newFiles.filter((f) => {
      const ext = f.name.toLowerCase();
      return ext.endsWith('.pdf') || ext.endsWith('.docx');
    });

    if (valid.length < newFiles.length) {
      setError('Only .pdf and .docx resume files are supported.');
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await api.uploadResumes(selectedFiles, (p) => setProgress(p));
      setSelectedFiles([]);
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and parse resumes. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDialogClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      setError(null);
      setProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3.5 } } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, fontSize: '1.2rem' }}>
        <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: '#eef2ff', color: '#6366f1', display: 'flex' }}>
          <CloudUploadIcon sx={{ fontSize: 22 }} />
        </Box>
        Upload Candidate Resumes
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.5 }}>
          Upload PDF or DOCX resume variations. Text will be extracted immediately, skills parsed, and records indexed into MongoDB.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Paper
          variant="outlined"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            p: { xs: 3, sm: 4.5 },
            textAlign: 'center',
            cursor: 'pointer',
            borderStyle: 'dashed',
            borderWidth: '2px',
            borderColor: isDragOver ? '#6366f1' : '#cbd5e1',
            bgcolor: isDragOver ? '#eef2ff' : '#f8fafc',
            borderRadius: 3,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              borderColor: '#6366f1',
              bgcolor: '#f1f5f9',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.docx"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: isDragOver ? '#e0e7ff' : '#eef2ff',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              transition: 'all 0.2s ease',
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
            Click or drag & drop resumes here
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Supports batch upload of multiple files (up to 20MB each)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: '#fee2e2', color: '#991b1b', fontSize: '0.68rem', fontWeight: 700 }}>
              .PDF
            </Box>
            <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: '#dbeafe', color: '#1e40af', fontSize: '0.68rem', fontWeight: 700 }}>
              .DOCX
            </Box>
          </Box>
        </Paper>

        {selectedFiles.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
              Selected Files ({selectedFiles.length})
            </Typography>
            <List dense sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: '#fff', borderRadius: 1, border: '1px solid #e2e8f0' }}>
              {selectedFiles.map((file, idx) => {
                const isPdf = file.name.toLowerCase().endsWith('.pdf');
                return (
                  <ListItem
                    key={idx}
                    secondaryAction={
                      !uploading && (
                        <IconButton edge="end" size="small" onClick={() => removeFile(idx)}>
                          <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {isPdf ? <PdfIcon sx={{ color: '#ef4444' }} /> : <DocxIcon sx={{ color: '#3b82f6' }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      slotProps={{
                        primary: {
                          sx: { fontSize: '0.85rem', fontWeight: 500 },
                        },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {uploading && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Extracting text and parsing metadata...
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 2, height: 6 }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleDialogClose} disabled={uploading} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          {uploading ? 'Processing...' : `Upload ${selectedFiles.length} Resume${selectedFiles.length > 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
