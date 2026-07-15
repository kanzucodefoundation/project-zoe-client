import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Skeleton,
  alpha,
} from '@mui/material';
import { CakeRounded as CakeIcon } from '@mui/icons-material';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface Birthday {
  id: number;
  name: string;
  upcomingDate: string;
  // API provides an optional location field for grouping
  location?: string | null;
}

interface BirthdayResponse {
  birthdays: Birthday[];
}

const BirthdayWidget = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    get(
      remoteRoutes.dashboardBirthdays,
      (response: BirthdayResponse) => {
        setBirthdays(response?.birthdays || []);
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      },
    );
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const groupedBirthdays = (birthdays || []).reduce((acc: Record<string, Birthday[]>, item: Birthday) => {
    const locationKey = item.location || 'General Locations';

    if (!acc[locationKey]) {
      acc[locationKey] = [];
    }
    acc[locationKey].push(item);
    return acc;
  }, Object.create(null) as Record<string, Birthday[]>);
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Birthdays This Week
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'warning.main',
            }}
          >
            <CakeIcon sx={{ fontSize: 22 }} />
          </Box>
        </Stack>

        {/* Content */}
        {loading ? (
          <Stack spacing={1.5}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" width="80%" height={24} />
            ))}
          </Stack>
        ) : error ? (
          <Typography variant="body2" color="text.secondary">
            Unable to load birthdays
          </Typography>
        ) : birthdays.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No birthdays this week
          </Typography>
        ) : (
          <Stack spacing={1.5}>
              {Object.keys(groupedBirthdays).map((locationHeader) => (
                <Box key={locationHeader} sx={{ mb: 3 }}>
                  {/* location header */}
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'text.primary',
                    }}
                  >
                    {locationHeader}
                  </Typography>

                  {/* individual birthday items */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 0.5 }}>
                    {groupedBirthdays[locationHeader].map((birthday: Birthday) => (
                      <Box
                        key={birthday.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2">{birthday.name}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {formatDate(birthday.upcomingDate)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default BirthdayWidget;
