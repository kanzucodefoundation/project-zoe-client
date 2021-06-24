import React from "react";
import TabbedView from "../groups/TabbedView";
import Layout from "../../components/layout/Layout";
import UnsubmittedReports from "./UnsubmittedReports";
import EventsList from "./EventsList";

export default function EventReports() {
  const tabs = [
    {
      name: "submitted",
      component: <EventsList />,
    },
    {
      name: "Unsubmitted",
      component: <UnsubmittedReports />,
    },
  ];

  return (
    <Layout>
      <TabbedView tabs={tabs} />
    </Layout>
  );
}
