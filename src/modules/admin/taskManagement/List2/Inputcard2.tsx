import React, { useState } from 'react';
// import { Paper,Button, IconButton, InputBase } from '@material-ui/core';
// import ClearIcon from '@material-ui/icons/Clear'
import '../ALLstyles/InputCard.css';

function Inputcard({ onaddoredit }: { onaddoredit: (value: any) => void }) {
  const [newcard2, setNewCard2] = useState([]);

  const handleclick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCard2((prevCard) => ({
      ...prevCard,
      [e.target.name]: e.target.value,
    }));
  };

  const handlesubmit = (e: any) => {
    onaddoredit(newcard2);
  };

  return (
    <div className="card">
      <form className="confirm" onSubmit={handlesubmit}>
        <input
          name="newcard2"
          placeholder="enter a title for this card"
          value={newcard2}
          onChange={handleclick}
        />
        <button type="submit">Add a new card</button>
      </form>
    </div>
  );
}

export default Inputcard;
