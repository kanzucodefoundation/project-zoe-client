import React from 'react';
import { Paper, IconButton } from '@material-ui/core';
import '../ALLstyles/Card.css';
import DeleteIcon from '@material-ui/icons/DeleteForever';

// Define the type for your props
interface CardProps {
  rap: React.ReactNode;
  handledelete: (index: any) => void;
}

// Use the defined type for props
function Card(props: CardProps) {
  return (
    <div>
      <Paper className="card">
        {props.rap}
        <IconButton aria-label="delete" onClick={props.handledelete}>
          <DeleteIcon />
        </IconButton>
      </Paper>
    </div>
  );
}

export default Card;
