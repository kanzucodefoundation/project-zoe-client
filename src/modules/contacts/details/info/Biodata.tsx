import React from 'react';
import {IContact, renderName} from "../../types";
import IBox from "../../../../components/ibox/IBox";
import DetailView, {IRec} from "../../../../components/DetailView";
import {printDate} from "../../../../utils/dateHelpers";
import PersonIcon from '@material-ui/icons/PermIdentity';
import EditIcon from '@material-ui/icons/Edit';
import {Button} from "@material-ui/core";

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
    const displayData = idFields(data);
    const title = <div style={{display: 'flex', flexDirection: 'row'}}>
        <PersonIcon fontSize='small'/><span>&nbsp;Bio data</span>
    </div>
    return (
        <IBox title={title} action={<Button variant='outlined' size='small'>edit</Button>}>
            <DetailView data={displayData}/>
        </IBox>
    );
}
export default BioData;
