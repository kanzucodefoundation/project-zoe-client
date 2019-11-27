import React, {useState} from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MailIcon from '@material-ui/icons/Mail';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IBox from "../../../../components/ibox/IBox";
import {IContact, IEmail} from "../../types";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import EmailEditor from "../editors/EmailEditor";
import EditIconButton, {AddIconButton} from "../../../../components/EditIconButton";
import EditDialog from "../../../../components/EditDialog";
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

const Emails = (props: IProps) => {
    const classes = useStyles()
    const [selected, setSelected] = useState<IEmail | null>(null)
    const [dialog, setDialog] = useState(false)
    const {emails, id = ''} = props.data

    const handleClick = (email: IEmail) => () => {
        setSelected(email)
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

    const title = <div style={{display: 'flex', flexDirection: 'row'}}>
        <MailIcon fontSize='small' /><Typography variant='body2'>&nbsp;<b>Emails</b></Typography>
    </div>
    return (
        <IBox title={title} action={<AddIconButton onClick={handleNew}/>}>
            <List className={classes.noPadding}>
                {emails.map(it => (
                    <ListItem button key={it.id} className={classes.noPadding} onClick={handleClick(it)}>
                        <ListItemText primary={it.value} secondary={it.category}/>
                        <ListItemSecondaryAction>
                            <EditIconButton onClick={handleClick(it)}/>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
            <EditDialog title={selected ? "Edit Email" : "New Email"} open={dialog} onClose={handleClose}>
                <EmailEditor data={selected} isNew={!selected} contactId={id} done={handleClose}/>
            </EditDialog>
        </IBox>
    );
}

export default Emails;
