import { Box, Grid, Typography, Divider, Avatar } from '@material-ui/core';
import React, { useState } from 'react';
import DataList, { IMobileRow } from '../../../components/DataList';
import { XHeadCell } from '../../../components/table/XTableHead';
import PersonIcon from "@material-ui/icons/Person";
import { hasValue } from '../../../components/inputs/inputHelpers';
import { remoteRoutes } from '../../../data/constants';
import { search } from '../../../utils/ajax';

const headCells: XHeadCell[] = [
    {
        name: 'id',
        label: 'ID'
    },
    {
        name: 'avatar',
        label: 'Avatar',
        render: (data) => {
            const hasAvatar= hasValue(data);

            return hasAvatar ?
                <Avatar
                    alt={"Avatar"}
                    src={data}
                /> :
                <Avatar><PersonIcon/></Avatar>
        }
    },
    {
        name: 'fullName',
        label: 'Full Name'
    },
    {
        name: 'groupName',
        label: 'Group Name'
    },
]


const toMobile = (data: any): IMobileRow => {
    const hasAvatar = hasValue(data.avatar)
    return {
        avatar:
            hasAvatar ?
                <Avatar
                    alt="Avatar"
                    src={data.avatar}
                /> :
                <Avatar><PersonIcon/></Avatar>,
        primary: <>
            {`${data.fullName}\t`}
        </>,
        secondary: <>
            <Typography variant='caption' color='textSecondary'>{`Group Name: ${data.groupName}`}</Typography>
        </>
    }
}

interface IRequestMember {
    id: number,
    avatar?: string;
    fullName: string,
    groupName: string,
}

const MemberRequests = (props: any) => {

    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<any[]>([]);

    const getRequests = () => {
        let filter = {};

        if (props.group.categoryId === "Location") {
            filter = {parentId: props.group.id}
        } else {
            filter= {groupId: props.group.id}
        }
        search(remoteRoutes.groupsRequest, filter, resp => {
            const request: IRequestMember[] = [];
            for(let i = 0; i < resp.length; i++) {
                const single = {
                    id: resp[i].id,
                    avatar: resp[i].contact.avatar,
                    fullName: resp[i].contact.fullName,
                    groupName: resp[i].group.name
                }
                request.push(single);
            }

            setLoading(false)
            setData(request)
        })
    }
    // TODO @Anna use 'useEffect' hook to fetch data

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box display='flex' flexDirection='column'>
                    <Box pb={1}>
                        <Typography variant='h6' style={{fontSize: '0.92rem'}}>Pending Members</Typography>
                    </Box>
                    <Divider/>
                    <Box>
                        {loading ? getRequests() : null}
                        <DataList
                            data={data}
                            columns={headCells}
                            toMobileRow={toMobile}
                        />
                    </Box>
                </Box>

            </Grid>
        </Grid>
    )
}

export default MemberRequests

