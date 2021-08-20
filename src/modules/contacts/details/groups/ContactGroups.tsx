import React, { useEffect, useState } from "react";
import { IContact, ITeamMember } from "../../types";
import { get } from "../../../../utils/ajax";
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from "../../../../data/constants";
import { useHistory } from "react-router";
import NewGroupJoinRequestForm from "./NewGroupJoinRequestForm";
import XList, { ListItemData } from "../../../../components/list/XList";
import { getInitials } from "../../../../utils/stringHelpers";
import { Alert } from "@material-ui/lab";
import Box from "@material-ui/core/Box";
import { hasAnyRole } from "../../../../data/appRoles";
import { IAuthUser } from "../../../../data/types";

interface IProps {
  contactId: string;
  contact: IContact;
  isOwnProfile: boolean;
  profile: IAuthUser;
}

const ContactGroups = ({
  isOwnProfile,
  contactId,
  contact,
  profile,
}: IProps) => {
  const history = useHistory();
  const [data, setData] = useState<ITeamMember[]>([]);
  const hasGroupView = hasAnyRole(profile, [appPermissions.roleGroupView]);

  const handleView = (dt: any) => {
    if (hasGroupView) {
      history.push(localRoutes.groups + "/" + dt);
    }
  };

  useEffect(() => {
    get(remoteRoutes.groupsMembership + `/?contactId=` + contactId, (resp) => {
      const groups: ITeamMember[] = [];
      resp.map((it: any) => {
        groups.push({
          id: it.group.id,
          name: it.group.name,
          details: it.group.groupDetails,
          role: it.role,
        });
      });
      setData(groups);
    });
  }, [contactId]);

  const dataParser = (dt: any): ListItemData => {
    return {
      primaryText: dt.name,
      secondaryText: `Role: ${dt.role}`,
      avatar: getInitials(dt.name),
    };
  };

  return (
    <Box>
      {isOwnProfile ? (
        <Box pb={1}>
          <NewGroupJoinRequestForm contact={contact} />
        </Box>
      ) : null}
      <Box>
        {data.length === 0 ? (
          <Alert severity="info">No groups yet!</Alert>
        ) : (
          <XList
            data={data}
            onSelect={(dt: any) => handleView(dt.id)}
            parser={dataParser}
          />
        )}
      </Box>
    </Box>
  );
};

export default ContactGroups;
