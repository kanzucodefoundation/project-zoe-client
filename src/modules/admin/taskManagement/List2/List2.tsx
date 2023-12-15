import React, { useState } from 'react';
import { Paper } from '@material-ui/core';
import Title from './Title2';
import Card from './Card2';
import '../ALLstyles/List.css';
import Inputplace from './Inputplace2';

function List() {
  const [listItem, setListItem] = useState({
    currentIndex: -1,
    list: returnlist(),
  });

  function returnlist() {
    if (localStorage.getItem('newcard2') == null)
      localStorage.setItem('newcard2', JSON.stringify([]));
    return JSON.parse(localStorage.getItem('newcard2') ?? '');
  }
  const onAddoredit = (data: any) => {
    var list = returnlist();
    list.push(data);
    localStorage.setItem('newcard2', JSON.stringify(list));
    setListItem(list);
  };
  const handledelete = (index: any) => {
    var list = returnlist();
    list.splice(index, 1);
    localStorage.setItem('newcard2', JSON.stringify(list));
    setListItem({ list, currentIndex: -1 });
  };
  const card = listItem.list?.map((item: any) => (
    <Card key={item.id} rap={item.newcard2} handledelete={handledelete} />
  ));
  return (
    <div>
      <Paper className="paper">
        <Title />
        {card}
        <Inputplace onaddoredit={onAddoredit} />
      </Paper>
    </div>
  );
}

export default List;
