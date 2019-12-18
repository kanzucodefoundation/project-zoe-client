import React, {useEffect, useState} from 'react';
import Layout from "../../../components/layout/Layout";
import {Grid} from "@material-ui/core";
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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            maxWidth: 752,
        },
        demo: {
            backgroundColor: theme.palette.background.paper,
        },
        title: {
            margin: theme.spacing(4, 0, 2),
        },
    }),
);

interface IProps {
}

const Tags = (props: IProps) => {
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
        <Layout>
            <Grid container spacing={1}>
                <Grid item xs={12} md={6} lg={3}>
                    <Header onAddNew={handleNew} title='Group Tags'/>

                    <div className={classes.demo}>
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
                </Grid>
            </Grid>
        </Layout>
    );
}

export default Tags;
