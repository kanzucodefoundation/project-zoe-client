import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import {IContact, renderName} from "../../types";
import DetailView, {IRec} from "../../../../components/DetailView";
import {printBirthday, printDate} from "../../../../utils/dateHelpers";
import DataCard from "../../../../components/DataCard";
import PersonEditor from "../editors/PersonEditor";
import EditDialog from "../../../../components/EditDialog";

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
            value: printBirthday(person.dateOfBirth)
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

const BasicData = ({data}: IProps) => {
    const [dialog, setDialog] = useState(false)
    const {id = ''} = data

    const handleClick = () => {
        setDialog(true)
    }

    const handleClose = () => {
        setDialog(false)
    }
    return (
        <DataCard
            useActionContent={true}
            title="Person details"
            buttons={
                <Button size="small" color="primary" onClick={handleClick}>
                    Edit
                </Button>
            }
        >
            <DetailView data={idFields(data)}/>
            <EditDialog title='Edit Basic Data' open={dialog} onClose={handleClose}>
                <PersonEditor data={data.person} contactId={id} done={handleClose}/>
            </EditDialog>
        </DataCard>
    );
}


export default BasicData;
