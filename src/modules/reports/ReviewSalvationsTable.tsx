import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Avatar, Modal, makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import PersonIcon from '@material-ui/icons/Person';
import Hidden from '@material-ui/core/Hidden';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { useSelector } from 'react-redux';
import Divider from '@material-ui/core/Divider';
import { XHeadCell } from '../../components/table/XTableHead';
import { AddFabButton } from '../../components/EditIconButton';
import { search } from '../../utils/ajax';
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from '../../data/constants';
import { hasValue } from '../../components/inputs/inputHelpers';
import ListHeader from '../../components/ListHeader';
import Loading from '../../components/Loading';
import EditDialog from '../../components/EditDialog';
import UserEditor from '../admin/users/UserEditor';
import { IUserDto, IUsersFilter } from '../admin/users/types';
import { IState } from '../../data/types';
import { hasAnyRole } from '../../data/appRoles';
import SalvationsDataList from '../../components/SalvationsDataList';

const columns: XHeadCell[] = [
  {
    name: 'isActive',
    label: 'Status',
    render: (value) => (
      <Chip
        label={value ? 'Active' : 'Inactive'}
        color="secondary"
        size="small"
      />
    ),
  },
  {
    name: 'avatar',
    label: 'Avatar',
    render: (data) => {
      const hasAvatar = hasValue(data);
      return hasAvatar ? (
        <Avatar alt="Avatar" src={data} />
      ) : (
        <Avatar>
          <PersonIcon />
        </Avatar>
      );
    },
    cellProps: {
      width: 50,
    },
  },
  {
    name: 'username',
    label: 'Username',
  },
  {
    name: 'fullName',
    label: 'Full Name',
    cellProps: {
      component: 'th',
      scope: 'row',
    },
  },
  {
    name: 'isDuplicate',
    label: 'Is Duplicate ?',
    render: (roles: string[]) => {
      return (
        <Box>
          <Button>Yes</Button>
          <Button>No</Button>
        </Box>
      );
    },
  },
  {
    name: 'action',
    label: 'Action',
    render: (openModal: (rowId: string) => {}, id) => {
      return (
        <Box>
          <Button onClick={() => openModal(id)}>Review</Button>
        </Box>
      );
    },
  },
];

interface IMobileRow {
  avatar: any;
  primary: any;
  secondary: any;
}

const toMobile = (data: IUserDto): IMobileRow => {
  const hasAvatar = hasValue(data.avatar);
  return {
    avatar: hasAvatar ? (
      <Avatar alt="Avatar" src={data.avatar} />
    ) : (
      <>
        <Avatar>
          <PersonIcon />
        </Avatar>
        <Box>{`${data.fullName}\t`}</Box>
      </>
    ),
    primary: (
      <>
        <Chip
          label={data.isActive ? 'Active' : 'Inactive'}
          color={data.isActive ? 'secondary' : 'default'}
          size="small"
        />
      </>
    ),
    secondary: (
      <Box pt={0.5}>
        <Typography variant="caption" color="textSecondary">
          {data.fullName}
        </Typography>
        <Box pt={0.5}>
          {data.roles?.map((it: any) => (
            <Chip
              color="primary"
              variant="outlined"
              key={it}
              style={{ margin: 5, marginLeft: 0, marginTop: 0 }}
              size="small"
              label={it}
            />
          ))}
        </Box>
      </Box>
    ),
  };
};

const useStyles = makeStyles((theme) => ({
  greenButton: {
    backgroundColor: 'green',
    color: 'white',
    marginRight: theme.spacing(2), // Adds margin-right of 5 units
    '&:hover': {
      backgroundColor: 'darkgreen', // Optional hover effect
    },
  },
  redButton: {
    backgroundColor: 'red',
    color: 'white',
    '&:hover': {
      backgroundColor: 'darkred', // Optional hover effect
    },
  },
}));

