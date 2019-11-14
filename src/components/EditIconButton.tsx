import React from 'react';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import IconButton from "@material-ui/core/IconButton";

interface IProps {
    onClick:()=>any
}

const EditIconButton = ({onClick}: IProps) => {
    return (
        <IconButton aria-label="delete" size="small" title='Edit' style={{marginTop: 5}} onClick={onClick}>
            <EditIcon />
        </IconButton>
    );
}

export const AddIconButton = ({onClick}: IProps) => {
    return (
        <IconButton aria-label="add-new" size="small" title='Add New' style={{marginTop: 5}} onClick={onClick}>
            <AddIcon />
        </IconButton>
    );
}

export const MoreIconButton = ({onClick}: IProps) => {
    return (
        <IconButton aria-label="add-new" size="small" title='More' style={{marginTop: 5}} onClick={onClick}>
            <MoreHorizIcon />
        </IconButton>
    );
}


export default EditIconButton;
