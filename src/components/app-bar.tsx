import * as React from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, Typography } from '@mui/material';
import { DataContext, type UserData } from '../data/data-context';
import { Print, Image, BugReport, Settings, UploadFile, FileDownload } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import SettingsModal from './settings-modal';
import { blue } from '@mui/material/colors';
import { mergeDeep } from '../data/utils';
// import { parseFile, FileInput } from './data-importer';

export default function AppBar() {

  const currentYear = (new Date()).getFullYear();
  const selectableYears = Array.from({ length: 10 }, (_x, i) => currentYear - i);
  const dataContext = React.useContext(DataContext);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const onYearSelectChanged = (e: any) => {
    const year = parseInt(e.target.value?.toString() || currentYear.toString(), 10);
    dataContext.editYear(year);
  }

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log('File change event:', event.target.files);
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     try {
  //       console.log('Getting parsed data');
  //       const result = await parseFile(file);
  //       console.log('Got parsed data: ', result);
  //       dataContext.initialize(result);
  //     } catch (error) {
  //       console.error("Error parsing file:", error);
  //     }
  //   }
  //   event.target.value = '';
  // };

  function exportUserData() {
    const currentUserData = JSON.parse(localStorage.getItem('user-data') || "{}");
    const userDataToSave = mergeDeep(currentUserData, dataContext.data.userData);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(userDataToSave, null, 2)], {
      type: "text/plain"
    }));
    a.setAttribute("download", "backlog-yearly-summary-user-data.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }


  const handleImportUserDataClicked = React.useCallback(() => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).click(); // Trigger the hidden file input
    }
  }, []);

  const ImportUserDataFileSelected = React.useCallback(async (event: any) => {
    console.log("Importing file:", event.target.files[0]);
    const file = event.target.files?.[0];
    if (file) {
      try {
        var reader = new FileReader();

        reader.onload = function (event) {
          const userDataJson = event?.target?.result;
          if (typeof userDataJson === 'string') {
            try {
              localStorage.setItem('user-data', userDataJson);
              const userDataObj = JSON.parse(userDataJson) as UserData;
              dataContext.updateUserData(userDataObj);
            } catch (e) {
              console.error("Invalid JSON in imported file.", e);
            }
          } else {
            console.error("File could not be read as text.");
          }
        }

        const fileText = reader.readAsText(event.target.files[0]);
        console.log('Loaded file', fileText);
      } catch (error) {
      }
    }
    event.target.value = null;
  }, []);


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
        console.error(err);
      });
  }

  return (
    <>
      <input
        id="user-data-file-import"
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={ImportUserDataFileSelected}
      />
      <MuiAppBar position="static" sx={{ backgroundColor: blue[500], maxWidth: "1024px", margin: 'auto' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }} />
          <Select
            label="Year"
            variant="standard"
            value={dataContext.data.year}
            onChange={onYearSelectChanged}
            disableUnderline
            aria-label="Select a different year"
          >
            {selectableYears.map(year => (<MenuItem value={year}>{year}</MenuItem>))}
          </Select>
          <IconButton
            size="large"
            color="inherit"
            aria-label="settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings />
          </IconButton>
        </Toolbar>
      </MuiAppBar>
      {settingsOpen && <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {/* <ListItem disablePadding>
              <ListItemButton
                component="label"
                role={undefined}
              >
                < FileInput
                  onChange={handleFileChange}
                />
                <ListItemIcon>
                  <Upload />
                </ListItemIcon>
                <ListItemText primary="Load CSV" />
              </ListItemButton>
            </ListItem> */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => captureScreenshot()}>
                <ListItemIcon>
                  <Image />
                </ListItemIcon>
                <ListItemText primary="Generate Image" />
              </ListItemButton>
            </ListItem>
            <ListItem sx={{ justifySelf: 'end' }} disablePadding>
              <ListItemButton onClick={() => window.print()}>
                <ListItemIcon>
                  <Print />
                </ListItemIcon>
                <ListItemText primary="Print PDF" />
              </ListItemButton>
            </ListItem>
            <ListItem sx={{ justifySelf: 'end' }} disablePadding>
              <ListItemButton onClick={exportUserData}>
                <ListItemIcon>
                  <FileDownload />
                </ListItemIcon>
                <ListItemText primary="Export User Data" />
              </ListItemButton>
            </ListItem>
            <ListItem sx={{ justifySelf: 'end' }} disablePadding>
              <ListItemButton onClick={handleImportUserDataClicked}>
                <ListItemIcon>
                  <UploadFile />
                </ListItemIcon>
                <ListItemText primary="Import User Data" />
              </ListItemButton>
            </ListItem>
            <ListItem sx={{ justifySelf: 'end' }} disablePadding>
              <ListItemButton onClick={() => window.open('https://github.com/kamencoder/backlog-yearly-summary/issues', '_blank')}>
                <ListItemIcon>
                  <BugReport />
                </ListItemIcon>
                <ListItemText primary="Report Bug" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}