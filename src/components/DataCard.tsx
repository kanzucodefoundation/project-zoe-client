import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {Box} from "@material-ui/core";

interface IProps {
    useActionContent: boolean
    children: any
    title: string
    buttons: any
}

const DataCard = (props: IProps) => {
    return (
        <Card elevation={0} >
            <CardHeader title={<Typography variant='body1'><b>{props.title}</b></Typography>}/>
            {
                props.useActionContent ?
                    <CardActionArea>
                        <CardContent style={{paddingTop:0,paddingBottom:0}}>
                            {props.children}
                        </CardContent>
                    </CardActionArea> :
                    <CardContent>
                        {props.children}
                    </CardContent>
            }
            <CardActions>
                <Box display='flex' justifyContent="flex-end" width='100%'>
                    {props.buttons}
                </Box>
            </CardActions>
        </Card>
    );
}


export default DataCard;
