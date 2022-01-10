import React, { useEffect, useState } from 'react';
import { Button, createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import { XHeadCell } from '../../../components/table/XTableHead';
import { appPermissions, remoteRoutes } from '../../../data/constants';
import ListHeader from '../../../components/ListHeader';
import AddIcon from '@material-ui/icons/Add';
import XTable from '../../../components/table/XTable';
import EditDialog from '../../../components/EditDialog';
import Loading from '../../../components/Loading';
import AddHelpFileButton from './AddHelpFile';
import { useSelector } from 'react-redux';
import { hasAnyRole } from '../../../data/appRoles';
import { IState } from '../../../data/types';
import EditHelpFile from './EditHelpFile';
import { get } from '../../../utils/ajax';
import Navigation from '../../../components/layout/Layout';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    filterPaper: {
      borderRadius: 0,
      padding: theme.spacing(2),
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

const headCells: XHeadCell[] = [
    {
      name: 'url',
      label: 'URL',
    },
    { name: 'title',
      label: 'Title' },
    {
      name: 'category',
      label: 'Category',
    },
    {
      name: 'Edit/Delete',
      label: 'Edit/Delete',
      render: (value, rec) => <EditHelpFile value={rec} />,
    },
  ];

const HelpFilesDisplay = () => {

    const [createDialog, setCreateDialog] = useState(false);

    const classes = useStyles();
    const [data, setData] = useState<any[]>([]);
  
    const user = useSelector((state: IState) => state.core.user);
    const [filter, setFilter] = useState<any>({ limit: 5000 });
  
    const [loading, setLoading] = useState<boolean>(false);
  
    function handleNew() {
      setCreateDialog(true);
    }
  
    const handleItemClick = (id: number) => () => {};
  
    function closeCreateDialog() {
      setCreateDialog(false);
    }
  
    useEffect(() => {
      setLoading(true);
      get(
        `${remoteRoutes.help}`,
        (data) => {
          setData(data);
          console.log(data);
        },
        undefined,
        () => {
          setLoading(false);
        }
      );
    }, [createDialog]);
  
    const createTitle = 'Help Files';
    return (
      <Navigation>
        <Box>
          <Box p={1} className={classes.root}>
            <ListHeader
              title="Help Files"
              onFilter={setFilter}
              loading={loading}
              buttons={
                <>
                  {hasAnyRole(user, [appPermissions.roleEventEdit]) && (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleNew}
                      style={{ marginLeft: 8 }}
                    >
                      Add New File&nbsp;&nbsp;
                    </Button>
                  )}
                </>
              }
              filter={undefined}
            />
            <Hidden smDown>
              <Box pt={1}>
                {loading ? (
                  <Loading />
                ) : (
                  <XTable
                    headCells={headCells}
                    data={data}
                    initialRowsPerPage={10}
                    initialSortBy="name"
                    handleSelection={handleItemClick}
                  />
                )}
              </Box>
            </Hidden>
          </Box>
          <EditDialog
            title={createTitle}
            open={createDialog}
            onClose={closeCreateDialog}
          >
            <AddHelpFileButton
              data={{}}
              isNew={true}
              done={closeCreateDialog}
            />
          </EditDialog>
        </Box>
      </Navigation>
    );
};

export default HelpFilesDisplay;