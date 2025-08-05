import React, { useContext } from 'react';
import Papa, { type ParseResult } from 'papaparse';
import { type CsvData } from '../data/DataContext';
import { DataContext } from '../data/DataContext';
import { Box, Button, Link, List, ListItem, MenuItem, Select, styled, Typography } from '@mui/material';
import { UploadFile } from '@mui/icons-material';

export const FileInput: React.FC<{ onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }> = ({ onChange }) => {
  const StyledFileInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  })
  return <StyledFileInput type="file" accept=".csv" onChange={onChange} />;
};

export const parseFile = (file: File): Promise<CsvData[]> => {
  return new Promise<CsvData[]>((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }
    Papa.parse<CsvData>(file, {
      header: true,
      dynamicTyping: true,
      complete: (results: ParseResult<CsvData>) => {
        resolve(results.data);
      },
      error: (error: unknown) => {
        reject(error);
      },
    });
  });
}

const DataImporter = () => {

  const currentYear = (new Date()).getFullYear();
  const selectableYears = Array.from({ length: 10 }, (_x, i) => currentYear - i);
  const dataContext = useContext(DataContext);
  // const [ csvData, setCsvData ] = React.useState<CsvData[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const result = await parseFile(file);
        dataContext.initialize(result);
      } catch (error) {
        console.error("Error parsing file:", error);
      }
    }
    event.target.value = '';
  };

  return (
    <>
      {!dataContext?.data?.games?.length
        && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            flexDirection="column"
          >
            <Typography variant='subtitle1'>Infinite Backlog</Typography>
            <Typography variant='h2' textAlign="center" gutterBottom>Yearly Summary</Typography>
            <Box sx={{ alignItems: "left" }} >
              <List >
                <ListItem>
                  <Typography variant='body2'>1. Navigate to <Link href="https://infinitebacklog.net/settings/export">Infinite Backlog Export Page</Link></Typography>
                </ListItem>
                <ListItem>
                  <Typography variant='body2'>2. Export "Game Collection" to a CSV file</Typography>
                </ListItem>
                <ListItem>
                  <Typography variant='body2'>3. Click Load CSV here and import the file</Typography>
                </ListItem>
              </List>
            </Box >
            <Select
              label="Year"
              value={dataContext.data.year}
              onChange={(e) => { dataContext.editYear(parseInt(e.target.value?.toString() || "0", 10)) }}
              size="small"
              sx={{ marginBottom: "12px" }}
            >
              {selectableYears.map(year => (<MenuItem value={year}>{year}</MenuItem>))}
            </Select>
            < Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={< UploadFile />}
            >
              Load CSV
              < FileInput onChange={handleFileChange} />
            </Button >
          </Box >
        )}
    </>
  );
}

export default DataImporter;