import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
} from '@mui/material';
import {
  CheckCircleRounded as CheckCircleIcon,
  RefreshRounded as RefreshIcon,
  SendRounded as SendIcon,
  HelpOutlineRounded as HelpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { ReviewItem } from '../types';

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReviewQueue();
      setItems(data);
    } catch {
      setError('Failed to fetch review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAnswerChange = (itemId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSubmitAnswer = async (itemId: string) => {
    const answer = answers[itemId];
    if (!answer || !answer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }
    setSubmittingId(itemId);
    try {
      await api.answerReviewQuestion(itemId, answer.trim());
      setToastMessage('Answer recorded! Application updated.');
      fetchQueue();
    } catch {
      setError('Failed to record answer.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Box sx={{ pb: 6, maxWidth: 960 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Human Review Queue
            </Typography>
            {items.length > 0 && (
              <Chip
                label={`${items.length} Pending`}
                size="small"
                sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, border: '1px solid #fde68a' }}
              />
            )}
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Whenever the Dice application wizard encounters an unmapped screener question, it pauses safely here for your input.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchQueue}
          disabled={loading}
          sx={{ borderColor: '#cbd5e1', color: '#334155', borderRadius: 2 }}
        >
          Refresh Queue
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={32} thickness={4} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Checking review queue...
          </Typography>
        </Box>
      ) : items.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3.5,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
            Review Queue is Clear
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mt: 0.75, mb: 3, lineHeight: 1.6 }}>
            No applications are currently paused waiting for human answers. All Dice applications are moving automatically.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/applications')}
            sx={{ bgcolor: '#6366f1', px: 2.5, py: 1 }}
          >
            View Applications
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {items.map((item) => {
            const currentAnswer = answers[item.id] || '';
            const isSubmitting = submittingId === item.id;
            return (
              <Card
                key={item.id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderLeft: '5px solid #f59e0b',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.06)',
                  bgcolor: '#ffffff',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label="Application Paused"
                        size="small"
                        sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, border: '1px solid #fde68a' }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {item.company}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        • {item.job_title}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', my: 2 }}>
                    <HelpIcon sx={{ color: '#f59e0b', mt: 0.25 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.4 }}>
                      {item.question_text}
                    </Typography>
                  </Box>

                  {item.options && item.options.length > 0 ? (
                    <RadioGroup
                      value={currentAnswer}
                      onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                      sx={{ mb: 2.5, pl: 1 }}
                    >
                      {item.options.map((opt) => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={<Radio size="small" sx={{ color: '#6366f1', '&.Mui-checked': { color: '#6366f1' } }} />}
                          label={<Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>{opt}</Typography>}
                        />
                      ))}
                    </RadioGroup>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type your answer here..."
                      value={currentAnswer}
                      onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                      sx={{ mb: 2.5 }}
                    />
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <SendIcon />}
                      disabled={isSubmitting || !currentAnswer.trim()}
                      onClick={() => handleSubmitAnswer(item.id)}
                      sx={{ bgcolor: '#6366f1', fontWeight: 700 }}
                    >
                      {isSubmitting ? 'Saving & Resuming...' : 'Submit Answer & Resume Application'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
};