const ReviewSalvationsTable = () => {
  const history = useHistory();
  const [filter, setFilter] = useState<IUsersFilter>({ limit: 500 });
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [dialog, setDialog] = useState<boolean>(false);
  const user = useSelector((state: IState) => state.core.user);
  const [activeRowId, setActiveRowId] = useState<number>();
  const [open, setOpen] = React.useState(false);
  const [isDuplicate, setIsDuplicate] = React.useState(false);

  const handleOpen = (rowId: string) => {
    setOpen(true);
    console.log('rowid', rowId);
    setActiveRowId(parseInt(rowId));
  };
  const handleCloseModal = () => setOpen(false);

  const removeUser = () => {
    setData(data.filter((item) => item.id != activeRowId));
    setOpen(false);
  };

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.users,
      filter,
      (resp) => {
        setData([
          {
            avatar:
              'https://gravatar.com/avatar/b3f4f05a52a00fb808ea4caa970129fa?s=200&d=retro',
            contact: {
              id: 1,
              name: 'John Deere',
            },
            id: 1,
            roles: ['RoleAdmin'],
            isActive: true,
            username: 'john.doe@kanzucodefoundation.org',
            contactId: 1,
            fullName: 'John Deere',
          },
          {
            avatar:
              'https://gravatar.com/avatar/4ee0dc301b36908c69c9788aa0b1853c?s=200&d=retro',
            contact: {
              id: 2,
              name: 'Jane Deere',
            },
            id: 2,
            roles: ['RoleAdmin'],
            isActive: true,
            username: 'jane.doe@kanzucodefoundation.org',
            contactId: 2,
            fullName: 'Jane Deere',
          },
        ]);
      },
      undefined,
      () => setLoading(false),
    );
  }, [filter]);

  function handleFilter(value: any) {
    setFilter({ ...filter, ...value });
  }

  function handleNew() {
    setSelected(null);
    setDialog(true);
  }

  const handleEdit = (dt: any) => {
    const { id, username, contactId, fullName, roles, isActive } = dt;
    const toEdit = {
      id,
      username,
      roles: [...roles],
      contact: { id: contactId, label: fullName },
      isActive,
    };
    setSelected(toEdit);
    setDialog(true);
  };

  const handleView = (dt: any) => {
    history.push(`${localRoutes.contacts}/${dt.id}`);
  };

  const handleClose = () => {
    // setSelected(null);
    setDialog(false);
  };

  const handleComplete = (dt: any) => {
    if (selected) {
      const newData = data.map((it: any) => {
        if (it.id === dt.id) return dt;
        return it;
      });
      setData(newData);
    } else {
      const newData = [...data, dt];
      setData(newData);
    }
    handleClose();
  };

  function handleDeleted(dt: any) {
    const newData = data.filter((it: any) => it.id !== dt.id);
    setData(newData);
    handleClose();
  }

  const buttonClasses = useStyles();

  const canEditUsers = hasAnyRole(user, [appPermissions.roleUserEdit]);
  const canViewUsers = hasAnyRole(user, [appPermissions.roleUserView]);

  const modalstyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>
      <Box mb={1}>
        <ListHeader
          title="Users"
          onFilter={handleFilter}
          filter={filter}
          loading={loading}
          buttons={
            <>
              {canEditUsers && (
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
      <Box pt={1}>
        <Divider />
        {loading ? (
          <Loading />
        ) : (
          <SalvationsDataList
            data={data}
            toMobileRow={toMobile}
            columns={columns}
            onEditClick={canEditUsers ? handleEdit : undefined}
            onViewClick={canViewUsers ? handleView : undefined}
            handleOpenModal={handleOpen}
          />
        )}
      </Box>
      {canEditUsers && (
        <Hidden mdUp>
          <AddFabButton onClick={handleNew} />
        </Hidden>
      )}
      {canEditUsers && (
        <EditDialog
          title={selected ? `Edit ${selected.username}` : 'Create User'}
          open={dialog}
          onClose={handleClose}
        >
          <UserEditor
            data={selected}
            isNew={!selected}
            done={handleComplete}
            onDeleted={handleDeleted}
            onCancel={handleClose}
          />
        </EditDialog>
      )}
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            className={buttonClasses.greenButton}
            onClick={() => setOpen(false)}
          >
            Keep
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={removeUser}
            className={buttonClasses.redButton}
          >
            Delete
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default ReviewSalvationsTable;
