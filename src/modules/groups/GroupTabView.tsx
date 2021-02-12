import React from 'react';
import Layout from "../../components/layout/Layout";
import GroupsList from "./GroupsList";
import TabbedView from "./TabbedView";
import {Typography} from '@material-ui/core';


interface IProps {
}

const GroupTabView = (props: IProps) => {
    return (
        <Layout>
            <TabbedView
                tabs={[
                    {
                        name:"List View",
                        component:<GroupsList/>
                    },
                    {
                        name:"Map View",
                        component:<Typography>Coming soon</Typography>
                    }
                ]}
            />
        </Layout>
    );
}

export default GroupTabView;
