import React from 'react';
import {Doughnut} from 'react-chartjs-2';
import {makeStyles, useTheme} from '@material-ui/styles';
import {Card, CardContent, CardHeader, Divider, IconButton, Theme, Typography} from '@material-ui/core';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';
import RefreshIcon from '@material-ui/icons/Refresh';
import TabletMacIcon from '@material-ui/icons/TabletMac';
import {iconColor, warning, white} from "../../theme/custom-colors";

const useStyles = makeStyles((theme:Theme) => ({
    root: {
        height: '100%'
    },
    chartContainer: {
        position: 'relative',
        height: '200px'
    },
    stats: {
        marginTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center'
    },
    device: {
        textAlign: 'center',
        padding: theme.spacing(1)
    },
    deviceIcon: {
        color: iconColor
    }
}));

const UsersByDevice = () => {

    const classes = useStyles();
    const theme:Theme = useTheme();

    const data = {
        datasets: [
            {
                data: [63, 15, 22],
                backgroundColor: [
                    theme.palette.primary.main,
                    theme.palette.error.main,
                    warning.main
                ],
                borderWidth: 8,
                borderColor: white,
                hoverBorderColor: white
            }
        ],
        labels: ['Desktop', 'Tablet', 'Mobile']
    };

    const options = {
        legend: {
            display: false
        },
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        cutoutPercentage: 80,
        layout: { padding: 0 },
        tooltips: {
            enabled: true,
            mode: 'index',
            intersect: false,
            borderWidth: 1,
            borderColor: theme.palette.divider,
            backgroundColor: white,
            titleFontColor: theme.palette.text.primary,
            bodyFontColor: theme.palette.text.secondary,
            footerFontColor: theme.palette.text.secondary
        }
    };

    const devices = [
        {
            title: 'Desktop',
            value: '63',
            icon: <LaptopMacIcon />,
            color: theme.palette.primary.main
        },
        {
            title: 'Tablet',
            value: '15',
            icon: <TabletMacIcon />,
            color: theme.palette.error.main
        },
        {
            title: 'Mobile',
            value: '23',
            icon: <PhoneIphoneIcon />,
            color: warning.main
        }
    ];

    return (
        <Card
            className={classes.root}
        >
            <CardHeader
                action={
                    <IconButton size="small">
                        <RefreshIcon />
                    </IconButton>
                }
                title={<Typography variant='h6'>Users By Device</Typography>}
            />
            <Divider />
            <CardContent>
                <div className={classes.chartContainer}>
                    <Doughnut
                        data={data}
                        options={options}
                    />
                </div>
                <div className={classes.stats}>
                    {devices.map(device => (
                        <div
                            className={classes.device}
                            key={device.title}
                        >
                            <span className={classes.deviceIcon}>{device.icon}</span>
                            <Typography variant="body1">{device.title}</Typography>
                            <Typography
                                style={{ color: device.color }}
                                variant="h6"
                            >
                                {device.value}%
                            </Typography>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


export default UsersByDevice;
