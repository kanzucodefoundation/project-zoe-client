import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import ListHeader from '../../components/ListHeader';
import ContactFilter from '../contacts/ContactFilter';
import { IContactsFilter } from '../contacts/types';
import { ICrmState } from '../../data/contacts/reducer';
import SendEmail from './SendEmail';

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
      />
      <p>
        <SendEmail />  
      </p>
    </Layout>
  );
};

export default MailChat;
