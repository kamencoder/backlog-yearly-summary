import React from 'react';
import IconButton from '@mui/material/IconButton';
import { Info } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener'; // Needed for making the tooltip on click/tap dismissible

export interface InfoIconProps {
  text: string;
}
function InfoIcon(props: InfoIconProps) {
  const { text } = props;
  const [openTooltip, setOpenTooltip] = React.useState(false);

  const handleTooltipOpen = () => {
    setOpenTooltip(true);
  };

  const handleTooltipClose = () => {
    setOpenTooltip(false);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        title={text}
        open={openTooltip}
        onClose={handleTooltipClose}
        disableHoverListener // Disable hover behavior on desktop
        disableFocusListener // Disable focus behavior
        // disableTouchListener  // If you want to use the default mobile long-press for tooltip, keep this commented out
        arrow // Add an arrow to the tooltip
      >
        <IconButton onClick={handleTooltipOpen} aria-label="info">
          <Info fontSize="small" />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
}

export default InfoIcon;