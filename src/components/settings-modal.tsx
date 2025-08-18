import React, { useContext } from 'react';
import { Box, Typography, FormGroup, FormControlLabel, Checkbox, Button, Dialog, DialogContent, DialogActions, Divider } from '@mui/material';
import { DataContext } from '../data/data-context';

const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const dataContext = useContext(DataContext);
  const viewSettings = dataContext.data.userData.viewSettings;

  const [sectionSettings, setSectionSettings] = React.useState(viewSettings?.sectionSettings);
  const [showPlaytimeStats, setShowPlaytimeStats] = React.useState(viewSettings?.showPlaytimeStats);

  const handleSectionVisibilityChange = (key: keyof typeof sectionSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSectionSettings({ ...sectionSettings, [key]: { ...sectionSettings[key], visible: event.target.checked } });
  };
  const setPlatformCombineTotalsAndTime = (value: boolean) => {
    setSectionSettings({ ...sectionSettings, platform: { ...sectionSettings.platform, showPlatformTimeAndGamesCombined: value } });
  }
  const setShowAcquisitionSources = (value: boolean) => {
    setSectionSettings({ ...sectionSettings, acquisitions: { ...sectionSettings.acquisitions, showSources: value } });
  }
  const setShowCosts = (value: boolean) => {
    setSectionSettings({ ...sectionSettings, acquisitions: { ...sectionSettings.acquisitions, showCosts: value } });
  }

  const handleSave = () => {
    dataContext.editViewSettings({
      sectionSettings,
      showPlaytimeStats,
    })
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} scroll="body">
      <DialogContent >
        <Typography variant="h5" gutterBottom>Settings</Typography>
        <FormGroup>
          <Typography fontWeight={700} fontSize={18} marginBottom={0.5} sx={{ mt: 2 }}>General</Typography>
          <FormControlLabel
            sx={{ ml: 3 }}
            control={
              <Checkbox
                checked={showPlaytimeStats}
                onChange={e => {
                  setShowPlaytimeStats(e.target.checked)
                  if (!e.target.checked) {
                    setSectionSettings({
                      ...sectionSettings,
                      platform: { ...sectionSettings.platform, showPlatformTimeAndGamesCombined: false },
                      gameLength: { ...sectionSettings.gameLength, visible: false }
                    });
                  }

                }}
              />
            }
            label="Use Playtime Stats"
          />
        </FormGroup>
        <Divider />
        <FormGroup>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={sectionSettings.platform.visible}
                onChange={handleSectionVisibilityChange('platform' as keyof typeof sectionSettings)}
              />
            }
            label={<Typography fontWeight={700} fontSize={18}>Platform Section</Typography>}
          />
          <FormControlLabel
            sx={{ ml: 3 }}
            control={
              <Checkbox
                disabled={!showPlaytimeStats}
                checked={sectionSettings.platform.showPlatformTimeAndGamesCombined}
                onChange={e => setPlatformCombineTotalsAndTime(e.target.checked)}
              />
            }
            label="Combine Totals and Time"
          />
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                disabled={!showPlaytimeStats}
                checked={sectionSettings.gameLength.visible}
                onChange={handleSectionVisibilityChange('gameLength' as keyof typeof sectionSettings)}
              />
            }
            label={<Typography fontWeight={700} fontSize={18}>Game Length Section</Typography>}
          />
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={sectionSettings.decade.visible}
                onChange={handleSectionVisibilityChange('decade' as keyof typeof sectionSettings)}
              />
            }
            label={<Typography fontWeight={700} fontSize={18}>Decade Section</Typography>}
          />
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={sectionSettings.acquisitions.visible}
                onChange={handleSectionVisibilityChange('acquisitions' as keyof typeof sectionSettings)}
              />
            }
            label={<Typography fontWeight={700} fontSize={18}>Backlog Additions</Typography>}
          />
          <FormControlLabel
            sx={{ ml: 3 }}
            control={
              <Checkbox
                checked={sectionSettings.acquisitions.showSources}
                onChange={e => setShowAcquisitionSources(e.target.checked)}
              />
            }
            label="Show Sources"
          />
          <FormControlLabel
            sx={{ ml: 3 }}
            control={
              <Checkbox
                checked={sectionSettings.acquisitions.showCosts}
                onChange={e => setShowCosts(e.target.checked)}
              />
            }
            label="Show Costs"
          />
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={sectionSettings.monthly.visible}
                onChange={handleSectionVisibilityChange('monthly' as keyof typeof sectionSettings)}
              />
            }
            label={<Typography fontWeight={700} fontSize={18}>Monthly Overview</Typography>}
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;