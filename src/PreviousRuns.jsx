import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, Typography, Box, Stack, IconButton, Button, Fade } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import HistoryIcon from '@mui/icons-material/History';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';

function formatDuration(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

const BATCH_SIZE = 5;

function PreviousRuns({ onSelectRun, selectedRun, runs, setRuns, showSnackbar }) {
  const [visible, setVisible] = useState(BATCH_SIZE);
  const loader = useRef(null);

  useEffect(() => {
    setVisible(BATCH_SIZE);
  }, [runs]);

  useEffect(() => {
    if (!loader.current) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + BATCH_SIZE, runs.length));
        }
      },
      { threshold: 1 }
    );
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [runs]);

  const handleDelete = (idx) => {
    const updated = runs.filter((_, i) => i !== idx);
    setRuns(updated);
    localStorage.setItem("jogger_runs", JSON.stringify(updated));
    if (onSelectRun && selectedRun === runs[idx]) onSelectRun(null);
    if (showSnackbar) showSnackbar("Run deleted.", "info");
  };

  const handleClearAll = () => {
    setRuns([]);
    localStorage.removeItem("jogger_runs");
    if (onSelectRun) onSelectRun(null);
    if (showSnackbar) showSnackbar("All runs cleared.", "info");
  };

  if (!runs.length) return null;

  return (
    <Box sx={{ my: { xs: 2, sm: 4 }, px: { xs: 0, sm: 1 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <HistoryIcon color="primary" />
          <Typography variant="h5" fontSize={{ xs: 18, sm: 22 }}>Previous Runs</Typography>
        </Stack>
        <Button variant="outlined" color="error" size="small" startIcon={<ClearAllIcon />} onClick={handleClearAll} sx={{ fontSize: { xs: 12, sm: 14 } }}>
          Clear All
        </Button>
      </Stack>
      <Stack spacing={2}>
        {runs.slice(0, visible).map((run, i) => (
          <Fade in timeout={500 + i * 100} key={i}>
            <Card
              variant={selectedRun === run ? "outlined" : "elevation"}
              sx={{
                border: selectedRun === run ? '2px solid #1976d2' : undefined,
                cursor: 'pointer',
                transition: 'border 0.2s, box-shadow 0.2s',
                boxShadow: selectedRun === run ? 8 : 2,
                borderRadius: 3,
                '&:hover': { boxShadow: 10, borderColor: '#1976d2' },
                '&:active': { boxShadow: 4 },
                p: { xs: 1, sm: 2 }
              }}
              onClick={() => {
                onSelectRun(run);
                if (showSnackbar) showSnackbar("Viewing previous run.", "info");
              }}
            >
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" fontSize={{ xs: 15, sm: 17 }}>
                    {new Date(run.date).toLocaleString()}
                  </Typography>
                  <Box>
                    <IconButton color="primary" size="small" onClick={e => { e.stopPropagation(); onSelectRun(run); if (showSnackbar) showSnackbar("Viewing previous run.", "info"); }}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={e => { e.stopPropagation(); handleDelete(i); }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={1}>
                  <Typography variant="body2" fontSize={{ xs: 13, sm: 15 }}><DirectionsWalkIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} /><strong>Distance:</strong> {(run.distance / 1000).toFixed(2)} km</Typography>
                  <Typography variant="body2" fontSize={{ xs: 13, sm: 15 }}><AccessTimeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} /><strong>Duration:</strong> {formatDuration(run.elapsed)}</Typography>
                  <Typography variant="body2" fontSize={{ xs: 13, sm: 15 }}><TimelineIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} /><strong>Points:</strong> {run.path.length}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        ))}
      </Stack>
      <div ref={loader} style={{ height: 20 }} />
    </Box>
  );
}

export default PreviousRuns; 