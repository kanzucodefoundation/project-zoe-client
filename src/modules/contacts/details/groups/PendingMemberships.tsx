import { Button, Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import XTable from '../../../../components/table/XTable';
import { XHeadCell } from '../../../../components/table/XTableHead';
import { remoteRoutes } from '../../../../data/constants';
import { del, get } from '../../../../utils/ajax';
import Toast from '../../../../utils/Toast';

const headCells: XHeadCell[] = [
    {
        name: 'groupName', 
        label: 'Group Name'
    },
    {
        name: 'id', 
        label: '',
        render: (data) => 
            <Button
                size='small'
                variant='contained'
                color='secondary'
                onClick={() => {
                    del(`${remoteRoutes.groupsRequest}/${data}`, resp => {
                        Toast.success("Request Successfully Deleted")
                    })
                }}
            >Delete Request</Button>
    }
]

interface IRequest {
    id: number
    groupName: string
}


const PendingMemberships = (props: any) => {

    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        get(`${remoteRoutes.groupsRequest}/?contactId=${props.contactId}`,
        data => {
            let requests: IRequest[] = []; 
            for (let i = 0; i < data.length; i++) {
                const single = {
                    id: data[i].id,
                    groupName: data[i].group.name
                }
                
                requests.push(single)
            }
            setData(requests)
        }, undefined, () => {
            setLoading(false)
        })
    }, [props.contactId])

    return (
        <Grid container>
            <XTable 
                headCells={headCells}
                data={data}
                initialRowsPerPage={5}
            />
        </Grid>
    )
}


export default PendingMemberships




