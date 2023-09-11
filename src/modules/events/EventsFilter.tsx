import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { format, lastDayOfWeek, startOfWeek } from 'date-fns';
import { remoteRoutes } from '../../data/constants';
import { PRemoteSelect } from '../../components/plain-inputs/PRemoteSelect';
import PDateInput from '../../components/plain-inputs/PDateInput';
import { useFilter } from '../../utils/fitlerUtilities';

interface IProps {
  onFilter: (data: any) => any;
  showCategoriesFilter?: boolean;
  showGroupsFilter?: boolean;
  showParentGroupsFilter?: boolean;
  parentGroupName?: string;
}

const today = new Date();
const startPeriod = startOfWeek(today);
const endPeriod = lastDayOfWeek(today);

const initialData: any = {
  query: '',
  groupIdList: [],
  categoryIdList: [],
  parentGroupIdList: [],
  from: `${format(new Date(startPeriod), 'PP')}`,
  to: `${format(new Date(endPeriod), 'PP')}`,
  limit: 200,
  skip: 0,
};
const EventsFilter = ({ onFilter, showCategoriesFilter, showGroupsFilter, showParentGroupsFilter, parentGroupName }: IProps) => {
  const { data, handleComboChange, handleDateChange } = useFilter({
    initialData,
    onFilter,
    comboFields: ['categoryIdList', 'groupIdList','parentGroupIdList'],
  });
  return (
    <form>
      <Grid spacing={2} container>
      { showCategoriesFilter && (
          <Grid item xs={12} md>
            <PRemoteSelect
              remote={remoteRoutes.eventsCategories}
              name="categoryIdList"
              label="Categories"
              variant="outlined"
              size="small"
              margin="none"
              multiple
              onChange={(value) => handleComboChange('categoryIdList', value)}
              value={data.categoryIdList}
              searchOnline
            />
          </Grid>
      )}
        {showGroupsFilter && (
          <Grid item xs={12} md>
            <PRemoteSelect
              remote={remoteRoutes.groupsCombo}
              name="groupIdList"
              label="Groups"
              variant="outlined"
              size="small"
              margin="none"
              multiple
              onChange={(value) => handleComboChange('groupIdList', value)}
              value={data.groupIdList}
              searchOnline
            />
          </Grid>
        )}
        <Grid item xs={12} md>
          <PDateInput
            name="from"
            value={data.from}
            onChange={(value) => handleDateChange('from', value)}
            label="From"
            inputVariant="outlined"
          />
        </Grid>
        <Grid item xs={12} md>
          <PDateInput
            name="to"
            value={data.to}
            label="To"
            inputVariant="outlined"
            onChange={(value) => handleDateChange('to', value)}
          />
        </Grid>
        {showParentGroupsFilter && (
          <Grid item xs={12} md>
            <PRemoteSelect
              remote={`${remoteRoutes.groupsCombo}?categories=${parentGroupName}`} 
              name="parentGroupIdList"
              label={parentGroupName || 'Zone'}
              variant="outlined"
              size="small"
              margin="none"
              multiple
              onChange={(value) => handleComboChange('parentGroupIdList', value)}
              value={data.parentGroupIdList}
              searchOnline
            />
          </Grid>
        )}
      </Grid>
    </form>
  );
};

export default EventsFilter;
