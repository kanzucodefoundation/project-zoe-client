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
        <Card className={classes.root} elevation={0}>
            <XHeader title='Notifications'/>
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
                                Notifications
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        defaultChecked
                                    />
                                }
                                label="Email"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        defaultChecked
                                    />
                                }
                                label="Push Notifications"
                            />
                            <FormControlLabel
                                control={<Checkbox color="primary"/>}
                                label="Text Messages"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        defaultChecked
                                    />
                                }
                                label="Phone calls"
                            />
                        </Grid>
                        <Grid
                            className={classes.item}
                            item
                            md={4}
                            sm={6}
                            xs={12}
                        >
                            <Typography
                                gutterBottom
                                variant="h6"
                            >
                                Messages
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        defaultChecked //
                                    />
                                }
                                label="Email"
                            />
                            <FormControlLabel
                                control={<Checkbox color="primary"/>}
                                label="Push Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        defaultChecked //
                                    />
                                }
                                label="Phone calls"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <Divider/>
                <CardActions>
                    <Button
                        color="primary"
                        variant="outlined"
                    >
                        Save
                    </Button>
                </CardActions>
            </form>
        </Card>
    );
};


export default Notifications;
