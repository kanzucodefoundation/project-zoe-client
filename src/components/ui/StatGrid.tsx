import Box from '@mui/material/Box';

export default function StatGrid({
  children,
  min = 180,
}: {
  children: React.ReactNode;
  /** Smallest a card may get before the row wraps. */
  min?: number;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        },
        gap: 2,
        mb: 3,
      }}
    >
      {children}
    </Box>
  );
}
