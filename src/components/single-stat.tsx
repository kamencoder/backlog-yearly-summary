import { Typography, Box } from "@mui/material"
import { useMemo, type ReactElement } from "react";


export interface SingleStatProps {
  value: string | number | null;
  label: ReactElement | string;
  color?: string;
  role?: string;
  size?: "sm" | "md" | "lg";
  useFixedWidth?: boolean;
}

export const SingleStat = (props: SingleStatProps) => {
  const { value, label, color, role, size, useFixedWidth } = props;

  const sizes = useMemo(() => {
    switch (size) {
      case 'lg': {
        return {
          fixedWidth: "120px",
          labelFontSize: 14,
          valueFontSize: 38,
        }
      }
      case 'sm': {
        return {
          fixedWidth: "70px",
          labelFontSize: 10,
          valueFontSize: 24,
        }
      }
      case 'md':
      default: {
        return {
          fixedWidth: "90px",
          labelFontSize: 14,
          valueFontSize: 38,
        }
      }
    }
  }, [size]);

  return (
    <Box flexDirection="column-reverse" display="flex" role={role} style={{ textAlign: "center", margin: "10px", width: useFixedWidth ? sizes.fixedWidth : undefined }}>
      <Box flex={1}><Typography fontSize={sizes.labelFontSize} color={color}>{label}</Typography></Box>
      <Box flex={1}><Typography fontSize={sizes.valueFontSize} color={color} fontWeight={900}>{value}</Typography></Box>
    </Box>
  )
}