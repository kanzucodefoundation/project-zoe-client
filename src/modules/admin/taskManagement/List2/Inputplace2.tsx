import React, { useState } from 'react';
import { Paper, Typography } from '@material-ui/core';
import '../ALLstyles/InputPlace.css';
import Inputcard from './Inputcard2';

function Inputplace({ onaddoredit }: { onaddoredit: (value: any) => void }) {
  const [showMe, setShowMe] = useState(true);
  function operation() {
    setShowMe(!showMe);
  }

  return (
    <div className="place">
      {showMe ? <Inputcard onaddoredit={onaddoredit} /> : null}
      <Paper elevation={0} className="inputplace" onClick={() => operation()}>
        <Typography> + Add a Card</Typography>
      </Paper>
    </div>
  );
}

export default Inputplace;
