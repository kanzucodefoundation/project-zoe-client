import React from 'react';
import { Paper, IconButton } from '@material-ui/core';
import '../ALLstyles/Card.css';
import DeleteIcon from '@material-ui/icons/DeleteForever';

function Card(props: any) {
  return (
    <div>
      <Paper className="card">
        {props.rap}
        <IconButton aria-label="delete">
          <DeleteIcon onClick={props.handledelete} />
        </IconButton>
      </Paper>
    </div>
  );
}

export default Card;
