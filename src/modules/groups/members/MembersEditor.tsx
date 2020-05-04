import React, {useCallback, useEffect, useState} from 'react';
import {search} from "../../../utils/ajax";
import {remoteRoutes} from "../../../data/constants";
import {Grid} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import XAvatar from "../../../components/XAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IPersonComboValue} from "../../contacts/types";
import XSearchInput from "../../../components/inputs/XSearchInput";
import {grey} from "@material-ui/core/colors";
import Typography from "@material-ui/core/Typography";
import CodeView from "../../../components/CodeView";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
        details: {
            minHeight: 100,
            borderRadius: 5,
            border: '1px solid',
            backgroundColor: grey[50],
            padding: theme.spacing(2)
        },
        selBox: {
            width: 70
        }
    }),
);

interface IProps {
    group: any
}


const MembersEditor = (props: IProps) => {
    const classes = useStyles()
    const [loading, setLoading] = useState<boolean>(true);
    const [selected, setSelected] = useState<IPersonComboValue[]>([]);
    const [selectedIdList, setSelectedIdList] = useState<number[]>([]);
    const [data, setData] = useState<IPersonComboValue[]>([]);
    const [query, setQuery] = useState<string>("");

    const fetchData = useCallback((query: string) => {
        setLoading(true);
        search(remoteRoutes.contactsPeopleCombo,
            {
                query
            }, data => {
                setData(data)
            }, undefined, () => {
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        fetchData(query)
    }, [fetchData, query]);

    const isAlreadyAdded = (psn: IPersonComboValue): boolean => {
        return selectedIdList.indexOf(psn.id) > -1;
    }

    function handleSearch(v: string) {
        setQuery(v)
    }

    const handleAddNew = (dt: IPersonComboValue) => () => {
        if (!isAlreadyAdded(dt)) {
            setSelected([...selected, dt])
            setSelectedIdList([...selectedIdList, dt.id])
        }
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box display='flex' pt={1} pb={1} width='100%'>
                    <XSearchInput onChange={handleSearch}/>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box className={classes.details} width='100%' display='flex'>
                    {
                        selected.map(it => {
                            return <Box className={classes.selBox} mr={1} key={it.id}>
                                <Box
                                    width='100%'
                                    display='flex'
                                    pl={1}
                                >
                                    <XAvatar data={it}/>
                                </Box>
                                <Typography noWrap variant='body2'>{it.name}</Typography>
                            </Box>
                        })
                    }
                </Box>
            </Grid>
            <Grid item xs={12}>
                <List dense className={classes.root}>
                    {
                        data.map(person => {
                            return (
                                <ListItem key={person.id} button onClick={handleAddNew(person)}>
                                    <ListItemAvatar>
                                        <XAvatar data={person}/>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={person.name}
                                        secondary={isAlreadyAdded(person) ? "Already added to group" : ''}
                                    />
                                </ListItem>
                            );
                        })
                    }
                </List>
            </Grid>
            <Grid item xs={12}>
                <CodeView data={{selectedIdList,selected}}/>
            </Grid>
        </Grid>
    );
}

export default MembersEditor;
