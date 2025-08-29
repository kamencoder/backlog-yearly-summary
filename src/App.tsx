import CsvImporter from './views/landing/landing-view'
import { DataContext } from './data/data-context';
import YearSummary from './views/summary/year-summary-view';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDataController } from './data/use-data-controller';
import AppBar from './components/app-bar';
import { Box, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';

function App() {

  const { data, initialize, editGame, editYear, editViewSettings, updateUserData } = useDataController();

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <DataContext
          value={{
            data,
            editGame,
            editYear,
            editViewSettings,
            updateUserData,
            initialize,
          }}>
          <>
            {!data.summary && (<CsvImporter />)}
            {data.summary && (
              <>
                <AppBar />
                <Box sx={{ maxWidth: "1024px", margin: "auto", marginBottom: 2 }}>
                  <Typography id="year-summary-title" variant="h1" fontWeight={700} textAlign="center" component="h1" sx={{ backgroundColor: blue[600] }} >
                    {data.summary.year}
                  </Typography>
                  <Typography variant="subtitle1" textAlign="center" component="h2" sx={{ backgroundColor: blue[600], paddingBottom: 1 }}>
                    Yearly Summary
                  </Typography>
                </Box>
                <YearSummary />
              </>
            )}
          </>
        </DataContext>
      </ThemeProvider>
    </>
  )
}

export default App
