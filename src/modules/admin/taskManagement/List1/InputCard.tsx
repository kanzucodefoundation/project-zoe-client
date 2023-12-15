import React, { useState } from 'react';
import '../ALLstyles/InputCard.css';

type InputCardProps = {
  onaddoredit: (newcard: string) => void;
};

function Inputcard({ onaddoredit }: InputCardProps) {
  const [newcard, setNewCard] = useState('');

  const handleclick = (e: any) => {
    setNewCard(e.target.value);
  };

  const handlesubmit = (e: any) => {
    e.preventDefault();
    onaddoredit(newcard);
    setNewCard('');
  };

  return (
    <div className="card">
      <form className="confirm" onSubmit={handlesubmit}>
        <input
          name="newcard"
          placeholder="enter a title for this card"
          value={newcard}
          onChange={handleclick}
        />
        <button type="submit">Add a new card</button>
      </form>
    </div>
  );
}

export default Inputcard;
