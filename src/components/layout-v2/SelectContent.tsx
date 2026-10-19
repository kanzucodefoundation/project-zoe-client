import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import { layout } from '../../theme-wh/tokens';

interface SelectContentProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

/**
 * The brand lockup at the head of the rail.
 *
 * Sized to the top bar so the mark, the breadcrumb and the page title all sit
 * on one line across the shell.
 */
export default function SelectContent({
  collapsed = false,
  onToggleCollapsed,
}: SelectContentProps) {
  return (
    <Box
      sx={{
        height: layout.topbarHeight,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: collapsed ? 0 : 1.5,
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        {/* The initials tile stands in for the wordmark only when there is no
            room for it; it is not the brand's own mark. */}
        {collapsed ? (
          <Avatar
            variant="rounded"
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            PZ
          </Avatar>
        ) : (
          <Typography variant="h5" noWrap sx={{ lineHeight: 1.25 }}>
            Project Zoe
          </Typography>
        )}
      </Box>

      {!collapsed && onToggleCollapsed && (
        <Tooltip title="Collapse sidebar">
          <IconButton
            size="small"
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            <MenuOpenRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
