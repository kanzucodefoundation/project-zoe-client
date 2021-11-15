import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import ListHeader from '../../components/ListHeader';
import ContactFilter from '../contacts/ContactFilter';
import { IContactsFilter } from '../contacts/types';
import { useSelector } from 'react-redux';
import { ICrmState } from '../../data/contacts/reducer';
import SendEmail from './SendEmail';
import Chatlib from '../chatapp/Chatlib';

const MailChat = () => {
  const { data, loading }: ICrmState = useSelector((state: any) => state.crm);
  const [filter, setFilter] = useState<IContactsFilter>({
    limit: 200,
  });
  return (
    <Layout>
      {' '}
      <ListHeader
        title="Chat"
        onFilter={setFilter}
        filter={filter}
        filterComponent={<ContactFilter onFilter={setFilter} />}
        loading={loading}
        buttons={
          <>
            <SendEmail/>
          </>
        }
      />
       <div>
         <Chatlib/>
          {/*MORE COMING SOON 
       user.contactId
loggedIn: user.contactId  remoteRoutes.membersActivity/${user.contactId}
remoteRoutes.membersActivity/1
Kenneth Kisakye11:59 AM
`${remoteRoutes.membersActivity}/${user.contactId}}` */}
</div>
    </Layout>
  );
};

export default MailChat;
