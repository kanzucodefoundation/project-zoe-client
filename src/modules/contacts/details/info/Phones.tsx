import React, {useState} from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {IContact, IEmail} from "../../types";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import EditDialog from "../../../../components/EditDialog";
import PhoneEditor from "../editors/PhoneEditor";
import DataCard from "../../../../components/DataCard";
import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";

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

const Phones = (props: IProps) => {
    const classes = useStyles()
    const [selected, setSelected] = useState<IEmail | null>(null)
    const [dialog, setDialog] = useState(false)

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

    const {phones, id = ''} = props.data

    return (
        <DataCard
            useActionContent={true}
            title='Phones'
            buttons={
                <Button size="small" color="primary" onClick={handleNew}>
                    Add New
                </Button>
            }
        >
            <List className={classes.noPadding}>
                {phones.map(it => (
                    <ListItem button key={it.id} className={classes.noPadding} onClick={handleClick(it)}>
                        <ListItemText primary={it.value} secondary={it.category}/>
                        <Hidden mdUp>
                            <ArrowRightIcon/>
                        </Hidden>
                    </ListItem>
                ))}
            </List>
            <EditDialog title={selected ? "Edit Phone" : "New Phone"} open={dialog} onClose={handleClose}>
                <PhoneEditor data={selected} isNew={!selected} contactId={id} done={handleClose}/>
            </EditDialog>
        </DataCard>
    )
}

export default Phones;
