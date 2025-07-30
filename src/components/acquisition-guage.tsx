import { green, red, yellow } from "@mui/material/colors"
import { useMemo } from "react";
import GaugeComponent, { type SubArc } from "react-gauge-component";
import type { AcquisitionSummary } from "../data/summarizer";
import { Box } from "@mui/material";

export interface AcquisitionsGuageProps {
  acquisitionSummary: AcquisitionSummary;
}
export const AcquisitionGuage = (props: AcquisitionsGuageProps) => {
  const { acquisitionSummary } = props;


  const noData = !acquisitionSummary.totalAcquired || !acquisitionSummary.totalFinished;
  const arcs = useMemo<SubArc[]>(() => {
    let returnArcs: SubArc[] = [];
    const totalFinishedPercent = Math.ceil(acquisitionSummary.totalFinished / acquisitionSummary.totalAcquired * 100);
    const totalPlayedPercent = (acquisitionSummary.totalPlayed / acquisitionSummary.totalAcquired * 100);
    if (totalFinishedPercent > 0) {
      returnArcs.push(
        {
          limit: totalFinishedPercent,
          color: green[500],
          showTick: true,
          tooltip: {
            text: 'Percent of acquired games that were beaten or completed.'
          },
        });
    }
    if (totalPlayedPercent > 0 && totalPlayedPercent > totalFinishedPercent) {
      returnArcs.push(
        {
          limit: totalPlayedPercent,
          color: yellow[700],
          showTick: true,
          tooltip: {
            text: 'Percent of acquired games that were played.'
          }
        });
    }
    if (noData || totalPlayedPercent < 100) {
      returnArcs.push(
        {
          limit: 100,
          color: red[500],
          showTick: true,
          tooltip: {
            text: 'Total games acquired'
          }
        });
    }
    return returnArcs;
  }, [acquisitionSummary]);

  return (
    <Box maxWidth={"600px"} width={"100%"}>
      <GaugeComponent
        type="semicircle"
        arc={{
          width: 0.2,
          padding: 0.005,
          cornerRadius: 1,
          subArcs: arcs
        }}
        pointer={{
          color: '#345243',
          length: 0.90,
          width: 12,
        }}
        labels={{
          valueLabel: { formatTextValue: value => value + '%' },
          tickLabels: {
            type: 'outer',
            defaultTickValueConfig: {
              formatTextValue: (value: any) => value + '%',
              style: { fontSize: 10 }
            },
            ticks: Array.from('1'.repeat(10)).map((n, i) => { return { value: parseInt(n) * (i + 1) * 10 } })
          }
        }}
        value={noData ? 0 : Math.ceil(acquisitionSummary.totalPlayed / acquisitionSummary.totalAcquired * 100)}
        minValue={0}
        maxValue={100}
      // style={{ maxWidth: "500px" }}
      />
    </Box>
  );
}