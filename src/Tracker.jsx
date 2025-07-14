import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, Typography, Stack, Box, Fade } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MyLocationIcon from '@mui/icons-material/MyLocation';

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculatePoints(distance) {
  // Dynamic: 1pt/100m for 0-1km, 2pt/100m for 1-3km, 3pt/100m for 3km+
  let points = 0;
  if (distance <= 1000) {
    points = Math.floor(distance / 100); // 1 point per 100m
  } else if (distance <= 3000) {
    points = 10 + Math.floor((distance - 1000) / 100) * 2; // 2 points per 100m after 1km
  } else {
    points = 10 + 40 + Math.floor((distance - 3000) / 100) * 3; // 3 points per 100m after 3km
  }
  return points;
}

const MIN_MOVE = 5; // meters

function Tracker({ onPathUpdate, disabled, runs, setRuns, showSnackbar, setShowSummary, setSummaryRun }) {
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [points, setPoints] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const watchIdRef = React.useRef(null);
  const timerRef = React.useRef(null);

  useEffect(() => {
    if (tracking) {
      setStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [tracking, startTime]);

  useEffect(() => {
    if (tracking) {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        if (showSnackbar) showSnackbar("Geolocation is not supported by your browser.", "error");
        return;
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: pos.timestamp,
          };
          setPosition(coords);
          setPath((prev) => {
            if (prev.length === 0) {
              // Always add the first point
              const updated = [coords];
              if (onPathUpdate) onPathUpdate(updated);
              return updated;
            }
            const last = prev[prev.length - 1];
            const d = haversine(last.lat, last.lng, coords.lat, coords.lng);
            if (d >= MIN_MOVE) {
              const updated = [...prev, coords];
              if (onPathUpdate) onPathUpdate(updated);
              setDistance((dist) => {
                const newDist = dist + d;
                setPoints(calculatePoints(newDist));
                return newDist;
              });
              setSpeed(
                (coords.timestamp - last.timestamp) > 0
                  ? (d / ((coords.timestamp - last.timestamp) / 1000))
                  : 0
              );
              return updated;
            }
            // Ignore this update (too small movement)
            return prev;
          });
        },
        (err) => {
          setError(err.message);
          if (showSnackbar) showSnackbar(err.message, "error");
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [tracking, onPathUpdate, showSnackbar]);

  const handleStart = () => {
    setPath([]);
    setError(null);
    setDistance(0);
    setSpeed(0);
    setElapsed(0);
    setPoints(0);
    setStartTime(Date.now());
    setTracking(true);
  };
  const handleStop = () => {
    setTracking(false);
  };
  const handleSave = () => {
    if (path.length < 2) {
      if (showSnackbar) showSnackbar("Not enough points to save run.", "warning");
      return;
    }
    const newRun = {
      path,
      distance,
      elapsed,
      points,
      date: new Date().toISOString(),
    };
    const updatedRuns = [newRun, ...runs];
    setRuns(updatedRuns);
    localStorage.setItem("jogger_runs", JSON.stringify(updatedRuns));
    if (showSnackbar) showSnackbar("Run saved!", "success");
    if (setShowSummary && setSummaryRun) {
      setSummaryRun(newRun);
      setShowSummary(true);
    }
    // Reset after save for better UX
    setPath([]);
    setDistance(0);
    setSpeed(0);
    setElapsed(0);
    setPoints(0);
    setPosition(null);
  };

  // Save should be enabled if not tracking and path is long enough
  const canSave = !tracking && path.length >= 2 && !disabled;

  return (
    <Fade in timeout={600}>
      <Card sx={{ my: 2, boxShadow: 6, borderRadius: 3, p: { xs: 1, sm: 2 } }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <DirectionsRunIcon color="primary" />
            <Typography variant="h5" fontWeight={600} fontSize={{ xs: 18, sm: 24 }}>Jogging Tracker</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Points: 1 per 100m (0-1km), 2 per 100m (1-3km), 3 per 100m (3km+)
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
            <Button
              variant={tracking ? "contained" : "outlined"}
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleStart}
              disabled={tracking || disabled}
              sx={{ minWidth: 110, fontWeight: 600, boxShadow: tracking ? 3 : 0, transition: 'box-shadow 0.2s', fontSize: { xs: 14, sm: 16 } }}
            >
              Start
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<StopIcon />}
              onClick={handleStop}
              disabled={!tracking || disabled}
              sx={{ minWidth: 110, fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}
            >
              Stop
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!canSave}
              sx={{ minWidth: 110, fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}
            >
              Save Run
            </Button>
          </Stack>
          {!canSave && !tracking && (
            <Typography variant="caption" color="warning.main" sx={{ mb: 1, display: 'block' }}>
              Move at least 5 meters to enable saving your run.
            </Typography>
          )}
          {error && <Typography color="error">{error}</Typography>}
          {position && (
            <Box mb={1}>
              <Typography variant="body2" fontSize={{ xs: 13, sm: 15 }}>
                <MyLocationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                <strong>Current Position:</strong> Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
              </Typography>
            </Box>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
            <Typography variant="body2" fontSize={{ xs: 13, sm: 15 }}>
              <DirectionsRunIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              <strong>Distance:</strong> {(distance / 1000).toFixed(2)} km
            </Typography>
            <Typography variant="body2" fontSize={{ xs: 13, sm: 15 }}>
              <SpeedIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              <strong>Current Speed:</strong> {(speed * 3.6).toFixed(2)} km/h
            </Typography>
            <Typography variant="body2" fontSize={{ xs: 13, sm: 15 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              <strong>Elapsed:</strong> {Math.floor(elapsed / 60000)}m {Math.floor((elapsed % 60000) / 1000)}s
            </Typography>
            <Typography variant="body2" fontSize={{ xs: 13, sm: 15 }}>
              <EmojiEventsIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              <strong>Points:</strong> {points}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
}

export default Tracker; 