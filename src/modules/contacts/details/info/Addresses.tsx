import React, { useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { IAddress, IContact, printAddress } from "../../types";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import EditDialog from "../../../../components/EditDialog";
import AddressEditor from "../editors/AddressEditor";
import DataCard from "../../../../components/DataCard";
import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import Toast from "../../../../utils/Toast";

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
    return (
        <DataCard
            useActionContent={true}
            title='Addresses'
            buttons={
                <Button size="small" color="primary" onClick={
                    () =>
                      addresses.length >= 4 ? Toast.info("You can only enter up to four addresses") : handleNew()}>
                    Add New
                </Button>
            }
        >
            <List className={classes.noPadding}>
                {addresses.map(it => (
                    <ListItem button key={it.id} className={classes.noPadding} onClick={handleClick(it)}>
                        <ListItemText primary={printAddress(it)} secondary={it.category}/>
                        <Hidden mdUp>
                            <ArrowRightIcon/>
                        </Hidden>
                    </ListItem>
                ))}
            </List>
            <EditDialog title={selected ? "Edit Address" : "New Address"} open={dialog} onClose={handleClose}>
                <AddressEditor data={selected} isNew={!selected} contactId={id} done={handleClose}/>
            </EditDialog>
        </DataCard>
    )

}

export default Addresses;
