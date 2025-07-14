import React from "react";
import { Card, CardContent, Typography, Stack, Chip, Box } from "@mui/material";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BoltIcon from '@mui/icons-material/Bolt';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

function getTodayDateStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function Dashboard({ runs }) {
  // Today stats
  const todayStr = getTodayDateStr();
  const todayRuns = runs.filter(r => r.date && r.date.startsWith(todayStr));
  const todayDistance = todayRuns.reduce((sum, r) => sum + (r.distance || 0), 0);
  const todayPoints = todayRuns.reduce((sum, r) => sum + (r.points || 0), 0);
  // All time stats
  const totalPoints = runs.reduce((sum, r) => sum + (r.points || 0), 0);
  const bestRun = runs.reduce((best, r) => (r.distance > (best?.distance || 0) ? r : best), null);
  // Achievements
  const achievements = [];
  if (runs.length > 0) achievements.push({ label: "First Run!", icon: <StarIcon />, color: "default" });
  if (runs.some(r => r.distance >= 5000)) achievements.push({ label: "5km+ Run", icon: <BoltIcon />, color: "primary" });
  if (runs.some(r => r.distance >= 10000)) achievements.push({ label: "10km+ Run", icon: <WhatshotIcon />, color: "error" });
  if (runs.length >= 10) achievements.push({ label: "10 Runs", icon: <CalendarTodayIcon />, color: "secondary" });
  if (runs.length >= 25) achievements.push({ label: "25 Runs", icon: <MilitaryTechIcon />, color: "warning" });
  // Streak: count consecutive days with runs
  let streak = 0;
  let prev = null;
  for (const r of runs) {
    const d = r.date?.slice(0, 10);
    if (!d) continue;
    if (!prev) { streak = 1; prev = d; continue; }
    const prevDate = new Date(prev);
    prevDate.setDate(prevDate.getDate() - 1);
    if (d === prevDate.toISOString().slice(0, 10)) { streak++; prev = d; }
    else break;
  }
  if (streak >= 3) achievements.push({ label: `Streak: ${streak} days`, icon: <EmojiEventsIcon />, color: "success" });
  if (streak >= 7) achievements.push({ label: `7-Day Streak!`, icon: <WhatshotIcon />, color: "error" });
  if (todayPoints >= 100) achievements.push({ label: `100+ Points Today!`, icon: <EmojiEventsIcon />, color: "success" });

  return (
    <Card sx={{ mb: 3, boxShadow: 4, borderRadius: 3, p: 1 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>Dashboard</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <Chip icon={<DirectionsRunIcon />} label={`Today: ${(todayDistance / 1000).toFixed(2)} km`} color="primary" variant="outlined" />
          <Chip icon={<EmojiEventsIcon />} label={`Points: ${todayPoints}`} color="success" variant="outlined" />
          {bestRun && <Chip icon={<StarIcon />} label={`Best: ${(bestRun.distance / 1000).toFixed(2)} km`} color="warning" variant="outlined" />}
        </Stack>
        {achievements.length > 0 && (
          <Box mb={1}>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>Achievements:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {achievements.map((a, i) => (
                <Chip key={i} icon={a.icon} label={a.label} color={a.color} variant="filled" />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default Dashboard; 