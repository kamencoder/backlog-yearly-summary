import { Typography, Card, CardContent, Stack, Alert, Grid } from '@mui/material';
import { SingleStat } from '../../../components/single-stat';
import { Warning } from '@mui/icons-material';
import { blue, yellow, red } from '@mui/material/colors';
import { getPlayTimeInHours } from '../../../data/summarizer';
import { useContext } from 'react';
import { DataContext } from '../../../data/data-context';

export const YearOverviewSection = () => {

  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const { viewSettings } = userData;

  if (!summary) {
    return null; // or some loading state
  }

  const totalTimeSpent = getPlayTimeInHours(summary.totalTimeSpent) || 0;

  return (
    <Grid size={12}>
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
      <Card sx={{ width: "100%" }}>
        <CardContent>
          <Stack spacing={3} direction="row" sx={{ justifyContent: "center", alignItems: "center" }}>
            <SingleStat value={summary.totalGamesBeaten + summary.totalGamesCompeleted} label="Games Finished" color={blue[500]} />
            {viewSettings.showPlaytimeStats && <SingleStat value={totalTimeSpent} label="Hours Played" color={yellow[700]} />}
            {viewSettings.sectionVisibility.showAcquisitions && <SingleStat value={summary.acquisitions.totalAcquired} label="Games Acquired" color={red[500]} />}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default YearOverviewSection;
