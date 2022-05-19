import React from 'react';
import {
  createStyles,
  fade,
  makeStyles,
  Theme,
  withStyles,
} from '@material-ui/core/styles';

import TreeView from '@material-ui/lab/TreeView';
import TreeItem, { TreeItemProps } from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';
import { TransitionProps } from '@material-ui/core/transitions';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';
import { CloseSquare, MinusSquare, PlusSquare } from '../xicons';

function TransitionComponent(props: TransitionProps) {
  return <Collapse {...props} />;
}

const StyledTreeItem = withStyles((theme: Theme) => createStyles({
  iconContainer: {
    '& .close': {
      opacity: 0.3,
    },
  },
  group: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
  },
}))((props: TreeItemProps) => (
  <TreeItem {...props} TransitionComponent={TransitionComponent} />
));

const useStyles = makeStyles(
  createStyles({
    root: {
      width: '100%',
    },
  }),
);

interface IProps {
  data: ITreeData[];
  onDetails: (d: any) => any;
  onAddUnder: (d: any) => any;
  open?: any[];
}

export interface ITreeData {
  id: string;
  name: string;
  children: any[];
  [name: string]: any;
}

interface ILabelProps {
  labelText: string;
  secondaryText?: string;
  onDetailClick: (d: any) => any;
  onAddClick: (d: any) => any;
}

const TreeLabel = (props: ILabelProps) => (
  <Box display="flex">
    <Box p={1} flexGrow={1} onClick={props.onDetailClick} display="flex">
      <Typography variant="body1">{props.labelText}</Typography>
      {props.secondaryText && (
        <Typography variant="caption" style={{ marginTop: 3 }}>
          &nbsp;({props.secondaryText})
        </Typography>
      )}
    </Box>
    <Box p={1} pl={0}>
      <IconButton
        color="primary"
        size="small"
        onClick={props.onAddClick}
        title="Add New"
      >
        <AddIcon />
      </IconButton>
    </Box>
  </Box>
);
export default function XTreeData(props: IProps) {
  const classes = useStyles();

  const handleAddClick = (data: any) => (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    props.onAddUnder(data);
  };

  const handleDetailClick = (data: any) => (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    props.onDetails(data);
  };

  const createItem = ({ children, ...dt }: any) => {
    if (children) {
      return (
        <StyledTreeItem
          key={`${dt.id}`}
          nodeId={`${dt.id}`}
          label={
            <TreeLabel
              labelText={dt.name}
              secondaryText={dt.categoryId}
              onAddClick={handleAddClick(dt)}
              onDetailClick={handleDetailClick(dt)}
            />
          }
        >
          {children.map(createItem)}
        </StyledTreeItem>
      );
    }
    return (
      <StyledTreeItem
        key={`${dt.id}`}
        nodeId={`${dt.id}`}
        label={
          <TreeLabel
            labelText={dt.name}
            onAddClick={handleAddClick(dt)}
            onDetailClick={handleDetailClick(dt)}
          />
        }
      />
    );
  };
  const open = props.open?.map((it) => `${it}`);
  return (
    <TreeView
      defaultExpanded={open}
      className={classes.root}
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<CloseSquare />}
    >
      {props.data.map(createItem)}
    </TreeView>
  );
}
