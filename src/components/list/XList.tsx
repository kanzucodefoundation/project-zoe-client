import React, { Fragment } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import XAvatar from '../XAvatar';
import { hasValue } from '../inputs/sutils';

interface IProps {
  data: any[];
  onSelect: (id: any) => any;
  parser: (dt: any) => ListItemData;
}

export type ListItemData = {
  avatar?: any;
  primaryText: string;
  secondaryText: string;
};

const XList = ({ data, onSelect, parser }: IProps) => (
  <div>
    <List>
      {data.map((row: any) => {
        const mobileRow = parser(row);
        return (
          <Fragment key={row.id}>
            <ListItem
              alignItems="flex-start"
              disableGutters
              button
              onClick={() => onSelect(row)}
            >
              {hasValue(mobileRow.avatar) && (
                <ListItemAvatar>
                  <XAvatar value={mobileRow.avatar} />
                </ListItemAvatar>
              )}

              <ListItemText
                primary={mobileRow.primaryText}
                secondary={mobileRow.secondaryText}
              />
            </ListItem>
            <Divider component="li" />
          </Fragment>
        );
      })}
    </List>
  </div>
);

export default XList;
