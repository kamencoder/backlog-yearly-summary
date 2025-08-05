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
import { useDataController } from './data/use-data-controller';

function App() {

  const { data, initialize, editGame } = useDataController();

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
            editGame,
            initialize,
          }}>
          <>
            <CsvImporter />
            {data.summary && (
              <YearSummary />
            )}
            {data.summary && (
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
