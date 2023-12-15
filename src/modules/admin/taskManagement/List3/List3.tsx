import React, { useState } from 'react';
import { Paper } from '@material-ui/core';
import Title from './Title3';
import Card from './Card3';
import '../ALLstyles/List.css';
import Inputplace from './Inputplace';

function List() {
  const returnlist = () => {
    if (localStorage.getItem('newcard3') == null)
      localStorage.setItem('newcard3', JSON.stringify([]));
    return JSON.parse(localStorage.getItem('newcard3') ?? '');
  };

  const [listItem, setListItem] = useState({
    currentIndex: -1,
    list: returnlist(),
  });

  const onAddoredit = (data: any) => {
    var list = returnlist();
    list.push(data);
    localStorage.setItem('newcard3', JSON.stringify(list));
    setListItem(list);
  };

  const handledelete = (index: any) => {
    var list = returnlist();
    list.splice(index, 1);
    localStorage.setItem('newcard3', JSON.stringify(list));
    setListItem({ list, currentIndex: -1 });
  };
  const card = listItem.list?.map((item: any) => (
    <Card key={item.id} rap={item.newcard3} handledelete={handledelete} />
  ));
  return (
    <div>
      <Paper className="paper">
        <Title />
        {card}
        <Inputplace onAddoredit={onAddoredit} />
      </Paper>
    </div>
  );
}

export default List;
