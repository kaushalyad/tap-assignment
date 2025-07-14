import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Chip, IconButton, Tooltip } from "@mui/material";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function formatDuration(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

function SessionSummaryModal({ open, onClose, run }) {
  if (!run) return null;
  const summary = `🏃‍♂️ Distance: ${(run.distance / 1000).toFixed(2)} km\n⏱️ Time: ${formatDuration(run.elapsed)}\n🏅 Points: ${run.points}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Run Summary</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" mt={1}>
          <Chip icon={<DirectionsRunIcon />} label={`Distance: ${(run.distance / 1000).toFixed(2)} km`} color="primary" size="medium" />
          <Chip icon={<AccessTimeIcon />} label={`Time: ${formatDuration(run.elapsed)}`} color="info" size="medium" />
          <Chip icon={<EmojiEventsIcon />} label={`Points: ${run.points}`} color="success" size="medium" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Tooltip title="Copy summary to clipboard">
          <IconButton onClick={handleCopy} color="primary">
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        <Button onClick={onClose} variant="contained" color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionSummaryModal; 