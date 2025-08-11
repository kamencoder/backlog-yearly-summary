import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import InfoIcon from '../../../components/info-icon';
import { ChartContainer, BarPlot, LinePlot, ChartsXAxis, ChartsYAxis, ChartsTooltip } from '@mui/x-charts';
import { green, blue, yellow } from '@mui/material/colors';
import { useContext, useMemo } from 'react';
import { DataContext } from '../../../data/data-context';
import { DateTime } from 'luxon';
import type { SummaryGameInfo } from '../../../data/summarizer';
import { Game } from '../../../components/game';

export const MonthlySection = () => {

  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const { viewSettings } = userData;

  if (!summary) {
    return null; // or some loading state
  }

  interface MonthSummary { gamesFinished: SummaryGameInfo[]; totalBeat: number; totalComplete: number; totalPlaytime: number; }
  const gamesByMonth = useMemo(() => {
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
  }, [summary.games]);

  return (
    <>
      {viewSettings.sectionVisibility.showMonthlyOverview && (<Card variant="outlined" sx={{ width: "100%" }}>
        <CardContent>
          <Stack direction={"row"}>
            <Typography flex={1} variant="h6" gutterBottom>Completion by month</Typography>
            <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB." />
          </Stack>
          <ChartContainer
            sx={{ minHeight: '300px' }}
            height={240}
            dataset={Object.keys(gamesByMonth)
              .map(monthName => ({
                month: monthName,
                totalBeat: gamesByMonth[monthName].totalBeat,
                totalComplete: gamesByMonth[monthName].totalComplete,
                totalPlaytime: gamesByMonth[monthName].totalPlaytime
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
      )}
      {viewSettings.sectionVisibility.showMonthlyGames && gamesByMonth && Object.keys(gamesByMonth).map(month => (
        <Card variant="outlined" sx={{ marginBottom: '6px' }} key={month} >
          <CardContent>
            <Typography key={month} variant="h6" fontWeight={600} style={{ textAlign: 'left' }} gutterBottom>{month}</Typography>
            <Grid size={12} container spacing={2} justifyContent="start">
              {gamesByMonth[month]?.gamesFinished.map(game => <Game key={game.id} game={game} />)}
            </Grid>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default MonthlySection;
