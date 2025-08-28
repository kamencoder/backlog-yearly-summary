import { Card, CardContent, Stack, Alert, Grid } from '@mui/material';
import { SingleStat } from '../../../components/single-stat';
import { Warning } from '@mui/icons-material';
import { blue, yellow, red, purple } from '@mui/material/colors';
import { getPlayTimeInHours } from '../../../data/summarizer';
import { useContext } from 'react';
import { DataContext } from '../../../data/data-context';
import { formatCurrency } from '../../../data/formatters';

export const YearOverviewSection = () => {

  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const { viewSettings } = userData;
  const totalTimeSpent = getPlayTimeInHours(summary?.totalTimeSpent || 0) || 0;

  if (!summary) {
    return null; // or some loading state
  }

  return (
    <Grid size={12} role="region" aria-labelledby="year-summary-title">
      {!summary.totalGamesBeaten && !summary.totalGamesCompeleted && (
        <Alert variant="outlined" icon={<Warning fontSize="inherit" />} severity="warning" sx={{ marginBottom: '16px' }} role="alert">
          You must fill in the "Completion Date" on your games in order for this tool to be able to tell that you finished them this year.
        </Alert>
      )}
      <Card sx={{ width: "100%" }} role="region" aria-labelledby="year-summary-stats">
        <CardContent>
          <Stack gap={1} direction="row" sx={{ justifyContent: "center", alignItems: "center" }} role="list" aria-label="Yearly summary statistics" id="year-summary-stats">
            <SingleStat
              value={summary.totalGamesBeaten + summary.totalGamesCompeleted}
              label={<>Games<br />Finished</>}
              color={blue[500]}
              role="listitem"
            />
            {viewSettings.showPlaytimeStats && (
              <SingleStat
                value={totalTimeSpent}
                label={<>Hours<br />Played</>}
                color={yellow[700]}
                role="listitem"
              />
            )}
            {viewSettings.sectionSettings?.acquisitions.visible && (
              <SingleStat
                value={summary.acquisitions.totalAcquired}
                label={<>Games<br />Acquired</>}
                color={red[500]}
                role="listitem"
              />
            )}
          </Stack>

          {viewSettings.sectionSettings?.acquisitions.showCosts && (
            <SingleStat
              value={formatCurrency(summary.acquisitions.totalMoneySpent)}
              label="Money Spent"
              color={purple[300]}
              useFixedWidth={false}
            />
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}

export default YearOverviewSection;
