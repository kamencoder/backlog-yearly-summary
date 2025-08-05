import CsvImporter from './components/data-importer'
import { DataContext } from './data/DataContext';
import YearSummary from './components/year-summary';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDataController } from './data/use-data-controller';
import AppBar from './components/app-bar';

function App() {

  const { data, initialize, editGame, editYear } = useDataController();

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
