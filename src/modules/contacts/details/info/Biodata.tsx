import React, {useState} from 'react';
import {IContact, renderName} from "../../types";
import IBox from "../../../../components/ibox/IBox";
import DetailView, {IRec} from "../../../../components/DetailView";
import {printDate} from "../../../../utils/dateHelpers";
import PersonIcon from '@material-ui/icons/PermIdentity';
import EditIconButton from "../../../../components/EditIconButton";
import EditDialog from "../../../../components/EditDialog";
import PersonEditor from "../editors/PersonEditor";
import Typography from "@material-ui/core/Typography";

interface IProps {
    data: IContact
}

export const idFields = (data: IContact): IRec[] => {
    const {person} = data
    return [
        {
            label: 'Name',
            value: renderName(person)
        },
        {
            label: 'BirthDay',
            value: printDate(person.dateOfBirth)
        },
        {
            label: 'Gender',
            value: person.gender
        },
        {
            label: 'Marital Status',
            value: person.civilStatus
        }
    ]
}

const BioData = ({data}: IProps) => {
    const [dialog, setDialog] = useState(false)
    const {id = ''} = data

    const handleClick =  () => {
        setDialog(true)
    }

    const handleClose = () => {
        setDialog(false)
    }

    const displayData = idFields(data);
    const title = <div style={{display: 'flex', flexDirection: 'row'}}>
        <PersonIcon fontSize='small' /><Typography variant='body2'>&nbsp;<b>Basic data</b></Typography>
    </div>

    return (
        <IBox title={title} action={<EditIconButton onClick={handleClick}/>}>
            <DetailView data={displayData}/>
            <EditDialog title='Edit Basic Data' open={dialog} onClose={handleClose}>
                <PersonEditor data={data.person}  contactId={id} done={handleClose}/>
            </EditDialog>
        </IBox>
    );
}
export default BioData;
