import React, {useEffect, useState} from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LabelIcon from '@material-ui/icons/Label';
import Header from "../../contacts/Header";
import {ITag} from "./types";
import EditDialog from "../../../components/EditDialog";
import TagEditor from "./TagEditor";
import Loading from "../../../components/Loading";
import {useDispatch, useSelector} from "react-redux";
import {ITagState, tagsFetchAsync, tagsStartLoading} from "../../../data/tags/reducer";
import InfoMessage from "../../../components/messages/InfoMessage";
import Box from "@material-ui/core/Box";
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: theme.palette.background.paper,
        }
    }),
);
const Tags = () => {
    const classes = useStyles();
    const {data, loading}: ITagState = useSelector((state: any) => state.tags)

    const [filter, setFilter] = useState({});
    const [selected, setSelected] = useState<ITag | null>(null)
    const [dialog, setDialog] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(tagsStartLoading())
        dispatch(tagsFetchAsync(filter))
    }, [filter, dispatch])

    const handleClick = (dt: ITag) => () => {
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

    const hasNoData = (): boolean => {
        return data.length === 0
    }
    return (
        <Box p={2} className={classes.root}>
            <Header onAddNew={handleNew} title='Tags'/>
            <div>
                <List>
                    {
                        loading ?
                            <Loading/> :
                            <>{
                                hasNoData() ?
                                    <InfoMessage text='No tags found'/> :
                                    data.map(it => {
                                        return <ListItem key={it.id} button onClick={handleClick(it)}>
                                            <ListItemIcon>
                                                <LabelIcon style={{color: it.color}}/>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={it.name}
                                                secondary={it.category}
                                            />
                                        </ListItem>
                                    })

                            }</>
                    }
                </List>
            </div>
            <EditDialog open={dialog} onClose={handleClose} title={selected ? "Edit Tag" : "New Tag"}>
                <TagEditor data={selected} isNew={!selected} done={handleClose}/>
            </EditDialog>
        </Box>
    );
}

export default Tags;
