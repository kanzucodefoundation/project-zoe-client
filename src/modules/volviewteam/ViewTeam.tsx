import React from 'react';
import {makeStyles} from '@material-ui/styles';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Checkbox,
    Divider,
    FormControlLabel,
    Grid,
    Typography
} from '@material-ui/core';
import XHeader from "../../components/ibox/XHeader";
import Layout from "../../components/layout/Layout";

const useStyles = makeStyles(() => ({
    root: {
        borderRadius: 0,
    },
    item: {
        display: 'flex',
        flexDirection: 'column'
    }
}));

const Notifications = () => {
    const classes = useStyles();
    return (
        <Layout>
        <Card className={classes.root} elevation={0}>
            <XHeader title='View Team'/>
            <form>
                <CardContent>
                    <Grid
                        container
                        spacing={6}
                        wrap="wrap"
                    >
                        <Grid
                            className={classes.item}
                            item
                            sm={6}
                            xs={12}
                        >
                            <Typography
                                gutterBottom
                                variant="h6"
                            >
                                Ministry : Ushering
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        defaultChecked
                                    />
                                }
                                label="1 : Peter"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        defaultChecked
                                    />
                                }
                                label="2 : Timothy"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        defaultChecked
                                    />
                                }
                                label="3 : Jerald"
                            />
                        </Grid>
                        <Grid
                            className={classes.item}
                            item
                            md={4}
                            sm={6}
                            xs={12}
                        >
                            
                        </Grid>
                    </Grid>
                </CardContent>
                <Divider/>
                
            </form>
        </Card>
        </Layout>
    );
};


export default Notifications;
