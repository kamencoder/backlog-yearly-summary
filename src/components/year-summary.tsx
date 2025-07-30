import { useContext, useMemo } from 'react';
import { getPlayTimeInHours, type PlatformTotal, type SummaryGameInfo } from '../data/summarizer';
import { LineChart, PieChart, BarChart } from '@mui/x-charts';
import { blue, green, red, yellow } from '@mui/material/colors'
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
} from '@mui/material';
import { ExpandMore, Warning } from '@mui/icons-material'
import { SingleStat } from './single-stat';
import { DateTime } from 'luxon';
import { Game } from './game';
import { DataContext } from '../data/DataContext';
import { AcquisitionGuage } from './acquisition-guage';

type PlatformPieTotal = PlatformTotal & { otherPlatformDetails?: string[] };

export const YearSummary = () => {
  const dataContext = useContext(DataContext);
  const { summary } = dataContext.data;
  if (!summary) {
    return null;
  }

  const sortedPlatformsByTotal = useMemo(() => summary.platformTotals.sort((a, b) => b.total - a.total), [summary.platformTotals]);
  const platforPie: PlatformPieTotal[] = useMemo(() => sortedPlatformsByTotal.reduce((acc: PlatformPieTotal[], platform: PlatformTotal) => {
    if (platform.total === 1) {
      const otherGroup = acc.find(p => p.platform === 'Other');
      if (otherGroup) {
        otherGroup.total += platform.total;
        otherGroup.otherPlatformDetails = [...otherGroup.otherPlatformDetails || [], platform.platform];
      } else {
        acc.push({ platform: 'Other', platformAbbreviation: 'Other', total: platform.total, otherPlatformDetails: [platform.platform] });
      }
    } else {
      acc.push(platform);
    }
    return acc;
  }, [] as PlatformPieTotal[]), [sortedPlatformsByTotal]);

  interface MonthSummary { gamesFinished: SummaryGameInfo[]; totalBeat: number; totalComplete: number; }
  const gamesByMonth = useMemo(() => {
    const monthData = summary.games?.reduce((acc: Record<string, MonthSummary>, game) => {
      if (Object.keys(acc).length === 0) {
        for (let i = 1; i <= 12; i++) {
          const month = DateTime.fromFormat(`2020-${i.toString().padStart(2, '0')}-01`, 'yyyy-MM-dd').monthLong || 'unknown';
          acc[month] = { gamesFinished: [], totalBeat: 0, totalComplete: 0 };
        }
      }
      if (game.completionMonth) {
        // console.log('Adding game to month: ', { title: game.title, completion: game.completion, accTotalBeat: acc[game.completionMonth].totalBeat, accTotalComplete: acc[game.completionMonth].totalComplete })
        acc[game.completionMonth].gamesFinished.push(game);
        acc[game.completionMonth].totalBeat += (game.completion === "Beaten" ? 1 : 0);
        acc[game.completionMonth].totalComplete += (game.completion === "Completed" ? 1 : 0);
      }
      return acc;
    }, {} as Record<string, MonthSummary>) || {};
    // console.log('Month Data: ', monthData)
    return monthData;
  }, [summary.games]);

  const totalTimeSpent = getPlayTimeInHours(summary.totalTimeSpent) || 0;

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
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card >
            <CardContent>
              <Stack spacing={3} direction="row" sx={{
                justifyContent: "center",
                alignItems: "center",
              }}>
                <SingleStat value={summary.totalGamesBeaten + summary.totalGamesCompeleted} label="Games Finished" color={green[500]} />
                <SingleStat value={totalTimeSpent} label="Hours Played" color={yellow[700]} />
                <SingleStat value={summary.acquisitions.totalAcquired} label="Games Acquired" color={red[500]} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12} container>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Platform Totals</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <BarChart
                    dataset={sortedPlatformsByTotal as any}
                    yAxis={[{ dataKey: 'platformAbbreviation', scaleType: 'band', width: 120 }]}
                    xAxis={[{ label: "Games Finished" }]}
                    series={[{ dataKey: 'total' }]}
                    height={300}
                    layout="horizontal"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <PieChart
                    series={[
                      {
                        data: platforPie.map(p => ({
                          id: p.platform,
                          label: `${p.platformAbbreviation} (${p.total})`,
                          value: p.total
                        })),
                        arcLabel: (params) => params.label?.replace(/\(.+\)/, '') ?? '',
                        arcLabelMinAngle: 20,
                      },
                    ]}
                    slotProps={{
                      legend: {
                        direction: 'horizontal',
                        position: { vertical: 'bottom', horizontal: 'center' }
                      }
                    }}
                    height={300}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Game Lengths</Typography>
              <LineChart
                title="Game Lengths"
                dataset={summary.lengthGroupTotals as any}
                xAxis={[{ dataKey: 'lengthGroup', scaleType: 'band', label: "Game Length by playtime" }]}
                yAxis={[
                  { id: 'totalGames', scaleType: 'linear', position: 'left', label: 'Games Finished', labelStyle: { fill: green[500], fontSize: "16px" } },
                  { id: 'totalTime', scaleType: 'linear', position: 'right', label: 'Total Time Spent (hrs)', labelStyle: { fill: yellow[800], fontSize: "16px" } },
                ]}
                series={[
                  { dataKey: 'totalGames', yAxisId: 'totalGames', label: 'Games Finished', color: green[500] },
                  { dataKey: 'totalTimeSpent', yAxisId: 'totalTime', label: 'Total Time (hrs)', color: yellow[700] }
                ]}
                height={250}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Release Decade Totals</Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <BarChart
                    title="Release Decade Totals"
                    dataset={summary.releaseDecadeTotals as any}
                    xAxis={[{ dataKey: 'decade', scaleType: 'band', label: "Release Decade" }]}
                    yAxis={[{ label: "Games Finished" }]}
                    series={[{ dataKey: 'total' }]}
                    height={250}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <PieChart
                    series={[
                      {
                        data: summary.releaseDecadeTotals.map(x => ({
                          id: x.decade,
                          label: `${x.decade?.toString()}s`,
                          value: x.total
                        })),
                        arcLabel: (params) => params.label || '',
                        arcLabelMinAngle: 20,
                      },
                    ]}
                    slotProps={{
                      legend: {
                        direction: 'horizontal',
                        position: { vertical: 'bottom', horizontal: 'center' }
                      }
                    }}
                    height={300}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Acquisitions</Typography>
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
        <Typography variant="h3" sx={{ textAlign: { sm: 'center' } }} gutterBottom>Monthly Detail</Typography>
        <Grid size={12} container>
          <Card variant="outlined" sx={{ width: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Completion by month</Typography>
              <BarChart
                sx={{ minHeight: '300px' }}
                height={240}
                dataset={Object.keys(gamesByMonth)
                  .map(monthName => {
                    return {
                      month: monthName,
                      totalBeat: gamesByMonth[monthName].totalBeat,
                      totalComplete: gamesByMonth[monthName].totalComplete
                    }
                  }) as any}
                xAxis={[{ dataKey: 'month', scaleType: 'band' }]}
                yAxis={[{ label: "Games Finished" }]}
                series={[{ dataKey: 'totalBeat', stack: 'month', color: green[500], label: 'Beat' }, { dataKey: 'totalComplete', stack: 'month', color: blue[500], label: 'Complete' }]}
              />
            </CardContent>
          </Card>
        </Grid>
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
