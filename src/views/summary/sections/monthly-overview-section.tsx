import { Card, CardContent, Grid, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import InfoIcon from '../../../components/info-icon';
import { ChartContainer, BarPlot, LinePlot, ChartsXAxis, ChartsYAxis, ChartsTooltip } from '@mui/x-charts';
import { green, blue, yellow } from '@mui/material/colors';
import { useContext, useMemo, useState } from 'react';
import { DataContext } from '../../../data/data-context';
import { DateTime } from 'luxon';
import { getPlayTimeInHours, type SummaryGameInfo } from '../../../data/summarizer';
import { Game } from '../../../components/game';
import { Settings } from '@mui/icons-material';

export const MonthlySection = () => {

  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const { viewSettings } = userData;

  const { editViewSettings } = dataContext;
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const handleMenuClick = (event: any) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const handleHide = () => {
    editViewSettings({ sectionSettings: { monthly: { visible: false } } });
    handleMenuClose();
  };



  interface MonthSummary { gamesFinished: SummaryGameInfo[]; totalBeat: number; totalComplete: number; totalPlaytime: number; }
  const gamesByMonth = useMemo(() => {
    if (!summary?.games) return null;
    const monthData = summary.games?.reduce((acc: Record<string, MonthSummary>, game) => {
      if (Object.keys(acc).length === 0) {
        for (let i = 1; i <= 12; i++) {
          const month = DateTime.fromFormat(`2020-${i.toString().padStart(2, '0')}-01`, 'yyyy-MM-dd').monthLong || 'unknown';
          acc[month] = { gamesFinished: [], totalBeat: 0, totalComplete: 0, totalPlaytime: 0 };
        }
      }
      if (game.completionMonth) {
        const gameBeat = game.completion === "Beaten";
        const gameComplete = game.completion === "Completed";
        const gameFinished = gameBeat || gameComplete;
        acc[game.completionMonth].gamesFinished.push(game);
        acc[game.completionMonth].totalBeat += (gameBeat ? 1 : 0);
        acc[game.completionMonth].totalComplete += (gameComplete ? 1 : 0);
        acc[game.completionMonth].totalPlaytime += (gameFinished && game.playTime ? game.playTime : 0);
      }
      return acc;
    }, {} as Record<string, MonthSummary>) || {};
    return monthData;
  }, [summary?.games]);

  if (!summary || !gamesByMonth || !viewSettings.sectionSettings.monthly.visible) {
    return null;
  }

  return (
    <>
      <Grid size={12}>
        <Card variant="outlined" sx={{ width: "100%" }}>
          <CardContent>
            <Stack direction={"row"}>
              <Typography flex={1} variant="h6" gutterBottom>Completion by month</Typography>
              <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB." />
              <IconButton size="small" onClick={handleMenuClick} aria-label="settings">
                <Settings />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleMenuClose}>
                <MenuItem onClick={handleHide}>Hide</MenuItem>
              </Menu>
            </Stack>
            <ChartContainer
              sx={{ minHeight: '300px' }}
              height={240}
              dataset={Object.keys(gamesByMonth)
                .map(monthName => ({
                  month: monthName,
                  totalBeat: gamesByMonth[monthName].totalBeat,
                  totalComplete: gamesByMonth[monthName].totalComplete,
                  totalPlaytime: getPlayTimeInHours(gamesByMonth[monthName].totalPlaytime)
                })) as any}
              xAxis={[{ dataKey: 'month', scaleType: 'band', id: 'monthAxis' }]}
              yAxis={[
                { id: 'beatCompleteAxis', scaleType: 'linear', position: 'left', label: 'Games Finished' },
                { id: 'playtimeAxis', scaleType: 'linear', position: 'right', label: 'Playtime (hrs)' }
              ]}
              series={[
                { type: 'bar', dataKey: 'totalBeat', stack: 'month', color: green[500], label: 'Beat', yAxisId: 'beatCompleteAxis' },
                { type: 'bar', dataKey: 'totalComplete', stack: 'month', color: blue[500], label: 'Complete', yAxisId: 'beatCompleteAxis' },
                { type: 'line', dataKey: 'totalPlaytime', stack: 'other', color: yellow[500], label: 'Playtime (hrs)', yAxisId: 'playtimeAxis' },
              ]}
            >
              <BarPlot />
              <LinePlot />
              <ChartsXAxis axisId="monthAxis" />
              <ChartsYAxis axisId="beatCompleteAxis" />
              <ChartsYAxis axisId="playtimeAxis" />
              <ChartsTooltip />
            </ChartContainer>
          </CardContent>
        </Card>
      </Grid>
      {gamesByMonth && Object.keys(gamesByMonth).map(month => (
        <Grid size={12} key={month}>
          <Card variant="outlined" sx={{ marginBottom: '6px' }} >
            <CardContent>
              <Typography key={month} variant="h6" fontWeight={600} style={{ textAlign: 'left' }} gutterBottom>{month}</Typography>
              <Grid size={12} container spacing={2} justifyContent="start">
                {gamesByMonth[month]?.gamesFinished.map(game => <Game key={game.id} game={game} />)}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {
        summary.games.some(g => g.finishedThisYear && g.playTimeIsEstimatedAverage)
          ? <Typography variant="caption">
            * Play time for this bundled game was estimated using the bundle playtime divided by the number of games finished. For more accurate numbers, enter playtime directly for each bundled game.
          </Typography>
          : null
      }
    </>
  );
}

export default MonthlySection;
