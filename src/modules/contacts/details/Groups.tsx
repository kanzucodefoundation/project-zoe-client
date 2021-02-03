import React, {useState} from "react";
import XTable from "../../../components/table/XTable";
import {XHeadCell} from "../../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import {ITeamMember} from "../types";
import {Box} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import {get} from "./../../../utils/ajax";
import { remoteRoutes } from "../../../data/constants";

const headCells: XHeadCell[] = [
    {name: 'id', label: 'ID'},
    {name: 'name', label: 'Name'},
    {name: 'details', label: 'Details'},
    {name: 'role', label: 'Role'},
];

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
    const [data, setData] = useState(groupData(props.contactId, i, groups))

    function handleAddNew() {

    }

    const handleClose = () => {
        setSelected(null)
        setDialog(false)
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
        </Grid>
    );
}

export default Groups




