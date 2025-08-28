import { Card, CardContent, Stack, Typography, FormControlLabel, Switch, Box, Grid, IconButton, Menu, MenuItem } from '@mui/material';
import InfoIcon from '../../../components/info-icon';
import { BarChart } from '@mui/x-charts';
import { blue, yellow } from '@mui/material/colors';
import { useContext, useMemo, useState } from 'react';
import { DataContext } from '../../../data/data-context';
import { Settings } from '@mui/icons-material';

export const PlatformSection = () => {

  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const { viewSettings } = userData;
  const platformViewSettings = viewSettings.sectionSettings.platform;

  const sortedPlatformsByTotalGames = useMemo(() => {
    if (!summary?.platformTotals) return null;
    return [...summary?.platformTotals].sort((a, b) => b.totalGames - a.totalGames)
  }, [summary?.platformTotals]);
  const sortedPlatformsByTotalTime = useMemo(() => {
    if (!summary?.platformTotals) return null;
    return [...summary?.platformTotals].sort((a, b) => b.totalTime - a.totalTime)
  }, [summary?.platformTotals]);

  const { editViewSettings } = useContext(DataContext);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const handleMenuClick = (event: any) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const handleHide = () => {
    editViewSettings({ sectionSettings: { platform: { visible: false } } });
    handleMenuClose();
  };

  if (!summary) {
    console.warn("No platform data available");
    return null; // or some loading state
  }

  if (!platformViewSettings.visible) {
    return null;
  }
  return (
    <Grid size={12} role="region" aria-labelledby="platform-section-title">
      <Card variant="outlined" sx={{ width: "100%" }} role="region" aria-labelledby="platform-section-title">
        <CardContent>
          <Stack direction={"row"}>
            <Typography id="platform-section-title" flex={1} variant="h6" gutterBottom component="h2">
              Platforms
            </Typography>
            <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB." />
            <IconButton size="small" onClick={handleMenuClick} aria-label="settings">
              <Settings />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleMenuClose}>
              <MenuItem onClick={handleHide}>Hide</MenuItem>
              {viewSettings.showPlaytimeStats &&
                <MenuItem>
                  <FormControlLabel control={
                    <Switch
                      size="small"
                      checked={platformViewSettings.showPlatformTimeAndGamesCombined}
                      onChange={e => editViewSettings({
                        sectionSettings: {
                          platform: {
                            showPlatformTimeAndGamesCombined: e.currentTarget.checked
                          }
                        }
                      })}
                    />}
                    label="combined"
                  />
                </MenuItem>
              }
            </Menu>
          </Stack>
          <Grid container spacing={2}>
            {(!platformViewSettings.showPlatformTimeAndGamesCombined || !viewSettings.showPlaytimeStats) && sortedPlatformsByTotalGames?.length && (
              <>
                <Grid size={{ md: 12, lg: 6 }}>
                  <Box>
                    <Typography style={{ textAlign: 'center' }} component="h3" id="platform-games-finished-title">Games Finished by Platform</Typography>
                    <BarChart
                      dataset={sortedPlatformsByTotalGames as any}
                      yAxis={[{ dataKey: 'platformAbbreviation', scaleType: 'band', width: 80 }]}
                      xAxis={[{ label: "Games Finished" }]}
                      series={[{ dataKey: 'totalGames', color: blue[500], label: 'Total Games Finished' }]}
                      layout="horizontal"
                      sx={{ height: `${25 * (sortedPlatformsByTotalGames.length < 8 ? 8 : sortedPlatformsByTotalGames.length)}px` }}
                      hideLegend
                      aria-label="Bar chart showing games finished by platform"
                      aria-labelledby="platform-games-finished-title"
                    />
                  </Box>
                </Grid>
                {viewSettings.showPlaytimeStats && sortedPlatformsByTotalTime?.length && (
                  <Grid size={{ md: 12, lg: 6 }}>
                    <Box>
                      <Typography style={{ textAlign: 'center' }} component="h3" id="platform-time-spent-title">Time Spent by Platform</Typography>
                      <BarChart
                        dataset={sortedPlatformsByTotalTime as any}
                        yAxis={[{ dataKey: 'platformAbbreviation', scaleType: 'band', width: 80 }]}
                        xAxis={[{ label: "Time Spent" }]}
                        series={[{
                          dataKey: 'totalTimeHours', color: yellow[700],
                          label: 'Total Time (hrs)',
                        }]}
                        layout="horizontal"
                        sx={{ height: `${25 * (sortedPlatformsByTotalTime.length < 8 ? 8 : sortedPlatformsByTotalTime.length)}px` }}
                        hideLegend
                        aria-label="Bar chart showing time spent by platform"
                        aria-labelledby="platform-time-spent-title"
                      />
                    </Box>
                  </Grid>
                )}
              </>
            )}
            {platformViewSettings.showPlatformTimeAndGamesCombined && viewSettings.showPlaytimeStats && sortedPlatformsByTotalTime?.length && (
              <BarChart
                dataset={sortedPlatformsByTotalTime as any}
                yAxis={[{
                  dataKey: 'platformAbbreviation',
                  scaleType: 'band', width: 80,
                }]}
                xAxis={[
                  {
                    label: "% of Total", id: 'totalGamesAxis',
                    valueFormatter: (value: any) => `${value}%`
                  },
                  { label: "Time Spent", id: 'totalTimeAxis' },
                ]}
                series={[
                  {
                    dataKey: 'percentOfTotalGames', xAxisId: 'totalGamesAxis',
                    label: "% of Total Finished", color: blue[500],
                    valueFormatter: (x, context) => {
                      const totalGames = sortedPlatformsByTotalTime[context.dataIndex].totalGames;
                      return `${x}% (${totalGames} game${totalGames !== 1 ? 's' : ''})`;
                    },
                  },
                  {
                    dataKey: 'percentOfTotalTime', xAxisId: 'totalTimeAxis',
                    label: "% of Total Time", color: yellow[700],
                    valueFormatter: (x, context) => {
                      const totalTime = sortedPlatformsByTotalTime[context.dataIndex].totalTime;
                      return `${x}% (${totalTime} hr${totalTime !== 1 ? 's' : ''})`;
                    },
                  },
                ]}
                layout="horizontal"
                sx={{ height: `${32 * (sortedPlatformsByTotalTime.length < 8 ? 8 : sortedPlatformsByTotalTime.length)}px` }}
                aria-label="Bar chart showing percent of total games and time by platform"
                aria-labelledby="platform-section-title"
              />
            )}
          </Grid>
        </CardContent>
      </Card>
    </Grid >
  );
}

export default PlatformSection;
