import React, {useState} from "react";

import XTable from "../../../components/table/XTable";
import {XHeadCell} from "../../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import {fakeTeam, ITeamMember} from "../types";
import {trimGuid} from "../../../utils/stringHelpers";
import {Box} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import theme from "../../../theme";
import Button from "@material-ui/core/Button";
import EditDialog from "../../../components/EditDialog";

const headCells: XHeadCell[] = [
    {name: 'id', label: 'ID', render: (dt) => trimGuid(dt)},
    {name: 'name', label: 'Name'},
    {name: 'details', label: 'Details'},
    {name: 'role', label: 'Role'},

];

const fakeData: ITeamMember[] = [];
for (let i = 0; i < 3; i++) {
    fakeData.push(fakeTeam())
}
const Groups = () => {
    const [data, setData] = useState(fakeData);

    function handleAddNew() {

    }

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
                />
            </Grid>
            {/*/<EditDialog open={} onClose={} title={}></EditDialog>*/}
        </Grid>
    );
}

export default Groups
