import { Card, CardContent, Stack, Typography, Grid, Accordion, AccordionSummary, AccordionDetails, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert, IconButton, Menu, MenuItem, FormControlLabel, Switch } from '@mui/material';
import InfoIcon from '../../../components/info-icon';
import { SingleStat } from '../../../components/single-stat';
import { AcquisitionGuage } from '../../../components/acquisition-guage';
import { Warning, ExpandMore, Settings } from '@mui/icons-material';
import { red, yellow, green, blue, purple } from '@mui/material/colors';
import { useContext, useMemo, useState } from 'react';
import { DataContext } from '../../../data/data-context';
import { formatCurrency } from '../../../data/formatters';
import { BarChart } from '@mui/x-charts';

export const AcquisitionsSection = () => {
  const dataContext = useContext(DataContext);
  const { summary, userData } = dataContext.data;
  const sectionSettings = userData.viewSettings.sectionSettings.acquisitions;

  const { editViewSettings } = dataContext;
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const handleMenuClick = (event: any) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const handleHide = () => handleViewSettingChange('visible', false);
  const handleShowSources = (e: any) => handleViewSettingChange('showSources', e.target.checked);
  const handleShowCosts = (e: any) => handleViewSettingChange('showCosts', e.target.checked);
  const handleViewSettingChange = (settingName: 'visible' | 'showCosts' | 'showSources', enabled: boolean) => {
    editViewSettings({ sectionSettings: { acquisitions: { [settingName]: enabled } } });
    handleMenuClose();
  };
  const gamesAcquired = useMemo(() => {
    return summary?.games.filter(g => g.acquiredThisYear)
  }, [summary?.games])

  if (!summary) {
    return null; // or some loading state
  }
  if (!sectionSettings.visible) {
    return null;
  }

  // const acquisitionSourceSeries: MakeOptional<BarSeriesType, "type">[] = []

  return (
    <Grid size={12} role="region" aria-labelledby="acquisitions-section-title">
      <Card variant="outlined" role="region" aria-labelledby="acquisitions-section-title">
        <CardContent>
          <Stack direction={"row"}>
            <Typography id="acquisitions-section-title" flex={1} variant="h6" gutterBottom component="h2">
              Backlog Additions
            </Typography>
            <InfoIcon text="Includes games acquired within this year based on the Acquisition Date set on the game in IB. The number of games played includes total number of games among those acquired this year which are marked as playing or played. The total number acquired includes all games with an aquisition date this year. The total number of 'backlogged' games excludes those with No Status and any DLC games. The number of games finished includes total number of those acquired this year which are marked beaten or completed." />
            <IconButton size="small" onClick={handleMenuClick} aria-label="settings">
              <Settings />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleMenuClose}>
              <MenuItem onClick={handleHide}>Hide</MenuItem>
              <MenuItem>
                <FormControlLabel control={
                  <Switch
                    size="small"
                    checked={sectionSettings.showSources}
                    onChange={handleShowSources}
                  />}
                  label="Show Sources"
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel control={
                  <Switch
                    size="small"
                    checked={sectionSettings.showCosts}
                    onChange={handleShowCosts}
                  />}
                  label="Show Costs"
                />
              </MenuItem>
            </Menu>
          </Stack>
          {!summary.acquisitions.totalAcquired && (
            <Alert variant="outlined" icon={<Warning fontSize="inherit" />} severity="warning" sx={{ marginBottom: '16px' }}>
              You must fill in the "Acquisition Date" on your games in order for this tool to be able to tell that you bought or received them this year.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, md: 3 }} flexWrap={"wrap"}>
              <Stack spacing={1} direction={{ xs: "row", sm: "row", md: "row" }} justifyContent={"center"} flexWrap="wrap" role="list" aria-label="Acquisition statistics">
                <SingleStat value={summary.acquisitions.totalAcquired} label="Acquired" color={purple[300]} role="listitem" />
                <SingleStat value={summary.acquisitions.totalAddedToBacklog} label="Backlogged" color={red[500]} role="listitem" />
              </Stack>
              <Stack spacing={1} direction={{ xs: "row", sm: "row", md: "row" }} justifyContent={"center"} flexWrap="wrap" role="list" aria-label="Acquisition status statistics">
                <SingleStat value={summary.acquisitions.totalPlayed} label="Played" color={yellow[700]} role="listitem" />
                <SingleStat value={summary.acquisitions.totalBeaten + summary.acquisitions.totalCompleted} label="Finished" color={green[500]} role="listitem" />
                <SingleStat value={summary.acquisitions.totalContinuous} label="Continuous" color={green[900]} role="listitem" />
                <SingleStat value={summary.acquisitions.totalDropped} label="Dropped" color={green[900]} role="listitem" />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 9 }} display={"flex"} justifyContent={"center"}>
              <AcquisitionGuage acquisitionSummary={summary.acquisitions} />
            </Grid>

            <Grid size={12}>
              {sectionSettings.showCosts && <Typography flex={1} variant="h6" gutterBottom>Total Spent: {formatCurrency(summary.acquisitions.totalMoneySpent)}</Typography>}
              {sectionSettings.showSources && (
                <BarChart
                  dataset={summary.acquisitionSourceTotals as any}
                  yAxis={[{
                    dataKey: 'acquisitionSource',
                    scaleType: 'band', width: 140,
                  }]}
                  xAxis={[
                    {
                      label: sectionSettings.showCosts ? "% of Games / Cost" : "% of Games",
                      id: 'totalGamesAxis',
                      valueFormatter: (value: any) => `${value}%`
                    },
                    { label: "% of Cost", id: 'totalCostAxis' },
                  ]}
                  series={[
                    {
                      dataKey: 'percentOfTotalGames', xAxisId: 'totalGamesAxis',
                      label: "% of Games", color: blue[500],
                      valueFormatter: (x, context) => {
                        const totalGames = summary.acquisitionSourceTotals[context.dataIndex].totalGames;
                        return `${x}% (${totalGames} game${totalGames !== 1 ? 's' : ''})`;
                      },
                    },
                    ...(sectionSettings.showCosts ? [{
                      dataKey: 'percentOfTotalCost', xAxisId: 'totalCostAxis',
                      label: "% of Cost", color: green[500],
                      valueFormatter: (x: any, context: any) => {
                        const totalCost = summary.acquisitionSourceTotals[context.dataIndex].totalCost;
                        return `${x}% (${formatCurrency(totalCost)})`;
                      },
                    }] : [])
                  ]}
                  layout="horizontal"
                  sx={{ height: `${32 * (summary.acquisitionSourceTotals.length < 8 ? 8 : summary.acquisitionSourceTotals.length)}px` }}
                  aria-label="Bar chart showing percent of games and cost by acquisition source"
                  aria-labelledby="acquisitions-section-title"
                />
              )}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography component="span">Acquired Game List</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table aria-label="Acquired Games" role="table" aria-describedby="acquired-games-caption">
                      <caption id="acquired-games-caption" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
                        Table of all games acquired this year, including platform, cost, source, and date acquired.
                      </caption>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Platform</TableCell>
                          {sectionSettings.showCosts && <TableCell>Cost</TableCell>}
                          {sectionSettings.showSources && <TableCell>Source</TableCell>}
                          <TableCell>Date Acquired</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {gamesAcquired?.map(g => (
                          <TableRow key={g.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">{g.title}{g.type === "DLC / Expansion" ? ' [DLC]' : ''}</TableCell>
                            <TableCell>{g.platform}</TableCell>
                            {sectionSettings.showCosts && <TableCell>{formatCurrency(g.amountPaid)}</TableCell>}
                            {sectionSettings.showSources && <TableCell>{g.acquisitionSource}</TableCell>}
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
