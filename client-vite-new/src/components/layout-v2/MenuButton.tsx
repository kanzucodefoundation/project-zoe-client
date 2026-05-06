import Badge, { badgeClasses } from '@mui/material/Badge';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';

export interface MenuButtonProps extends IconButtonProps {
  showBadge?: boolean;
}

export default function MenuButton({
  showBadge = false,
  sx,
  ...props
}: MenuButtonProps) {
  return (
    <Badge
      color="error"
      variant="dot"
      invisible={!showBadge}
      sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
    >
      <IconButton
        size="small"
        sx={[
          {
            width: { xs: 40, md: 34 },
            height: { xs: 40, md: 34 },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    </Badge>
  );
}
