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
          <Typography fontWeight={700} marginBottom={0.5} sx={{ mt: 2 }}>General</Typography>
          <FormControlLabel
            sx={{ ml: 1 }}
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
          <Typography fontWeight={700} marginTop={2} marginBottom={0.5}>Platform Section</Typography>
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                checked={sectionSettings.platform.visible}
                onChange={handleSectionVisibilityChange('platform' as keyof typeof sectionSettings)}
              />
            }
            label="Visible"
          />
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                disabled={!showPlaytimeStats}
                checked={sectionSettings.platform.showPlatformTimeAndGamesCombined}
                onChange={e => setPlatformCombineTotalsAndTime(e.target.checked)}
              />
            }
            label="Combine Totals and Time"
          />
          <Divider />
          <Typography fontWeight={700} marginTop={2} marginBottom={0.5}>Game Length Section</Typography>
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                disabled={!showPlaytimeStats}
                checked={sectionSettings.gameLength.visible}
                onChange={handleSectionVisibilityChange('gameLength' as keyof typeof sectionSettings)}
              />
            }
            label="Visible"
          />
          <Divider />
          <Typography fontWeight={700} marginTop={2} marginBottom={0.5}>Decade Section</Typography>
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                checked={sectionSettings.decade.visible}
                onChange={handleSectionVisibilityChange('decade' as keyof typeof sectionSettings)}
              />
            }
            label="Visible"
          />
          <Divider />
          <Typography fontWeight={700} marginTop={2} marginBottom={0.5}>Backlog Additions</Typography>
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                checked={sectionSettings.acquisitions.visible}
                onChange={handleSectionVisibilityChange('acquisitions' as keyof typeof sectionSettings)}
              />
            }
            label="Visible"
          />
          <Divider />
          <Typography fontWeight={700} marginTop={2} marginBottom={0.5}>Monthly Overview</Typography>
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                checked={sectionSettings.monthly.visible}
                onChange={handleSectionVisibilityChange('monthly' as keyof typeof sectionSettings)}
              />
            }
            label="Visible"
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