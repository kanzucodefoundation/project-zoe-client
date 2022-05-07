import React from 'react';
import { Box, colors, Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

interface IProps {
  text: string;
}

const WarmMessage = (props: IProps) => (
    <Box display="flex" p={4} justifyContent="center">
      <Paper style={{ backgroundColor: colors.orange[50] }} elevation={0}>
        <Box p={3}>
          <Typography>{props.text}&nbsp;!</Typography>
        </Box>
      </Paper>
    </Box>
);

export default WarmMessage;
