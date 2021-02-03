import React, {useState} from "react";
import XTable from "../../../components/table/XTable";
import {XHeadCell} from "../../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import {fakeTeam, ITeamMember} from "../types";
import {trimGuid} from "../../../utils/stringHelpers";
import {Box} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import EditDialog from "../../../components/EditDialog";
import {get} from "./../../../utils/ajax";
import {localRoutes, remoteRoutes} from "../../../data/constants";
import {useHistory} from "react-router";

const headCells: XHeadCell[] = [
    {name: 'id', label: 'ID'/*, render: (dt) => trimGuid(dt)*/},
    {name: 'name', label: 'Name'},
    {name: 'details', label: 'Details'},
    {name: 'role', label: 'Role'},
];

const fakeData: ITeamMember[] = [];
for (let i = 0; i < 3; i++) {
    fakeData.push(fakeTeam())
}

const groupData = (data: any, i: number, groups: ITeamMember[]) => {
    get(remoteRoutes.groupsMembership + `/?contactId=` + data, resp => {
        if (i === resp.length) {
            return;
        }
        while (i < resp.length) {
            const single = {
                id: resp[i].group.id,
                name: resp[i].group.name,
                details: resp[i].group.groupDetails,
                role: resp[i].role
            }
            groups.push(single);
            i++;
        }
    })
    return groups;
}


const Groups = (props: any) => {
    let i = 0;
    const groups: ITeamMember[] = [];

    const [selected, setSelected] = useState<any | null>(null)
    const [dialog, setDialog] = useState<any | null>(null)
    //const [data, setData] = useState(fakeData);
    const [data, setData] = useState(groupData(props.user.contactId, i, groups))

    function handleAddNew() {

    }
  
    const handleView = (dt: any) => {
        history.push(localRoutes.groups + '/' + dt);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box display='flex' >
                    <Box flexGrow={1}>&nbsp;</Box>
                    <Box pr={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            size='small'
                            startIcon={<AddIcon/>}
                            onClick={handleAddNew}
                        >
                            New&nbsp;&nbsp;
                        </Button>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <XTable
                    headCells={headCells}
                    data={data}
                    initialRowsPerPage={10}
                    handleSelection={handleView}
                />
            </Grid>
        </Grid>
    );
}

export default Groups




