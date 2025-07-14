import React, { useRef, useEffect } from "react";
import { Card, CardContent, Typography, Button, Stack, Fade, Box, useTheme } from "@mui/material";
import DirectionsIcon from '@mui/icons-material/Directions';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';

function MapCanvas({ path, run, onShowLive }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const theme = useTheme();

  // Responsive canvas width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const width = containerRef.current.offsetWidth;
        canvasRef.current.width = width;
        canvasRef.current.height = Math.max(200, Math.min(300, width * 0.6));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animate route drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !path || path.length < 2) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Themed background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (theme.palette.mode === 'dark') {
      grad.addColorStop(0, '#232936');
      grad.addColorStop(1, '#181c24');
    } else {
      grad.addColorStop(0, '#e3f2fd');
      grad.addColorStop(1, '#fce4ec');
    }
    // Animate path
    let i = 0;
    function drawStep() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background
      ctx.save();
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      // Shadow
      ctx.save();
      ctx.shadowColor = theme.palette.primary.main;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let j = 0; j <= i && j < path.length; j++) {
        const [x, y] = toCanvas(path[j].lat, path[j].lng);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = theme.palette.primary.main;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      // Start point
      if (i > 0) {
        const [startX, startY] = toCanvas(path[0].lat, path[0].lng);
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(startX, startY, 7, 0, 2 * Math.PI);
        ctx.fill();
      }
      // End point
      if (i > 0) {
        const [endX, endY] = toCanvas(path[i].lat, path[i].lng);
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(endX, endY, 7, 0, 2 * Math.PI);
        ctx.fill();
      }
      // Waypoints every 1km
      let dist = 0;
      for (let j = 1; j <= i && j < path.length; j++) {
        const prev = path[j - 1];
        const curr = path[j];
        const d = haversine(prev.lat, prev.lng, curr.lat, curr.lng);
        dist += d;
        if (Math.floor(dist / 1000) > Math.floor((dist - d) / 1000)) {
          const [wx, wy] = toCanvas(curr.lat, curr.lng);
          ctx.fillStyle = "#ff9800";
          ctx.beginPath();
          ctx.arc(wx, wy, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      if (i < path.length - 1) {
        animationRef.current = requestAnimationFrame(() => {
          drawStep(i + 1);
          i++;
        });
      }
    }
    // Find bounds
    const lats = path.map((p) => p.lat);
    const lngs = path.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padding = 20;
    const w = canvas.width - 2 * padding;
    const h = canvas.height - 2 * padding;
    const latRange = maxLat - minLat || 0.0001;
    const lngRange = maxLng - minLng || 0.0001;
    const toCanvas = (lat, lng) => [
      padding + ((lng - minLng) / lngRange) * w,
      padding + h - ((lat - minLat) / latRange) * h,
    ];
    drawStep();
    return () => cancelAnimationFrame(animationRef.current);
  }, [path, theme.palette.mode]);

  // Haversine for waypoints
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

  return (
    <Fade in timeout={600}>
      <Card sx={{ my: 2, boxShadow: 8, borderRadius: 4, p: { xs: 1, sm: 2 }, background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #232936 0%, #181c24 100%)' : 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)' }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <DirectionsIcon color="primary" />
              <Typography variant="h5" fontWeight={600} fontSize={{ xs: 18, sm: 24 }}>Route Map</Typography>
            </Stack>
            {run && (
              <Button variant="outlined" size="small" onClick={onShowLive} sx={{ fontSize: { xs: 12, sm: 14 } }}>
                Show Live Tracking
              </Button>
            )}
          </Stack>
          {(!path || path.length < 2) ? (
            <Box sx={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: theme.palette.mode === 'dark' ? 'rgba(35,41,54,0.7)' : 'rgba(255,255,255,0.7)', borderRadius: 3, boxShadow: 2 }}>
              <DirectionsIcon color="disabled" sx={{ fontSize: 60, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">No route yet. Start tracking to see your path!</Typography>
            </Box>
          ) : (
            <Box ref={containerRef} sx={{ width: '100%', p: { xs: 0, sm: 1 }, background: theme.palette.mode === 'dark' ? 'rgba(35,41,54,0.5)' : 'rgba(255,255,255,0.5)', borderRadius: 3, boxShadow: 1 }}>
              <canvas ref={canvasRef} id="jogger-canvas" style={{ border: "1px solid #ccc", width: "100%", height: 'auto', minHeight: 180, borderRadius: 12, touchAction: 'none', background: 'transparent' }}>
                Your browser does not support the HTML5 canvas tag.
              </canvas>
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
}

export default MapCanvas; 