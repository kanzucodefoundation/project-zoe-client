import { Grid } from '@material-ui/core';
import { FormikHelpers } from 'formik';
import React from 'react';
import { useHistory } from 'react-router';
import XForm from '../../../components/forms/XForm';
import XDateTimeInput from '../../../components/inputs/XDateTimeInput';
import XTextAreaInput from '../../../components/inputs/XTextAreaInput';
import XTextInput from '../../../components/inputs/XTextInput';
import { remoteRoutes } from '../../../data/constants';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';
import { IEvent } from '../types';

interface IProps {
    event: IEvent;
}

const EventMetadata = ({event}: IProps) => {
  const history = useHistory();

  function handleSave(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      id: event.id,
      metaData: {...values},
    }

    const submission: ISubmission = {
      url: remoteRoutes.events,
      values: toSave,
      actions,
      isNew: false,
      onAjaxComplete: (data: any) => {
        actions.setSubmitting(false)
        history.go(0)
      }
    }
    handleSubmission(submission)
  }

  const createField = (it: any) => {
    if (it.type === 'number') {
      return ( 
        <Grid key={it.name} item xs={12} >
          <XTextInput
            name={it.name}
            label={it.label}
            margin='none'
            variant='outlined'
            type='number'
          />
        </Grid>
      )
    } 
    if (it.type === 'date') {
      return ( 
        <Grid key={it.name} item xs={12} >
          <XDateTimeInput
            name={it.name}
            label={it.label}
            variant="outlined"
          />
        </Grid>
      )
    } 
    if (it.type === 'textarea') {
      return ( 
        <Grid key={it.name} item xs={12} >
          <XTextAreaInput
            name={it.name}
            label={it.label}
            variant="outlined"
          />
        </Grid>
      )
    } 
    return ( 
      <Grid key={it.name} item xs={12} >
        <XTextInput
          name={it.name}
          label={it.label}
          margin='none'
          variant='outlined'
        />
      </Grid>
    )
  }

  return (
    <>
      {
        <XForm
          onSubmit={handleSave}
          initialValues={event.metaData}
        >
          <div style={{padding: 8}}>
            <Grid spacing={2} container className='min-width-100'>
              { event.category.fields.map(createField) }
            </Grid>   
          </div>
        </XForm>
      }      
    </>
  )
}

export default EventMetadata





