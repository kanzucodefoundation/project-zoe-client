import React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import NaturePeopleIcon from '@material-ui/icons/NaturePeople';
import PinDropIcon from '@material-ui/icons/PinDrop';
import Grid from "@material-ui/core/Grid";
import useTheme from "@material-ui/core/styles/useTheme";
import {MoreIconButton} from "../../components/EditIconButton";
import {Box} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import {useHistory} from "react-router";
import {localRoutes} from "../../data/constants";
import {getEmail, getPhone, IContact, renderName} from "./types";
import {XHeadCell} from "../../components/table/XTableHead";
import ContactLink from "../../components/ContactLink";
import EmailLink from "../../components/EmalLink";
import PersonIcon from '@material-ui/icons/Person';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            width: '100%',
            borderRadius: 0
        },
        avatar: {
            width: 40,
            height: 40,
        },
        header: {
            paddingBottom: theme.spacing(1),
        },
        content: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: 0,
            paddingBottom: theme.spacing(1),

        },
        actions: {
            paddingBottom: theme.spacing(1),
        },
    }),
);

interface IProps {
    data: IContact
}

const headCells: XHeadCell[] = [
    {name: 'id', label: 'Name', render: (value, rec) => <ContactLink id={value} name={renderName(rec.person)}/>},
    {name: 'category', label: 'Category'},
    {name: 'email', label: 'Email', render: (_, rec) => <EmailLink value={getEmail(rec)}/>},
    {name: 'phone', label: 'Phone', render: (_, rec) => getPhone(rec)},
];
export default function ContactItem({data}: IProps) {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();

    function handleClick() {
        const url = `${localRoutes.contacts}/${data.id}`
        history.push(url)
    }

    const isMale = data.person.gender === 'Male'
    return (
        <Card className={classes.card} elevation={1} onClick={handleClick}>
            <CardHeader
                className={classes.header}
                // avatar={
                //     <Avatar alt="Avatar" src={isMale ? male : female} className={classes.avatar}/>
                // }
                avatar={
                    <Avatar alt="Avatar"  className={classes.avatar}>
                        <PersonIcon fontSize='default'/>
                    </Avatar>
                }
                title={<Typography variant='body1' noWrap>{renderName(data.person)}</Typography>}
                subheader={
                    <Grid container direction="row" spacing={0} wrap="wrap">
                        <Grid item xs={12}>
                            <Typography variant='caption' noWrap><PhoneIcon fontSize="inherit"/>&nbsp;{getPhone(data)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} zeroMinWidth>
                            <Typography variant='caption' noWrap><EmailIcon
                                fontSize="inherit"/>&nbsp;{getEmail(data)}</Typography>
                        </Grid>
                    </Grid>
                }
            />
            <Divider/>
        </Card>
    );
}
