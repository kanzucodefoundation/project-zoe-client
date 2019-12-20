import React, {useState} from 'react';
import {Button, Card, CardActions, CardContent, Divider, TextField} from '@material-ui/core';
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import XHeader from "../../components/ibox/XHeader";
import Box from "@material-ui/core/Box";
import CenteredDiv from "../../components/CenteredDiv";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            borderRadius: 0,
        }
    }),
);

const PasswordReset = () => {
    const classes = useStyles()

    const [values, setValues] = useState({
        password: '',
        confirm: ''
    });

    const handleChange = (event: any) => {
        setValues({
            ...values,
            [event.target.name]: event.target.value
        });
    };

    return (
        <Card className={classes.root} elevation={0}>
            <XHeader title='Update Password'/>
            <CardContent>

                <CenteredDiv width={300}>
                    <form>
                        <TextField
                            fullWidth
                            label="Old Password"
                            name="oldPassword"
                            onChange={handleChange}
                            type="password"
                            value={values.password}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="New Password"
                            name="newPassword"
                            onChange={handleChange}
                            type="password"
                            value={values.password}
                            variant="outlined"
                            style={{marginTop: '1rem'}}
                        />
                        <TextField
                            fullWidth
                            label="Confirm password"
                            name="confirm"
                            onChange={handleChange}
                            style={{marginTop: '1rem'}}
                            type="password"
                            value={values.confirm}
                            variant="outlined"
                        />
                        <Box display='flex' justifyContent='flex-end' pt={2}>
                            <Button
                                color="primary"
                                variant="outlined"
                            >
                                Update
                            </Button>
                        </Box>
                    </form>
                </CenteredDiv>
            </CardContent>
        </Card>
    );
};


export default PasswordReset;
