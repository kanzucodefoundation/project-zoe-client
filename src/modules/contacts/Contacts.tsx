import React, { Fragment, useEffect, useState } from "react";
import Navigation from "../../components/layout/Layout";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { IContactListDto, IContactsFilter } from "./types";
import XTable from "../../components/table/XTable";
import { XHeadCell } from "../../components/table/XTableHead";
import ContactLink from "../../components/ContactLink";
import { search } from "../../utils/ajax";
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from "../../data/constants";
import Loading from "../../components/Loading";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../components/EditDialog";
import NewPersonForm from "./NewPersonForm";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Typography from "@material-ui/core/Typography";
import UploadIcon from "@material-ui/icons/CloudUpload";
import { IMobileRow } from "../../components/DataList";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import { useHistory } from "react-router";
import { hasValue } from "../../components/inputs/inputHelpers";
import { useDispatch, useSelector } from "react-redux";
import { crmConstants, ICrmState } from "../../data/contacts/reducer";
import { printBirthday } from "../../utils/dateHelpers";
import GroupLink from "../../components/GroupLink";
import PersonAvatar from "../../components/PersonAvatar";
import { hasAnyRole } from "../../data/appRoles";
import { IState } from "../../data/types";
import ListHeader from "../../components/ListHeader";
import Button from "@material-ui/core/Button";
import ContactFilter from "./ContactFilter";
import ContactUpload from "./ContactUpload";

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
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

const headCells: XHeadCell[] = [
  {
    name: "id",
    label: "Name",
    render: (value, rec) => <ContactLink id={value} name={rec.name} />,
  },
  { name: "phone", label: "Phone" },
  { name: "dateOfBirth", label: "D.O.B", render: printBirthday },
  {
    name: "cellGroup",
    label: "MC",
    render: (value) =>
      hasValue(value) ? <GroupLink id={value.id} name={value.name} /> : "-na-",
  },
  {
    name: "location",
    label: "Location",
    render: (value) =>
      hasValue(value) ? <GroupLink id={value.id} name={value.name} /> : "-na-",
  },
];

const toMobileRow = (data: IContactListDto): IMobileRow => {
  return {
    avatar: <PersonAvatar data={data} />,
    primary: data.name,
    secondary: (
      <>
        <Typography variant="caption" color="textSecondary" display="block">
          {data.email}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {data.phone}
        </Typography>
      </>
    ),
  };
};

const Contacts = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [createDialog, setCreateDialog] = useState(false);
  const { data, loading }: ICrmState = useSelector((state: any) => state.crm);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [filter, setFilter] = useState<IContactsFilter>({
    limit: 200,
  });
  const user = useSelector((state: IState) => state.core.user);
  const classes = useStyles();

  useEffect(() => {
    dispatch({
      type: crmConstants.crmFetchLoading,
      payload: true,
    });
    search(
      remoteRoutes.contacts,
      filter,
      (resp) => {
        dispatch({
          type: crmConstants.crmFetchAll,
          payload: [...resp],
        });
      },
      undefined,
      () => {
        dispatch({
          type: crmConstants.crmFetchLoading,
          payload: false,
        });
      }
    );
  }, [filter, dispatch]);

  function handleNew() {
    setCreateDialog(true);
  }

  const handleItemClick = (id: string) => () => {
    history.push(`${localRoutes.contacts}/${id}`);
  };

  function closeCreateDialog() {
    setCreateDialog(false);
  }

  function handleUpload() {
    setUploadDialog(true);
  }

  function handleUploadComplete() {
    setFilter({ ...filter });
    setUploadDialog(false);
  }

  function closeUploadDialog() {
    setUploadDialog(false);
  }

  const createTitle = "New Person";
  return (
    <Navigation>
      <Box p={1} className={classes.root}>
        <ListHeader
          title="People"
          onFilter={setFilter}
          filter={filter}
          filterComponent={<ContactFilter onFilter={setFilter} />}
          loading={loading}
          buttons={
            <>
              {hasAnyRole(user, [appPermissions.roleCrmEdit]) && (
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
              {hasAnyRole(user, [appPermissions.roleCrmEdit]) && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onClick={handleUpload}
                  style={{ marginLeft: 8 }}
                >
                  Upload&nbsp;&nbsp;
                </Button>
              )}
            </>
          }
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
        <Hidden mdUp>
          <List>
            {loading ? (
              <Loading />
            ) : (
              data.map((row: any) => {
                const mobileRow = toMobileRow(row);
                return (
                  <Fragment key={row.id}>
                    <ListItem
                      alignItems="flex-start"
                      button
                      disableGutters
                      onClick={handleItemClick(row.id)}
                    >
                      <ListItemAvatar>{mobileRow.avatar}</ListItemAvatar>
                      <ListItemText
                        primary={mobileRow.primary}
                        secondary={mobileRow.secondary}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </Fragment>
                );
              })
            )}
          </List>
          {hasAnyRole(user, [appPermissions.roleCrmEdit]) ? (
            <Fab
              aria-label="add-new"
              className={classes.fab}
              color="primary"
              onClick={handleNew}
            >
              <AddIcon />
            </Fab>
          ) : null}
        </Hidden>
      </Box>
      <EditDialog
        title={createTitle}
        open={createDialog}
        onClose={closeCreateDialog}
      >
        <NewPersonForm data={{}} done={closeCreateDialog} />
      </EditDialog>
      <ContactUpload
        show={uploadDialog}
        onClose={closeUploadDialog}
        onDone={handleUploadComplete}
      />
    </Navigation>
  );
};

export default Contacts;
