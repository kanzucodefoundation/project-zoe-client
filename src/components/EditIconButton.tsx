import React from 'react';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import IconButton from "@material-ui/core/IconButton";

interface IProps {
    onClick:()=>any
}

const EditIconButton = ({onClick}: IProps) => {
    return (
        <IconButton aria-label="delete" size="small" title='Edit' style={{marginTop: 5}} onClick={onClick}>
            <EditIcon fontSize="inherit"/>
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


export default EditIconButton;
