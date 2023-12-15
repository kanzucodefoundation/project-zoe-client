import React, { useState, useRef } from 'react';
import '../ALLstyles/Title.css';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

function Title() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [titleInfo, setTitleInfo] = useState({
    value: 'Add Title',
    isInEditMode: false,
  });

  const changeEditmode = () => {
    setTitleInfo((prevInfo) => ({
      ...prevInfo,
      isInEditMode: !titleInfo.isInEditMode,
    }));
  };

  const updateComponentValue = () => {
    if (inputRef.current !== null) {
      setTitleInfo((prevInfo) => ({
        ...prevInfo,
        isInEditMode: false,
        value: inputRef.current?.value || '',
      }));
    }
  };

  const renderEditView = () => {
    return (
      <div>
        <input type="text" defaultValue={titleInfo.value} ref={inputRef} />
        <button onClick={changeEditmode}>X</button>
        <button onClick={updateComponentValue}>yes</button>
      </div>
    );
  };
  const renderDefaultView = () => {
    return <div onClick={changeEditmode}>{titleInfo.value}</div>;
  };

  return (
    <div className="container">
      {titleInfo.isInEditMode ? renderEditView() : renderDefaultView()}
      <MoreHorizIcon />
    </div>
  );
}

export default Title;
