import React from 'react';
import Layout from "../../components/layout/Layout";
import TreeView from "./TreeView";


interface IProps {
}

const Groups = (props: IProps) => {
    return (
        <Layout>
            <TreeView/>
        </Layout>
    );
}


export default Groups;
