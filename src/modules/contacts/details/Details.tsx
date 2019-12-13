import React, {useEffect, useState} from 'react';
import {RouteComponentProps, withRouter} from "react-router";
import Navigation from "../../../components/layout/Layout";
import {getRouteParam} from "../../../utils/routHelpers";
import {IContact} from "../types";
import Loading from "../../../components/Loading";
import Error from "../../../components/Error";
import {createStyles, Grid, makeStyles, Theme} from "@material-ui/core";
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Profile from "./info/Profile";
import Groups from "./Groups";
import Info from "./info/Info";
import {get} from "../../../utils/ajax";
import {remoteRoutes} from "../../../data/constants";
import {useDispatch, useSelector} from "react-redux";
import {crmConstants} from "../../../data/contacts/reducer";

interface IProps extends RouteComponentProps {

}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
            borderRadius: 0,
            minHeight: '100%',
            overflow: 'show'
        },
        divider: {
            marginTop: theme.spacing(2)
        },
        noPadding: {
            padding: 0
        }
    })
);

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`wrapped-tabpanel-${index}`}
            aria-labelledby={`wrapped-tab-${index}`}
            {...other}
        >
            <Box paddingTop={2}>{children}</Box>
        </Typography>
    );
}

function a11yProps(index: any) {
    return {
        id: `wrapped-tab-${index}`,
        'aria-controls': `wrapped-tabpanel-${index}`,
    };
}


const Details = (props: IProps) => {
    const contactId = getRouteParam(props, 'contactId')
    const classes = useStyles()
    const dispatch = useDispatch();
    const data: IContact | undefined = useSelector((state: any) => state.crm.selected)

    const [loading, setLoading] = useState<boolean>(true)
    const [value, setValue] = React.useState('one');

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setValue(newValue);
    };
    useEffect(() => {
        setLoading(true)
        get(
            `${remoteRoutes.contacts}/${contactId}`,
            resp => dispatch({
                type: crmConstants.crmFetchOne,
                payload: resp,
            }),
            undefined,
            () => setLoading(false))
    }, [dispatch, contactId])
    const hasError = !loading && !data
    return (
        <Navigation>
            {loading && <Loading/>}
            {hasError && <Error text='Failed load contact'/>}
            {
                data &&
                <div className={classes.root}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} style={{paddingBottom: 0}}>
                            <Profile data={data}/>
                            <Divider className={classes.divider}/>
                        </Grid>
                        <Grid item xs={12} style={{paddingTop: 0}}>
                            <AppBar position="static" color="inherit" elevation={0}>
                                <Tabs value={value} onChange={handleChange} aria-label="wrapped label tabs example">
                                    <Tab
                                        value="one"
                                        label="Summary"
                                        {...a11yProps('one')}
                                    />
                                    <Tab value="two" label="Teams" {...a11yProps('two')} />
                                </Tabs>
                            </AppBar>
                            <Divider/>
                            <TabPanel value={value} index="one">
                                <Info data={data}/>
                            </TabPanel>
                            <TabPanel value={value} index="two">
                                <Groups/>
                            </TabPanel>
                        </Grid>
                    </Grid>
                </div>
            }
        </Navigation>
    );
}

export default withRouter(Details);
