import React, { useContext } from 'react';
import { Modal, Box, Typography, FormGroup, FormControlLabel, Checkbox, Button } from '@mui/material';
import { DataContext } from '../data/data-context';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  minWidth: 300,
};

const sectionLabels: Record<string, string> = {
  showPlatformSection: 'Platform Section',
  showGameLengthSection: 'Game Length Section',
  showDecadeSection: 'Decade Section',
  showMonthlyOverview: 'Monthly Overview',
  showMonthlyGames: 'Monthly Games',
};

const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const dataContext = useContext(DataContext);
  const viewSettings = dataContext.data.userData.viewSettings;

  const [sectionVisibility, setSectionVisibility] = React.useState(viewSettings?.sectionVisibility);
  const [showPlaytimeStats, setShowPlaytimeStats] = React.useState(viewSettings?.showPlaytimeStats);
  const [showAcquisitionStats, setShowAcquisitionStats] = React.useState(viewSettings?.showAcquisitionStats);

  const handleSectionChange = (key: keyof typeof sectionVisibility) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSectionVisibility({ ...sectionVisibility, [key]: event.target.checked });
  };

  const handleSave = () => {
    dataContext.editViewSettings({
      sectionVisibility,
      showPlaytimeStats,
      showAcquisitionStats,
    })
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" gutterBottom>Settings</Typography>
        <FormGroup>
          <Typography fontWeight={700} gutterBottom sx={{ mt: 2 }}>Stats</Typography>
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                checked={showPlaytimeStats}
                onChange={e => setShowPlaytimeStats(e.target.checked)}
              />
            }
            label="Playtime Stats"
          />
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                checked={showAcquisitionStats}
                onChange={e => setShowAcquisitionStats(e.target.checked)}
              />
            }
            label="Acquisition Stats"
          />
        </FormGroup>
        <FormGroup>
          <Typography fontWeight={700} gutterBottom>Sections</Typography>
          {Object.entries(sectionLabels).map(([key, label]) => (
            <FormControlLabel
              sx={{ ml: 1 }}
              key={key}
              control={
                <Checkbox
                  checked={sectionVisibility[key as keyof typeof sectionVisibility]}
                  onChange={handleSectionChange(key as keyof typeof sectionVisibility)}
                />
              }
              label={label}
            />
          ))}
        </FormGroup>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SettingsModal;