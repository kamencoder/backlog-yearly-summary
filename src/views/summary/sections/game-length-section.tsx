import { Card, CardContent, Stack, Typography } from '@mui/material';
import InfoIcon from '../../../components/info-icon';
import { LineChart } from '@mui/x-charts';
import { blue, yellow } from '@mui/material/colors';
import { useContext } from 'react';
import { DataContext } from '../../../data/data-context';

export const GameLengthSection = () => {
  const dataContext = useContext(DataContext);
  const { summary } = dataContext.data;

  if (!summary) {
    return null; // or some loading state
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={"row"}>
          <Typography flex={1} variant="h6" gutterBottom>Game Lengths</Typography>
          <InfoIcon text="Includes number of games finished (beat/complete) within this year based on the Completion Date set on the game in IB. Game length is determined by your Playtime entered for each game." />
        </Stack>
        <LineChart
          title="Game Lengths"
          dataset={summary.lengthGroupTotals as any}
          xAxis={[{ dataKey: 'lengthGroup', scaleType: 'band', label: "Game Length by playtime" }]}
          yAxis={[
            { id: 'totalGames', scaleType: 'linear', position: 'left', label: 'Games Finished', labelStyle: { fill: blue[500], fontSize: "16px" } },
            { id: 'totalTime', scaleType: 'linear', position: 'right', label: 'Total Time Spent (hrs)', labelStyle: { fill: yellow[700], fontSize: "16px" } },
          ]}
          series={[
            { dataKey: 'totalGames', yAxisId: 'totalGames', label: 'Games Finished', color: blue[500] },
            { dataKey: 'totalTimeSpent', yAxisId: 'totalTime', label: 'Total Time (hrs)', color: yellow[700] }
          ]}
          height={250}
        />
      </CardContent>
    </Card>
  );
}

export default GameLengthSection;
