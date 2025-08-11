import { Card, CardContent, Stack, Typography, Grid, Accordion, AccordionSummary, AccordionDetails, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, IconButton, Menu, MenuItem } from '@mui/material';
import InfoIcon from '../../../components/info-icon';
import { SingleStat } from '../../../components/single-stat';
import { AcquisitionGuage } from '../../../components/acquisition-guage';
import { Warning, ExpandMore, Settings } from '@mui/icons-material';
import { red, yellow, green } from '@mui/material/colors';
import { useContext, useState } from 'react';
import { DataContext } from '../../../data/data-context';

export const AcquisitionsSection = () => {
  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;

  if (!summary) {
    return null; // or some loading state
  }
  if (!userData.viewSettings.sectionVisibility.showAcquisitions) {
    return null;
  }
  const { editViewSettings } = dataContext;
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const handleMenuClick = (event: any) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const handleHide = () => {
    editViewSettings({ sectionVisibility: { showAcquisitions: false } });
    handleMenuClose();
  };

  return (
    <Grid size={12}>
      <Card variant="outlined">
        <CardContent>
          <Stack direction={"row"}>
            <Typography flex={1} variant="h6" gutterBottom>Backlog Additions</Typography>
            <InfoIcon text="Includes games acquired within this year based on the Acquisition Date set on the game in IB. The number of games played includes total number of games among those acquired this year which are marked as playing or played. The number of games finished includes total number of those acquired this year which are marked beaten or completed." />
            <IconButton size="small" onClick={handleMenuClick} aria-label="settings">
              <Settings />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleMenuClose}>
              <MenuItem onClick={handleHide}>Hide</MenuItem>
            </Menu>
          </Stack>
          {!summary.acquisitions.totalAcquired && (
            <Alert variant="outlined" icon={<Warning fontSize="inherit" />} severity="warning" sx={{ marginBottom: '16px' }}>
              You must fill in the "Acquisition Date" on your games in order for this tool to be able to tell that you bought or received them this year.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, md: 2 }}>
              <Stack spacing={1} direction={{ xs: "row", sm: "row", md: "column" }} justifyContent={"center"} flexWrap="wrap">
                <SingleStat value={summary.acquisitions.totalAcquired} label="Acquired" color={red[500]} />
                <SingleStat value={summary.acquisitions.totalPlayed} label="Played" color={yellow[700]} />
                <SingleStat value={summary.acquisitions.totalFinished} label="Finished" color={green[500]} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 10 }} display={"flex"} justifyContent={"center"}>
              <AcquisitionGuage acquisitionSummary={summary.acquisitions} />
            </Grid>
            <Grid size={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography component="span">Acquired Game List</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table aria-label="Acquired Games">
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Platform</TableCell>
                          <TableCell>Date Acquired</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.games.filter(g => g.acquiredThisYear).map(g => (
                          <TableRow key={g.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">{g.title}</TableCell>
                            <TableCell>{g.platform}</TableCell>
                            <TableCell>{g.acquisitionDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default AcquisitionsSection;
