import { Card, CardContent, Stack, Typography, Grid, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { useState } from 'react';
import InfoIcon from '../../../components/info-icon';
import { PieChart } from '@mui/x-charts';
import { getPlayTimeInHours } from '../../../data/summarizer';
import { blue, brown, green, grey, orange, pink, purple, yellow } from '@mui/material/colors';
import { useContext } from 'react';
import { DataContext } from '../../../data/data-context';

const decadeColors: Record<string, string> = {
  1960: grey[500],
  1970: brown[600],
  1980: pink[500],
  1990: orange[700],
  2000: blue[500],
  2010: yellow[700],
  2020: green[500],
  2030: purple[500],
  2040: '#000000',
};

export const DecadeSection = () => {

  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const { viewSettings } = userData;
  const { editViewSettings } = dataContext;
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const handleMenuClick = (event: any) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const handleHide = () => {
    editViewSettings({ sectionSettings: { decade: { visible: false } } });
    handleMenuClose();
  };

  if (!summary) {
    return null; // or some loading state
  }
  if (!viewSettings.sectionSettings.decade.visible) {
    return null;
  }

  return (
    <Grid size={12} role="region" aria-labelledby="decade-section-title">
      <Card variant="outlined" role="region" aria-labelledby="decade-section-title">
        <CardContent>
          <Stack direction={"row"}>
            <Typography id="decade-section-title" flex={1} variant="h6" gutterBottom component="h2">
              Decades
            </Typography>
            <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB." />
            <IconButton size="small" onClick={handleMenuClick} aria-label="settings">
              <Settings />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleMenuClose}>
              <MenuItem onClick={handleHide}>Hide</MenuItem>
            </Menu>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography style={{ textAlign: 'center' }} component="h3" id="decade-games-finished-title">Games Finished by Decade</Typography>
                <PieChart
                  title='Games Finished Per Decade'
                  series={[{
                    data: summary.releaseDecadeTotals.map(x => ({
                      id: x.decadeLabel,
                      label: x.decadeLabel,
                      value: x.totalGames,
                      color: decadeColors[x.decade],
                    })),
                    valueFormatter: (x) => `${x.value} games finished`,
                    arcLabel: (params) => params.label || '',
                    arcLabelMinAngle: 20,
                    arcLabelRadius: "60%"
                  }]}
                  slotProps={{
                    legend: {
                      direction: 'horizontal',
                      position: { vertical: 'bottom', horizontal: 'center' }
                    }
                  }}
                  height={240}
                  aria-label="Pie chart showing games finished by decade"
                  aria-labelledby="decade-games-finished-title"
                />
              </Box>
            </Grid>
            {viewSettings.showPlaytimeStats && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography style={{ textAlign: 'center' }} component="h3" id="decade-time-played-title">Time Played by Decade</Typography>
                  <PieChart
                    title='Time Played Per Decade'
                    series={[{
                      data: summary.releaseDecadeTotals.map(x => ({
                        id: x.decadeLabel,
                        label: x.decadeLabel,
                        value: getPlayTimeInHours(x.totalTime) || 0,
                        color: decadeColors[x.decade],
                      })),
                      valueFormatter: (x) => `${x.value} hrs played`,
                      arcLabel: (params) => params.label || '',
                      arcLabelMinAngle: 20,
                      arcLabelRadius: "60%"
                    }]}
                    hideLegend
                    height={240}
                    aria-label="Pie chart showing time played by decade"
                    aria-labelledby="decade-time-played-title"
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default DecadeSection;
