import { Grid } from "@material-ui/core";
import {
  Build,
  EmojiPeople,
  Grain,
  Info,
  Money,
  People,
  Restore,
} from "@material-ui/icons";
import { filter } from "lodash";
import React from "react";
import { printInteger, printMoney } from "../../utils/numberHelpers";
import { IEvent } from "../events/types";
import UsersByDevice from "./UsersByDevice";
import Widget from "./Widget";
import { AgField, aggregateValue, aggregateValues } from "./utils";

interface IProps {
  currWeekEvents: IEvent[];
  prevWeekEvents: IEvent[];
}

const fields: AgField[] = [
  {
    path: "metaData.giving",
    name: "giving",
  },
  {
    path: "metaData.noOfSalvations",
    name: "noOfSalvations",
  },
  {
    path: "metaData.noOfBaptisms",
    name: "noOfBaptisms",
  },
  {
    path: "metaData.noOfMechanics",
    name: "noOfMechanics",
  },
  {
    path: "metaData.noOfRecommitments",
    name: "noOfRecommitments",
  },
  {
    path: "metaData.totalMcAttendance",
    name: "totalMcAttendance",
  },
  {
    path: "metaData.totalGarageAttendance",
    name: "totalGarageAttendance",
  },
];
const DashboardData = ({ currWeekEvents, prevWeekEvents }: IProps) => {
  const currentData = aggregateValues(currWeekEvents, fields);
  const previousData = aggregateValues(prevWeekEvents, fields);
  const totalMcAttendance = aggregateValue(
    filter(currWeekEvents, { categoryId: "mc" }),
    "attendance"
  );
  const totalMcAttendancePrev = aggregateValue(
    filter(prevWeekEvents, { categoryId: "mc" }),
    "attendance"
  );

  // const [babies, setBabies] = useState<number>(0);
  // const [prevBabies, setPrevBabies] = useState<number>(0);
  // const [weddings, setWeddings] = useState<number>(0);
  // const [prevWeddings, setPrevWeddings] = useState<number>(0);

  const getPercentage = (prev: number, current: number) => {
    if (prev > 0) {
      return ((current - prev) / prev) * 100;
    }
    return 0;
  };

  const data = [
    {
      title: "MC Attendance",
      value: printInteger(totalMcAttendance),
      percentage: getPercentage(totalMcAttendance, totalMcAttendancePrev),
      icon: Grain,
    },
    {
      title: "Salvation",
      value: printInteger(currentData.noOfSalvations),
      percentage: getPercentage(
        previousData.noOfSalvations,
        currentData.noOfSalvations
      ),
      icon: Info,
    },
    {
      title: "No. of Mechanics",
      value: printInteger(currentData.noOfMechanics),
      percentage: getPercentage(
        previousData.noOfMechanics,
        currentData.noOfMechanics
      ),
      icon: Build,
    },
    {
      title: "No. of Baptisms",
      value: printInteger(currentData.noOfBaptisms),
      percentage: getPercentage(
        previousData.noOfBaptisms,
        currentData.noOfBaptisms
      ),
      icon: EmojiPeople,
    },
    {
      title: "No. of Recommitments",
      value: printInteger(currentData.noOfRecommitments),
      percentage: getPercentage(
        previousData.noOfRecommitments,
        currentData.noOfRecommitments
      ),
      icon: Restore,
    },
    {
      title: "Garage Attendance",
      value: printInteger(currentData.totalGarageAttendance),
      percentage: getPercentage(
        previousData.totalGarageAttendance,
        currentData.totalGarageAttendance
      ),
      icon: People,
    },
    {
      title: "Giving",
      value: printMoney(currentData.giving),
      percentage: getPercentage(previousData.giving, currentData.giving),
      icon: Money,
    },
  ];

  return (
    <Grid container spacing={2}>
      {data.map((it) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={it.title}>
          <Widget {...it} />
        </Grid>
      ))}
      <Grid item xs={12} md={6}>
        <UsersByDevice />
      </Grid>
    </Grid>
  );
};

export default DashboardData;
