import { useContext, useMemo, useState } from 'react';
import { getPlayTimeInHours, type SummaryGameInfo } from '../data/summarizer';
import { LineChart, PieChart, BarChart, ChartContainer, BarPlot, LinePlot, ChartsXAxis, ChartsYAxis, ChartsTooltip } from '@mui/x-charts';
import { blue, brown, green, grey, orange, pink, purple, red, yellow } from '@mui/material/colors'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  type Theme,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ExpandMore, Warning } from '@mui/icons-material'
import { SingleStat } from './single-stat';
import { DateTime } from 'luxon';
import { Game } from './game';
import { DataContext } from '../data/DataContext';
import { AcquisitionGuage } from './acquisition-guage';
import InfoIcon from './info-icon';

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
}

export const YearSummary = () => {
  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const { viewSettings } = userData;
  if (!summary) {
    return null;
  }

  const sortedPlatformsByTotalGames = useMemo(() => summary.platformTotals.sort((a, b) => b.totalGames - a.totalGames), [summary.platformTotals]);
  const sortedPlatformsByTotalTime = useMemo(() => [...summary.platformTotals].sort((a, b) => b.totalTime - a.totalTime), [summary.platformTotals]);

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

  const totalTimeSpent = getPlayTimeInHours(summary.totalTimeSpent) || 0;

  const [showPlatformTimeAndGamesCombined, setShowPlatformTimeAndGamesCombined] = useState(true);

  return (
    <Box sx={styles.yearSummaryContainer} id='year-summary-container'>
      <Typography variant="h1" fontWeight={700} textAlign="center">
        {summary.year}
      </Typography>
      <Typography variant="subtitle1" textAlign="center" gutterBottom>
        Yearly Summary
      </Typography>
      {!summary.totalGamesBeaten && !summary.totalGamesCompeleted && (
        <Alert variant="outlined" icon={<Warning fontSize="inherit" />} severity="warning" sx={{ marginBottom: '16px' }}>
          You must fill in the "Completion Date" on your games in order for this tool to be able to tell that you finished them this year.
        </Alert>
      )}

      <Grid container spacing={3} >
        <Grid size={12}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Stack spacing={3} direction="row" sx={{
                justifyContent: "center",
                alignItems: "center",
              }}>
                <SingleStat value={summary.totalGamesBeaten + summary.totalGamesCompeleted} label="Games Finished" color={blue[500]} />
                {viewSettings.showPlaytimeStats && <SingleStat value={totalTimeSpent} label="Hours Played" color={yellow[700]} />}
                {viewSettings.showAcquisitionStats && <SingleStat value={summary.acquisitions.totalAcquired} label="Games Acquired" color={red[500]} />}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        {viewSettings.sectionVisibility.showPlatformSection && <Grid size={12} container>
          <Card variant="outlined" sx={{ width: "100%" }}>
            <CardContent>
              <Stack direction={"row"}>
                <Typography flex={1} variant="h6" gutterBottom>Platforms</Typography>
                <FormControlLabel control={
                  <Switch
                    size="small"
                    checked={showPlatformTimeAndGamesCombined}
                    onChange={(e => {
                      setShowPlatformTimeAndGamesCombined(e.currentTarget.checked);
                    })}
                  />}
                  label="combined"
                />
                <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB." />
              </Stack>

              <Grid container spacing={2}>
                {(!showPlatformTimeAndGamesCombined) && (
                  <>
                    <Grid size={{ md: 12, lg: 6 }}>
                      <Box>
                        <Typography style={{ textAlign: 'center' }}>Games Finished by Platform</Typography>
                        <BarChart
                          dataset={sortedPlatformsByTotalGames as any}
                          yAxis={[{ dataKey: 'platformAbbreviation', scaleType: 'band', width: 80 }]}
                          xAxis={[{ label: "Games Finished" }]}
                          series={[{ dataKey: 'totalGames', color: blue[500], label: 'Total Games Finished' }]}
                          layout="horizontal"
                          sx={{ height: `${25 * (sortedPlatformsByTotalGames.length < 8 ? 8 : sortedPlatformsByTotalGames.length)}px` }}
                          hideLegend
                        />
                      </Box>
                    </Grid>
                    {viewSettings.showPlaytimeStats && (
                      <Grid size={{ md: 12, lg: 6 }}>
                        <Box>
                          <Typography style={{ textAlign: 'center' }}>Time Spent by Platform</Typography>
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
                          />
                        </Box>
                      </Grid>
                    )}
                  </>
                )}
                {showPlatformTimeAndGamesCombined && (

                  <BarChart
                    dataset={sortedPlatformsByTotalTime as any}
                    slotProps={{

                    }}
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
                        valueFormatter: (x) => `${x}%`,
                      },
                      {
                        dataKey: 'percentOfTotalTime', xAxisId: 'totalTimeAxis',
                        label: "% of Total Time", color: yellow[700],
                        valueFormatter: (x) => `${x}%`,
                      },
                    ]}
                    layout="horizontal"
                    sx={{ height: `${32 * (sortedPlatformsByTotalTime.length < 8 ? 8 : sortedPlatformsByTotalTime.length)}px` }}
                  />

                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        }
        {viewSettings.sectionVisibility.showGameLengthSection && viewSettings.showPlaytimeStats && (<Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction={"row"}>
                <Typography flex={1} variant="h6" gutterBottom>Game Lengths</Typography>
                <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB. Game length is determined by your Playtime entered for each game." />
              </Stack>
              <LineChart
                title="Game Lengths"
                dataset={summary.lengthGroupTotals as any}
                xAxis={[{ dataKey: 'lengthGroup', scaleType: 'band', label: "Game Length by playtime" }]}
                yAxis={[
                  { id: 'totalGames', scaleType: 'linear', position: 'left', label: 'Games Finished', labelStyle: { fill: blue[500], fontSize: "16px" } },
                  { id: 'totalTime', scaleType: 'linear', position: 'right', label: 'Total Time Spent (hrs)', labelStyle: { fill: yellow[700], fontSize: "16px" } },
                ]}
                series={[
                  { dataKey: 'totalGames', yAxisId: 'totalGames', label: 'Games Finished', color: blue[500] },
                  { dataKey: 'totalTimeSpent', yAxisId: 'totalTime', label: 'Total Time (hrs)', color: yellow[700] }
                ]}
                height={250}
              />
            </CardContent>
          </Card>
        </Grid>
        )}
        {viewSettings.sectionVisibility.showDecadeSection && (
          <Grid size={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={"row"}>
                  <Typography flex={1} variant="h6" gutterBottom>Decades</Typography>
                  <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB." />
                </Stack>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography style={{ textAlign: 'center' }}>Games Finished by Decade</Typography>
                      <PieChart
                        title='Games Finished Per Decade'
                        series={[
                          {
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
                          },
                        ]}
                        // hideLegend                      
                        slotProps={{
                          legend: {
                            direction: 'horizontal',
                            position: { vertical: 'bottom', horizontal: 'center' }
                          }
                        }}
                        height={240}
                      />
                    </Box>
                  </Grid>
                  {viewSettings.showPlaytimeStats && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography style={{ textAlign: 'center' }}>Time Played by Decade</Typography>
                        <PieChart
                          title='Time Played Per Decade'
                          series={[
                            {
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
                            },
                          ]}

                          hideLegend
                          height={240}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
        {viewSettings.showAcquisitionStats && (<Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction={"row"}>
                <Typography flex={1} variant="h6" gutterBottom>Backlog Additions</Typography>
                <InfoIcon text="Includes games acquired within this year based on the Acquisition Date set on the game in IB. The number of games played includes total number of games among those acquired this year which are marked as playing or played. The number of games finished includes total number of those acquired this year which are marked beaten or completed." />
              </Stack>
              {!summary.acquisitions.totalAcquired && (
                <Alert variant="outlined" icon={<Warning fontSize="inherit" />} severity="warning" sx={{ marginBottom: '16px' }}>
                  You must fill in the "Acquisition Date" on your games in order for this tool to be able to tell that you bought or received them this year.
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 2 }}>
                  <Stack spacing={1} direction={{ xs: "row", sm: "row", md: "column" }} justifyContent={"center"} flexWrap="wrap">
                    <SingleStat value={summary.acquisitions.totalAcquired} label="Acquired" color={red[500]} />
                    <SingleStat value={summary.acquisitions.totalPlayed} label="Played" color={yellow[700]} />
                    <SingleStat value={summary.acquisitions.totalFinished} label="Finished" color={green[500]} />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 10 }} display={"flex"} justifyContent={"center"}>
                  <AcquisitionGuage acquisitionSummary={summary.acquisitions} />
                </Grid>
                <Grid size={12}>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                    >
                      <Typography component="span">Acquired Game List</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper}>
                        <Table aria-label="Acquired Games">
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Platform</TableCell>
                              <TableCell>Date Acquired</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {summary.games.filter(g => g.acquiredThisYear).map(g => (
                              // {g.title} ({g.platformAbbreviation})- {g.acquisitionDate}
                              <TableRow
                                key={g.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                                <TableCell component="th" scope="row">{g.title}</TableCell>
                                <TableCell>{g.platform}</TableCell>
                                <TableCell>{g.acquisitionDate}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>

            </CardContent>
          </Card>
        </Grid>
        )}
        {viewSettings.sectionVisibility.showMonthlyOverview && (
          <Grid size={12} container>
            <Card variant="outlined" sx={{ width: "100%" }}>
              <CardContent>
                <Stack direction={"row"}>
                  <Typography flex={1} variant="h6" gutterBottom>Completion by month</Typography>
                  <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB." />
                </Stack>
                <ChartContainer
                  // <BarChart
                  sx={{ minHeight: '300px' }}
                  height={240}
                  dataset={Object.keys(gamesByMonth)
                    .map(monthName => {
                      return {
                        month: monthName,
                        totalBeat: gamesByMonth[monthName].totalBeat,
                        totalComplete: gamesByMonth[monthName].totalComplete,
                        totalPlaytime: getPlayTimeInHours(gamesByMonth[monthName].totalPlaytime)
                      }
                    }) as any}
                  xAxis={[{ dataKey: 'month', scaleType: 'band', id: 'monthAxis' }]}
                  yAxis={[
                    { id: 'beatCompleteAxis', scaleType: 'linear', position: 'left', label: 'Games Finished' },
                    { id: 'playtimeAxis', scaleType: 'linear', position: 'right', label: 'Playtime (hrs)' }
                  ]}
                  // yAxis={[{ label: "Games Finished" }]}
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
        )}
        {viewSettings.sectionVisibility.showMonthlyGames && (
          <Grid size={12}>
            {gamesByMonth && Object.keys(gamesByMonth).map(month => (
              <Card variant="outlined" sx={{ marginBottom: '6px' }} key={month} >
                <CardContent>
                  <Typography key={month} variant="h6" fontWeight={600} style={{ textAlign: 'left' }} gutterBottom>{month}</Typography>
                  {/* <GameList games={gamesByMonth[month]?.gamesFinished} /> */}
                  <Grid size={12} container spacing={2} justifyContent="start">
                    {gamesByMonth[month]?.gamesFinished.map(game => <Game key={game.id} game={game} />)}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>
        )}
      </Grid>
    </Box >
  );
}

const styles = {
  yearSummaryContainer: (theme: Theme) => ({
    maxWidth: "1024px",
    margin: "auto",
    padding: 3,
    backgroundColor: theme.palette.background.default,  // Set background here so that it shows in screenshots of this element
    [theme.breakpoints.down('sm')]: {
      padding: 0
    },
  })
};

export default YearSummary;
