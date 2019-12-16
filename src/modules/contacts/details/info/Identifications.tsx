import React, {Fragment, useState} from 'react';
import {IContact, IIdentification} from "../../types";
import IBox from "../../../../components/ibox/IBox";
import DetailView, {IRec} from "../../../../components/DetailView";
import {printDate} from "../../../../utils/dateHelpers";
import {AddIconButton} from "../../../../components/EditIconButton";
import {Divider} from "@material-ui/core";
import ListIcon from "@material-ui/icons/List";
import EditDialog from "../../../../components/EditDialog";
import IdentificationEditor from "../editors/IdentificationEditor";
import Typography from "@material-ui/core/Typography";

interface IProps {
    data: IContact
}

const displayData = (idData: IIdentification): IRec[] => {

    return [
        {
            label: 'NIN',
            value: idData.value
        },
        {
            label: 'Country',
            value: idData.issuingCountry
        },
        {
            label: 'Date of Issue',
            value: printDate(idData.issueDate)
        },
        {
            label: 'Date of Expiry',
            value: printDate(idData.expiryDate)
        }
    ]
}

const Identifications = ({data}: IProps) => {
    const {identifications, id = ''} = data
    const [selected, setSelected] = useState<IIdentification | null>(null)
    const [dialog, setDialog] = useState(false)


    const handleClick = (dt: IIdentification) => () => {
        setSelected(dt)
        setDialog(true)
    }

    const handleClose = () => {
        setDialog(false)
        setSelected(null)
    }

    const handleNew = () => {
        setSelected(null)
        setDialog(true)
    }


    const stillCounting = (index: number) => {
        return index < identifications.length - 1
    }


    const title = <div style={{display: 'flex', flexDirection: 'row'}}>
        <ListIcon fontSize='small' /><Typography variant='body2'>&nbsp;<b>Identifications</b></Typography>
    </div>
    return (
        <IBox title={title} action={<AddIconButton onClick={handleNew}/>}>
            {
                identifications.map((it, index) => <Fragment key={it.id}>
                    <DetailView data={displayData(it)}/>
                    {
                        stillCounting(index) && <Divider/>
                    }
                </Fragment>)
            }
            <EditDialog title={selected ? "Edit Identification" : "New Identification"} open={dialog} onClose={handleClose}>
                <IdentificationEditor data={selected} isNew={!selected} contactId={id} done={handleClose}/>
            </EditDialog>
        </IBox>
    );
}
export default Identifications;
