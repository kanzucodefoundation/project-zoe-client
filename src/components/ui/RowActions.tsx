import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export interface RowAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface RowActionsProps {
  actions: RowAction[];
  subject?: string;
}

export default function RowActions({ actions, subject }: RowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const close = () => setAnchorEl(null);

  const available = actions.filter(Boolean);
  if (available.length === 0) return null;

  return (
    <>
      <IconButton
        size="small"
        aria-label={subject ? `Actions for ${subject}` : 'Actions'}
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClick={(event) => event.stopPropagation()}
      >
        {available.map((action) => (
          <MenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={() => {
              close();
              action.onClick();
            }}
          >
            {action.icon && (
              <ListItemIcon sx={{ color: 'inherit' }}>
                {action.icon}
              </ListItemIcon>
            )}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
