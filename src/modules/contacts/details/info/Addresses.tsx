import React, {useState} from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import PinDropIcon from '@material-ui/icons/PinDrop';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IBox from "../../../../components/ibox/IBox";
import {IAddress, IContact, printAddress} from "../../types";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import EditIconButton, {AddIconButton} from "../../../../components/EditIconButton";
import EditDialog from "../../../../components/EditDialog";
import AddressEditor from "../editors/AddressEditor";
import Typography from "@material-ui/core/Typography";

interface IProps {
    data: IContact
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2),
            borderRadius: 0
        },
        noPadding: {
            padding: 0
        }
    })
);

const Addresses = (props: IProps) => {
    const classes = useStyles()
    const [selected, setSelected] = useState<IAddress | null>(null)
    const [dialog, setDialog] = useState(false)


    const handleClick = (dt: IAddress) => () => {
        setSelected(dt)
        setDialog(true)
    }

    const handleClose = () => {
        setDialog(false)
        setSelected(null)
    }

    const handleNew = () => {
        setSelected(null)
        setDialog(true)
    }
    const {addresses,id=''} = props.data

    const title = <div style={{display: 'flex', flexDirection: 'row'}}>
        <PinDropIcon fontSize='small'/><Typography variant='body2'>&nbsp;<b>Addresses</b></Typography>
    </div>
    return (
        <IBox title={title} action={<AddIconButton onClick={handleNew}/>}>
            <List className={classes.noPadding}>
                {addresses.map(it => (
                    <ListItem button key={it.id} className={classes.noPadding} onClick={handleClick(it)}>
                        <ListItemText primary={printAddress(it)} secondary={it.category}/>
                        <ListItemSecondaryAction>
                            <EditIconButton onClick={handleClick(it)}/>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
            <EditDialog title={selected ? "Edit Address" : "New Address"} open={dialog} onClose={handleClose}>
                <AddressEditor data={selected} isNew={!selected} contactId={id} done={handleClose}/>
            </EditDialog>
        </IBox>
    );
}

export default Addresses;
