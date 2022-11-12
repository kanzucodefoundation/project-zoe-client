import { createStyles, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => createStyles({
  calendarHeading: {
    position: 'sticky',
    top: 0,
    paddingTop: '20px',
    paddingBottom: '20px',
    left: 'auto',
    zIndex: 1,
    background: '#fff',
    color: '#263238',
  },
}));
