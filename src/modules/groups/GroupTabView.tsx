import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Layout from '../../components/layout/Layout';
import GroupsList from './GroupsList';
import TabbedView from './TabbedView';
import { IGroup } from './types';
import { IState } from '../../data/types';
import { search } from '../../utils/ajax';
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from '../../data/constants';
import EditDialog from '../../components/EditDialog';
import GroupEditor from './editors/GroupEditor';
import { hasAnyRole } from '../../data/appRoles';
import ListHeader from '../../components/ListHeader';
import GroupMapView from './GroupMapView';

interface IGroupMarkers {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

const GroupTabView = () => {
  const [filter, setFilter] = useState<any>({});
  const [selected, setSelected] = useState<IGroup | null>(null);
  const [data, setData] = useState<IGroup[]>([]);
  const user = useSelector((state: IState) => state.core.user);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialog, setDialog] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const history = useHistory();
  function handleClose() {
    setDialog(false);
  }

  function handleNew() {
    setSelected(null);
    setDialog(true);
  }

  function handleAddUnder(dt: any) {
    setSelected(dt);
    setDialog(true);
  }

  function handleAdded(dt: any) {
    setSelected(dt);
    setDialog(false);
    setData([...data, dt]);
  }

  function handleDetails(dt: any) {
    history.push(`${localRoutes.groups}/${dt.id}`);
  }

  function handleFilter(value: any) {
    setFilter({ ...filter, ...value });
  }

  function extractAddressFromEachGroup(groups: any[]) {
    const addresses = [];
    for (const group of groups) {
      if (group.address === null) {
      } else {
        const address = {
          name: group.name,
          location: {
            lat: group.address.latitude,
            lng: group.address.longitude,
          },
        };
        addresses.push(address);
      }
    }
    return addresses;
  }

  const starterData = selected
    ? {
      parent: {
        id: selected.id,
        name: selected.name,
      },
    }
    : undefined;

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.groups,
      filter,
      (data) => {
        const groupAddresses = extractAddressFromEachGroup(data);
        setAddresses(groupAddresses);
        setData(data);
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  }, [filter]);
  return (
    <Layout title="Groups">
      <Box>
        <Box mb={1}>
          <ListHeader
            title="Groups"
            onFilter={handleFilter}
            filter={filter}
            loading={loading}
            buttons={
              <>
                {hasAnyRole(user, [appPermissions.roleGroupEdit]) && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleNew}
                    style={{ marginLeft: 8 }}
                  >
                    Add new&nbsp;&nbsp;
                  </Button>
                )}
              </>
            }
          />
        </Box>

        <TabbedView
          tabs={[
            {
              name: 'List View',
              component: (
                <GroupsList
                  loading={loading}
                  data={data}
                  handleAddUnder={handleAddUnder}
                  handleDetails={handleDetails}
                  selected={selected}
                />
              ),
            },
            {
              name: 'Map View',
              component: <GroupMapView
              data={addresses}
              />,
            },
          ]}
        />

        <EditDialog open={dialog} onClose={handleClose} title="Add new group">
          <GroupEditor
            data={starterData}
            isNew={true}
            onCreated={handleAdded}
            onCancel={handleClose}
          />
        </EditDialog>
      </Box>
    </Layout>
  );
};

export default GroupTabView;
