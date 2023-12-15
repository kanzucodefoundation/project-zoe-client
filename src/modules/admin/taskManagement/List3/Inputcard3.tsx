import React, { useState } from 'react';
// import { Paper,Button, IconButton, InputBase } from '@material-ui/core';
// import ClearIcon from '@material-ui/icons/Clear'
import '../ALLstyles/InputCard.css';

function Inputcard({ onaddoredit }: { onaddoredit: (data: any) => void }) {
  const [newcard3, setNewCard3] = useState([]);
  const handleclick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCard3((prevCard) => ({
      ...prevCard,
      [e.target.name]: e.target.value,
    }));
  };

  const handlesubmit = (e: any) => {
    onaddoredit(newcard3);
  };

  return (
    <div className="card">
      <form className="confirm" onSubmit={handlesubmit}>
        <input
          name="newcard3"
          placeholder="enter a title for this card"
          value={newcard3}
          onChange={handleclick}
        />
        <button type="submit">Add a new card</button>
      </form>
    </div>
  );
}

export default Inputcard;
