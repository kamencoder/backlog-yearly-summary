import { Typography, Box } from "@mui/material"
import type { ReactElement } from "react";

export interface SingleStatProps {
  value: string | number | null;
  label: ReactElement | string;
  color?: string;
}

export const SingleStat = (props: SingleStatProps) => {
  const { value, label, color } = props;
  return (
    <Box style={{ textAlign: "center", margin: "10px", width: "90px" }}>
      <Box><Typography fontSize={38} color={color} fontWeight={900}>{value}</Typography></Box>
      <Box><Typography fontSize={14} color={color}>{label}</Typography></Box>
    </Box>
  )
}