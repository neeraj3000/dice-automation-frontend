import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Drawer,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  Description as DocxIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as SparklesIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Close as CloseIcon,
  SwapHoriz as ReplaceIcon,
} from '@mui/icons-material';
import { api } from '../services/api';
import type { Resume, ResumeUpdate } from '../types';
import { ResumeUploadModal } from '../components/ResumeUploadModal';

export const ResumesPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Selected Resume for Drawer
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState(0);

  // Drawer Form State
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editTargetRole, setEditTargetRole] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([]);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [reparsing, setReparsing] = useState(false);

  // Delete Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);

  // Replace File State
  const [replacingResumeId, setReplacingResumeId] = useState<string | null>(null);
  const [resumeToReplace, setResumeToReplace] = useState<Resume | null>(null);
  const replaceFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Snackbar Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getResumes(search, roleFilter);
      setResumes(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load resumes from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResumes();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  // Unique target roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const set = new Set<string>();
    resumes.forEach((r) => {
      if (r.target_role) set.add(r.target_role);
    });
    return Array.from(set);
  }, [resumes]);

  // Total unique skills
  const totalSkillsCount = useMemo(() => {
    const set = new Set<string>();
    resumes.forEach((r) => r.skills?.forEach((s) => set.add(s)));
    return set.size;
  }, [resumes]);

  const handleOpenDrawer = (resume: Resume) => {
    setSelectedResume(resume);
    setEditDisplayName(resume.display_name);
    setEditTargetRole(resume.target_role);
    setEditExperience(resume.experience_years);
    setEditSummary(resume.summary);
    setEditSkills(resume.skills || []);

    const cfList = resume.custom_fields
      ? Object.entries(resume.custom_fields).map(([k, v]) => ({ key: k, value: String(v) }))
      : [];
    setCustomFields(cfList);

    setDrawerTab(0);
    setDrawerOpen(true);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !editSkills.includes(trimmed)) {
      setEditSkills([...editSkills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddCustomField = () => {
    const k = newCustomKey.trim();
    const v = newCustomVal.trim();
    if (k && v) {
      setCustomFields([...customFields, { key: k, value: v }]);
      setNewCustomKey('');
      setNewCustomVal('');
    }
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, idx) => idx !== index));
  };

  const handleSaveResume = async () => {
    if (!selectedResume) return;
    setSaving(true);
    try {
      const customObj: Record<string, any> = {};
      customFields.forEach((cf) => {
        customObj[cf.key] = cf.value;
      });

      const updatePayload: ResumeUpdate = {
        display_name: editDisplayName,
        target_role: editTargetRole,
        experience_years: editExperience,
        summary: editSummary,
        skills: editSkills,
        custom_fields: customObj,
      };

      const updated = await api.updateResume(selectedResume.id, updatePayload);
      setSelectedResume(updated);
      setToastMessage('Resume metadata successfully updated!');
      fetchResumes();
    } catch (err: any) {
      setError('Failed to update resume.');
    } finally {
      setSaving(false);
    }
  };

  const handleReparse = async () => {
    if (!selectedResume) return;
    setReparsing(true);
    try {
      const reparsed = await api.reparseResume(selectedResume.id);
      setSelectedResume(reparsed);
      setEditDisplayName(reparsed.display_name);
      setEditTargetRole(reparsed.target_role);
      setEditExperience(reparsed.experience_years);
      setEditSummary(reparsed.summary);
      setEditSkills(reparsed.skills || []);
      setToastMessage('Resume re-analyzed with AI successfully!');
      fetchResumes();
    } catch (err: any) {
      setError('Failed to re-parse resume.');
    } finally {
      setReparsing(false);
    }
  };

  const handleDeleteClick = (resume: Resume) => {
    setResumeToDelete(resume);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    try {
      await api.deleteResume(resumeToDelete.id);
      if (selectedResume?.id === resumeToDelete.id) {
        setDrawerOpen(false);
      }
      setToastMessage(`Deleted ${resumeToDelete.display_name}`);
      fetchResumes();
    } catch (err: any) {
      setError('Failed to delete resume.');
    } finally {
      setDeleteConfirmOpen(false);
      setResumeToDelete(null);
    }
  };

  const handleTriggerReplace = (resume: Resume) => {
    setResumeToReplace(resume);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resumeToReplace) return;
    setReplacingResumeId(resumeToReplace.id);
    try {
      const updated = await api.replaceResume(resumeToReplace.id, file);
      setToastMessage(`Resume "${updated.display_name}" replaced & re-indexed successfully!`);
      if (selectedResume?.id === resumeToReplace.id) {
        setSelectedResume(updated);
        setEditDisplayName(updated.display_name);
        setEditTargetRole(updated.target_role);
        setEditExperience(updated.experience_years);
        setEditSummary(updated.summary);
        setEditSkills(updated.skills || []);
      }
      fetchResumes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to replace resume file.');
    } finally {
      setReplacingResumeId(null);
      setResumeToReplace(null);
    }
  };

  const copyRawText = () => {
    if (selectedResume) {
      navigator.clipboard.writeText(selectedResume.raw_text);
      setToastMessage('Raw text copied to clipboard!');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Banner & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Resume Library
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Upload and maintain your ~40 targeted resumes. Automatic text extraction and skill classification.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchResumes}
            disabled={loading}
            sx={{ borderColor: '#cbd5e1', color: '#475569' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadModalOpen(true)}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            Upload Resumes
          </Button>
        </Box>
      </Box>

      {/* Metrics Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <Card variant="outlined" sx={{ bgcolor: '#fff', borderRadius: 2 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              TOTAL RESUMES STORED
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5 }}>
              {resumes.length}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ bgcolor: '#fff', borderRadius: 2 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              TARGET ROLES COVERED
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', mt: 0.5 }}>
              {uniqueRoles.length}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ bgcolor: '#fff', borderRadius: 2 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              UNIQUE SKILLS EXTRACTED
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
              {totalSkillsCount}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search & Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search resumes by name, skill, keyword..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="role-select-label">Filter by Target Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={roleFilter}
              label="Filter by Target Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              {uniqueRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Resumes Table */}
      <TableContainer component={Paper} variant="outlined" className="table-responsive-container" sx={{ borderRadius: 3, bgcolor: '#fff', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Resume File</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Target Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Skills Extracted</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Experience</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Uploaded</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && resumes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Loading resumes...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : resumes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <DocxIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#64748b' }}>
                    No resumes in library yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload your ~40 specialized resumes in PDF or DOCX format to begin.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadModalOpen(true)}
                    sx={{ bgcolor: '#6366f1' }}
                  >
                    Upload Resumes Now
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              resumes.map((r) => {
                const isPdf = r.file_type.toLowerCase() === 'pdf';
                return (
                  <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {isPdf ? (
                          <PdfIcon sx={{ color: '#ef4444', fontSize: 26 }} />
                        ) : (
                          <DocxIcon sx={{ color: '#3b82f6', fontSize: 26 }} />
                        )}
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#1e293b',
                              cursor: 'pointer',
                              '&:hover': { color: '#6366f1', textDecoration: 'underline' },
                            }}
                            onClick={() => handleOpenDrawer(r)}
                          >
                            {r.display_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.file_name} ({(r.file_size / 1024).toFixed(1)} KB)
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.target_role || 'General'}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          bgcolor: '#e0e7ff',
                          color: '#4338ca',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 320 }}>
                        {r.skills?.slice(0, 4).map((s) => (
                          <Chip
                            key={s}
                            label={s}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.72rem', height: 22 }}
                          />
                        ))}
                        {r.skills && r.skills.length > 4 && (
                          <Chip
                            label={`+${r.skills.length - 4}`}
                            size="small"
                            sx={{ fontSize: '0.72rem', height: 22, bgcolor: '#f1f5f9' }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#475569">
                        {r.experience_years || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(r.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View & Edit Details">
                        <IconButton size="small" onClick={() => handleOpenDrawer(r)} sx={{ color: '#6366f1' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Replace File">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleTriggerReplace(r)}
                            disabled={replacingResumeId === r.id}
                            sx={{ color: '#0ea5e9' }}
                          >
                            {replacingResumeId === r.id ? <CircularProgress size={16} /> : <ReplaceIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete Resume">
                        <IconButton size="small" onClick={() => handleDeleteClick(r)} sx={{ color: '#ef4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Resume Detail & Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 620 }, p: 0, bgcolor: '#ffffff' },
          },
        }}
      >
        {selectedResume && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box sx={{ p: 2.5, bgcolor: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {selectedResume.file_type === 'pdf' ? (
                  <PdfIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                ) : (
                  <DocxIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                )}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {selectedResume.display_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {selectedResume.file_name} • {(selectedResume.file_size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Tabs */}
            <Tabs
              value={drawerTab}
              onChange={(_, v) => setDrawerTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Metadata & Schema" />
              <Tab label="Raw Extracted Text" />
              <Tab label="File & System Info" />
            </Tabs>

            {/* Tab 0: Metadata Form */}
            {drawerTab === 0 && (
              <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Parsed Metadata (Editable)
                  </Typography>
                  <Button
                    size="small"
                    startIcon={reparsing ? <CircularProgress size={14} /> : <SparklesIcon />}
                    onClick={handleReparse}
                    disabled={reparsing}
                    sx={{ color: '#6366f1' }}
                  >
                    {reparsing ? 'Analyzing...' : 'Re-parse with AI'}
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  label="Display Name"
                  size="small"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField
                    label="Target Role"
                    size="small"
                    value={editTargetRole}
                    onChange={(e) => setEditTargetRole(e.target.value)}
                  />
                  <TextField
                    label="Experience Years"
                    size="small"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                  />
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Professional Summary"
                  size="small"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  sx={{ mb: 3 }}
                />

                {/* Skills Management */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', mb: 1 }}>
                  Skills ({editSkills.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <TextField
                    size="small"
                    placeholder="Add skill..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" size="small" onClick={handleAddSkill}>
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', mb: 3 }}>
                  {editSkills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      onDelete={() => handleRemoveSkill(skill)}
                      sx={{ bgcolor: '#ffffff', border: '1px solid #cbd5e1' }}
                    />
                  ))}
                </Box>

                {/* MongoDB Flexible Custom Fields */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                  MongoDB Dynamic Custom Fields
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Add arbitrary metadata fields (e.g. security_clearance, hourly_rate, willing_to_travel).
                </Typography>

                {customFields.map((cf, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      disabled
                      value={cf.key}
                      sx={{ width: '40%' }}
                    />
                    <TextField
                      size="small"
                      value={cf.value}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[idx].value = e.target.value;
                        setCustomFields(updated);
                      }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton size="small" onClick={() => handleRemoveCustomField(idx)} sx={{ color: '#ef4444' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <TextField
                    size="small"
                    placeholder="Field name (e.g. clearance)"
                    value={newCustomKey}
                    onChange={(e) => setNewCustomKey(e.target.value)}
                    sx={{ width: '40%' }}
                  />
                  <TextField
                    size="small"
                    placeholder="Value (e.g. Secret)"
                    value={newCustomVal}
                    onChange={(e) => setNewCustomVal(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" size="small" onClick={handleAddCustomField} startIcon={<AddIcon />}>
                    Add
                  </Button>
                </Box>
              </Box>
            )}

            {/* Tab 1: Raw Text */}
            {drawerTab === 1 && (
              <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155' }}>
                    Extracted Text Content
                  </Typography>
                  <Button size="small" startIcon={<CopyIcon />} onClick={copyRawText}>
                    Copy
                  </Button>
                </Box>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '65vh',
                    overflowY: 'auto',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedResume.raw_text || 'No text extracted.'}
                </Paper>
              </Box>
            )}

            {/* Tab 2: File Info */}
            {drawerTab === 2 && (
              <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                <List dense>
                  <ListItem>
                    <ListItemText primary="MongoDB ID" secondary={selectedResume.id} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="File Name" secondary={selectedResume.file_name} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="File Type" secondary={selectedResume.file_type.toUpperCase()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Storage Path" secondary={selectedResume.file_path} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Uploaded At" secondary={new Date(selectedResume.created_at).toLocaleString()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Last Updated" secondary={new Date(selectedResume.updated_at).toLocaleString()} />
                  </ListItem>
                </List>
              </Box>
            )}

            {/* Drawer Footer Actions */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteClick(selectedResume)}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={replacingResumeId === selectedResume.id ? <CircularProgress size={16} /> : <ReplaceIcon />}
                  disabled={replacingResumeId === selectedResume.id}
                  onClick={() => handleTriggerReplace(selectedResume)}
                >
                  {replacingResumeId === selectedResume.id ? 'Replacing...' : 'Replace File'}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => setDrawerOpen(false)} color="inherit">
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveResume}
                  disabled={saving}
                  sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{resumeToDelete?.display_name}&quot;? This will permanently remove the document from MongoDB and delete the file from local storage.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Modal */}
      <ResumeUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          setToastMessage('Resumes uploaded and indexed successfully!');
          fetchResumes();
        }}
      />

      {/* Hidden File Input for Replace Resume */}
      <input
        type="file"
        ref={replaceFileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.docx"
        onChange={handleReplaceFileSelected}
      />

      {/* Notification Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
};
