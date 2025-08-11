import CsvImporter from './views/landing/landing-view'
import { DataContext } from './data/data-context';
import YearSummary from './views/summary/year-summary-view';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDataController } from './data/use-data-controller';
import AppBar from './components/app-bar';

function App() {

  const { data, initialize, editGame, editYear, editViewSettings } = useDataController();

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
            initialize,
          }}>
          <>
            {!data.summary && (<CsvImporter />)}
            {data.summary && (
              <>
                <AppBar />
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
