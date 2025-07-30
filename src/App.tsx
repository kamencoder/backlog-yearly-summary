import { useEffect, useMemo, useState } from 'react'
import CsvImporter from './components/data-importer'
import { type CsvData, type Data, DataContext, type GameEdit, type UserData } from './data/DataContext';
import { getYearSummary, type Summary } from './data/summarizer';
import YearSummary from './components/year-summary';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Download, Photo } from '@mui/icons-material'
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button } from '@mui/material';
import html2canvas from 'html2canvas';

const initialUserData = JSON.parse(localStorage.getItem('user-data') || "{}");
function App() {

  // TODO: Move data context state into separate hook
  const [startingData, setStartingData] = useState<{ games: CsvData[], year: number }>();
  const [userData, setUserData] = useState<UserData>({ ...initialUserData, gameEdits: { ...initialUserData.gameEdits } });
  const [baseSummary, setBaseSummary] = useState<Summary | null>(null);

  useEffect(() => {
    console.log('Creating summary from CSV data', { games: startingData?.games?.length });
    if (startingData?.games && startingData.games.length > 0) {
      const baseSummary = getYearSummary(startingData.games, startingData.year);
      setBaseSummary(baseSummary);
    }
  }, [startingData]);


  const summary = useMemo((): Summary | null => {
    if (!baseSummary) {
      return baseSummary;
    }
    return {
      ...baseSummary,
      games: baseSummary.games.map(g => ({
        ...g,
        ...userData.gameEdits?.[g.id],
      }))
    }
  }, [baseSummary, userData])

  const data = useMemo<Data>((): Data => {
    return {
      games: startingData?.games,
      year: startingData?.year,
      summary,
      userData,
    }
  }, [startingData, summary])


  const updateUserDataLocalStorage = () => {
    if (!summary) return;
    try {
      console.log('Saving user data to local storage');
      const currentUserData = JSON.parse(localStorage.getItem('user-data') || "{}");
      localStorage.setItem('user-data', JSON.stringify({
        ...currentUserData,
        ...userData,
        gameEdits: {
          ...currentUserData?.gameEdits,
          ...userData?.gameEdits,
        }
      }))
    } catch (err) {
      console.error('Unable to save user-data to local storage', err);
    }
  }

  useEffect(() => {
    if (userData) {
      updateUserDataLocalStorage();
    }
  }, [userData])

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  function captureScreenshot() {
    const captureElement = document.querySelector('#year-summary-container') // Select the element you want to capture. Select the <body> element to capture full page.
    html2canvas(captureElement as any)
      .then(canvas => {
        canvas.style.display = 'none'
        document.body.appendChild(canvas)
        return canvas
      })
      .then(canvas => {
        const image = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.setAttribute('download', 'ib-summary.png')
        a.setAttribute('href', image)
        a.click()
        canvas.remove()
      }).catch(err => {
        console.log(err);
      });
  }

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <DataContext
          value={{
            data,
            editGame: (gameId: string, gameEdit: GameEdit) => {
              console.log('Game Edit saved', { gameId, gameEdit })
              const newUserData = {
                ...userData,
                gameEdits: {
                  ...data.userData?.gameEdits,
                  [gameId]: {
                    ...data.userData?.gameEdits[gameId],
                    ...gameEdit
                  }
                }
              }
              console.log('New user data game info: ', newUserData.gameEdits[gameId])
              setUserData(newUserData)
            },
            initialize: (games: CsvData[], year: number) => {
              console.log('Initializing', { gameCount: games?.length, year });
              setStartingData({
                games,
                year
              })
            }
          }}>
          <>
            <CsvImporter />
            {summary && (
              <YearSummary />
            )}
            {summary && (
              <Box margin={10} display={"flex"} justifyContent={"end"} gap={2}>
                <Button
                  component="label"
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<Download />}
                  onClick={() => window.print()}
                >
                  Print PDF
                </Button>
                <Button
                  component="label"
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<Photo />}
                  onClick={() => captureScreenshot()}
                >
                  Download Image
                </Button>
              </Box>
            )}
          </>
        </DataContext>

      </ThemeProvider>
    </>
  )
}

export default App
