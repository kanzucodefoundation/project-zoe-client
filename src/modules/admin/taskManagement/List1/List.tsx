import React, { useState } from 'react';
import { Paper } from '@material-ui/core';
import Title from './Title';
import Card from './Card';
import '../ALLstyles/List.css';
import Inputplace from './InputPlace';

function List() {
  const returnlist = () => {
    if (localStorage.getItem('newcard') == null)
      localStorage.setItem('newcard', JSON.stringify([]));
    return JSON.parse(localStorage.getItem('newcard') ?? '');
  };

  const [listItem, setListItem] = useState({
    currentIndex: -1,
    list: returnlist(),
  });

  const onAddoredit = (data: any) => {
    var list = returnlist();
    list.push(data);
    localStorage.setItem('newcard', JSON.stringify(list));
    setListItem(list);
  };

  const handledelete = (index: any) => {
    var list = returnlist();
    list.splice(index, 1);
    localStorage.setItem('newcard', JSON.stringify(list));
    setListItem({ list, currentIndex: -1 });
  };
  const card = listItem.list?.map((item: any) => (
    <Card key={item.id} rap={item.newcard} handledelete={handledelete} />
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
