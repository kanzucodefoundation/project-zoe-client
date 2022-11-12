import { Grid } from '@material-ui/core';
import React from 'react';
import Emails from './Emails';
import Phones from './Phones';
import Addresses from './Addresses';
import { IContact } from '../../types';
import BasicData from './BasicData';

interface IProps {
  data: IContact;
}

const Info = ({ data }: IProps) => (
        <Grid container spacing={2}>
            <Grid item xs={12} lg={4} md={6} sm={6} xl={3}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <BasicData data={data}/>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} lg={8} md={6} sm={6} xl={9}>
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={6} xl={4} >
                        <Emails data={data}/>
                    </Grid>
                    <Grid item xs={12} lg={6} xl={4}>
                        <Phones data={data}/>
                    </Grid>
                    <Grid item xs={12} lg={6} xl={4}>
                        <Addresses data={data}/>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
);

export default Info;
