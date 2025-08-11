import { useContext } from 'react';
import { Box, Grid, type Theme } from '@mui/material';
import { DataContext } from '../../data/data-context';
import YearOverviewSection from './sections/year-overview-section';
import PlatformSection from './sections/platform-section';
import GameLengthSection from './sections/game-length-section';
import DecadeSection from './sections/decade-section';
import AcquisitionsSection from './sections/acquisitions-section';
import MonthlySection from './sections/monthly-overview-section';

// ...existing code...

export const YearSummary = () => {
  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const { viewSettings } = userData;
  if (!summary) {
    return null;
  }

  return (
    <Box sx={styles.yearSummaryContainer} id='year-summary-container'>
      <Grid container spacing={3}>
        <Grid size={12}>
          <YearOverviewSection />
        </Grid>
        {viewSettings.sectionVisibility.showPlatformSection && (
          <Grid size={12} container>
            <PlatformSection />
          </Grid>
        )}
        {viewSettings.sectionVisibility.showGameLengthSection && viewSettings.showPlaytimeStats && (
          <Grid size={12}>
            <GameLengthSection />
          </Grid>
        )}
        {viewSettings.sectionVisibility.showDecadeSection && (
          <Grid size={12}>
            <DecadeSection />
          </Grid>
        )}
        {viewSettings.sectionVisibility.showAcquisitions && (
          <Grid size={12}>
            <AcquisitionsSection />
          </Grid>
        )}
        {viewSettings.sectionVisibility.showMonthlyOverview && (
          <Grid size={12} container>
            <MonthlySection />
          </Grid>
        )}
      </Grid>
    </Box>
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
