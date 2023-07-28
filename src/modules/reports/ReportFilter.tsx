import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { lastDayOfWeek, startOfWeek } from 'date-fns/esm';
import PDateInput from '../../components/plain-inputs/PDateInput';
import useFilter from '../../utils/fitlerUtilities';
import { remoteRoutes } from '../../data/constants';
import { PRemoteSelect } from '../../components/plain-inputs/PRemoteSelect';

interface IProps {
  onFilter: (data: any) => any;
}

const initialData: any = {
  query: '',
  'cellGroups[]': [
    'All',
    'No. Of Teenagers',
    'No. Of Children',
    'No. of Adults',
  ],

  startDate: startOfWeek(new Date()),
  endDate: lastDayOfWeek(new Date()),
  limit: 100,
  skip: 0,
};
const ReportFilter = ({ onFilter }: IProps) => {
  const { data, handleDateChange, handleComboChange } = useFilter({
    initialData,
    onFilter,
    comboFields: ['cellGroups[]'],
  });

  return (
    <form>
      <Grid spacing={2} container>
        <Grid item xs={12} md>
          <PDateInput
            name="startDate"
            label="Start Date"
            inputVariant="outlined"
            value={data.from}
            onChange={(value) => handleDateChange('from', value)}
          />
        </Grid>
        <Grid item xs={12} md>
          <PDateInput
            name="startDate"
            label="End Date"
            inputVariant="outlined"
            value={data.to}
            onChange={(value) => handleDateChange('to', value)}
          />
        </Grid>
        <Grid item xs={12} md>
          <PRemoteSelect
            remote={remoteRoutes.groupsCombo}
            filter={{ 'cellGroups[]': 'Attendees' }}
            parser={({ name, id }: any) => ({ name, id })}
            name="cellGroups[]"
            label="Attendees"
            variant="outlined"
            size="small"
            margin="none"
            multiple
            onChange={(value) => handleComboChange('cellGroups[]', value)}
            value={data['cellGroups[]']}
            searchOnline
          />
          {/* <XSelectInput
              name="attendees"
              label="Attendees"
              options={toOptions(attendeeCategories)}
              variant="outlined"
              margin="none"
            /> */}
        </Grid>
      </Grid>
    </form>
  );
};

export default ReportFilter;
