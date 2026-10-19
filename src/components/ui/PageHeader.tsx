import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface PageHeaderProps {
  title: string;
  /** Buttons for this screen, right-aligned from `sm` up. */
  actions?: React.ReactNode;
  /** Context chips: a count, the active period, a status. */
  meta?: React.ReactNode;
}

export default function PageHeader({
  title,
  actions,
  meta,
}: PageHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4">{title}</Typography>

        {meta && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1.5 }}
          >
            {meta}
          </Stack>
        )}
      </Box>

      {actions && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexShrink: 0,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          {actions}
        </Stack>
      )}
    </Box>
  );
}
