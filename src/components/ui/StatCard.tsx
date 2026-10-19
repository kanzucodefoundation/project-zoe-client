import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import { semantic } from '../../theme-wh/tokens';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string;
    direction: 'up' | 'down' | 'flat';
    caption: string;
  };
  icon?: SvgIconComponent;
  increaseIsGood?: boolean;
  valueColor?: string;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  increaseIsGood = true,
  valueColor,
  loading = false,
}: StatCardProps) {
  const trendColor =
    !delta || delta.direction === 'flat'
      ? 'text.secondary'
      : (delta.direction === 'up') === increaseIsGood
        ? 'success.main'
        : 'error.main';

  const TrendIcon =
    delta?.direction === 'down' ? TrendingDownRoundedIcon : TrendingUpRoundedIcon;

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            component="h3"
            color="text.secondary"
            gutterBottom
          >
            {label}
          </Typography>

          {loading ? (
            <Skeleton variant="text" width="60%" height={40} />
          ) : (
            <Typography
              variant="h4"
              component="p"
              sx={{
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: valueColor,
              }}
            >
              {value}
            </Typography>
          )}

          {delta && !loading && (
            <Tooltip title={delta.caption}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                  color: trendColor,
                  minWidth: 0,
                }}
              >
                {delta.direction !== 'flat' && (
                  <TrendIcon sx={{ fontSize: 15 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: 'inherit', fontWeight: 600 }}
                >
                  {delta.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {delta.caption}
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>

        {Icon && (
          <Box
            sx={(theme) => ({
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              ...theme.applyStyles('dark', {
                color: semantic.dark.brandText,
                backgroundColor: alpha('#FFFFFF', 0.08),
              }),
            })}
          >
            <Icon sx={{ fontSize: 28 }} />
          </Box>
        )}
      </Stack>
    </Card>
  );
}
