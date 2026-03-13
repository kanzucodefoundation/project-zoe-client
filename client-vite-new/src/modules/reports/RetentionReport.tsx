import { useState } from 'react';
import {
  Container, Typography, Box, ToggleButtonGroup, ToggleButton,
  Grid, Card, CardContent, Skeleton,
} from '@mui/material';
import { useRetentionReport } from '../tasks/hooks';

type Window = 'month' | '90days' | 'ytd';

interface StatCard {
  label: string;
  key: keyof import('../../utils/types').RetentionSummary;
}

const CARDS: StatCard[] = [
  { label: 'Recorded', key: 'recorded' },
  { label: 'Retained', key: 'retained' },
  { label: 'Joined Fellowship', key: 'joinedFellowship' },
  { label: 'Joined Serving Team', key: 'joinedServingTeam' },
  { label: 'Baptised', key: 'baptised' },
];

export default function RetentionReport() {
  const [selectedWindow, setSelectedWindow] = useState<Window>('month');
  const { data, isLoading } = useRetentionReport(selectedWindow);

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4">Retention Report</Typography>
      </Box>

      <Box mb={3}>
        <ToggleButtonGroup
          exclusive
          value={selectedWindow}
          onChange={(_, val) => val && setSelectedWindow(val)}
        >
          <ToggleButton value="month">This Month</ToggleButton>
          <ToggleButton value="90days">Last 90 Days</ToggleButton>
          <ToggleButton value="ytd">Year to Date</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {CARDS.map(({ label, key }) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={key}>
            <Card sx={{ textAlign: 'center', p: 1 }}>
              <CardContent>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" mb={1}>
                    <Skeleton variant="rectangular" width={60} height={60} />
                  </Box>
                ) : (
                  <Typography variant="h3" fontWeight="bold">
                    {data?.[key] ?? 0}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
