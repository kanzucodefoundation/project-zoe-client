import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { useFilter } from '../../../utils/fitlerUtilities';
import { PRemoteSelect } from '../../../components/plain-inputs/PRemoteSelect';
import { remoteRoutes } from '../../../data/constants';

interface IProps {
  onFilter: (data: any) => any;
}

const initialData: any = {
  query: '',
  categoryId: '',
  limit: 200,
  skip: 0,
};
const ReportFieldsFilter = ({ onFilter }: IProps) => {
  const { data, handleComboChange } = useFilter({
    initialData,
    onFilter,
    comboFields: ['categoryId'],
  });

  return (
    <form>
      <Grid spacing={2} container>
        <Grid item xs={6} md={6}>
          <PRemoteSelect
            remote={remoteRoutes.eventsCategories}
            name="categoryId"
            label="CategoryId"
            variant="outlined"
            size="small"
            margin="none"
            onChange={(value) => handleComboChange('categoryId', value)}
            value={data.categoryId}
            searchOnline
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ReportFieldsFilter;
