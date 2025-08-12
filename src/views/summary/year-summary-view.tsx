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
  const { summary } = dataContext.data;

  if (!summary) {
    return null;
  }

  return (
    <Box sx={styles.yearSummaryContainer} id='year-summary-container'>
      <Grid container spacing={3}>
        <YearOverviewSection />
        <PlatformSection />
        <GameLengthSection />
        <DecadeSection />
        <AcquisitionsSection />
        <MonthlySection />
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
