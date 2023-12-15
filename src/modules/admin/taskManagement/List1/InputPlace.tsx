import React, { useState } from 'react';
import { Paper, Typography } from '@material-ui/core';
import '../ALLstyles/InputPlace.css';
import Inputcard from './InputCard';

type InputplaceProps = {
  onAddoredit: (data: any) => void;
};
function Inputplace({ onAddoredit }: InputplaceProps) {
  const [showMe, setShowMe] = useState(true);

  const operation = () => {
    setShowMe(!showMe);
  };

  return (
    <div className="place">
      {showMe ? <Inputcard onaddoredit={onAddoredit} /> : null}

      <Paper elevation={0} className="inputplace" onClick={() => operation()}>
        <Typography> + Add a Card</Typography>
      </Paper>
    </div>
  );
}

export default Inputplace;
