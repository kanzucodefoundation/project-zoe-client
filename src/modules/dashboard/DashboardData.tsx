import { Grid } from '@material-ui/core';
import {
  Build,
  EmojiPeople,
  Grain,
  Info,
  Money,
  People,
} from '@material-ui/icons';
import { filter } from 'lodash';
import React from 'react';
import { printInteger, printMoney } from '../../utils/numberHelpers';
import { IEvent, IInterval } from '../events/types';
import Widget from './Widget';
import { AgField, aggregateValue, aggregateValues } from './utils';

interface IProps {
  currDataEvents: IEvent[];
  prevDataEvents: IEvent[];
  interval: IInterval | undefined;
}

const fields: AgField[] = [
  {
    path: 'metaData.giving',
    name: 'giving',
  },
  {
    path: 'metaData.noOfSalvations',
    name: 'noOfSalvations',
  },
  {
    path: 'metaData.noOfBaptisms',
    name: 'noOfBaptisms',
  },
  {
    path: 'metaData.noOfMechanics',
    name: 'noOfMechanics',
  },
  {
    path: 'metaData.totalMcAttendance',
    name: 'totalMcAttendance',
  },
  {
    path: 'metaData.totalGarageAttendance',
    name: 'totalGarageAttendance',
  },
];
const DashboardData = ({
  currDataEvents,
  prevDataEvents,
  interval,
}: IProps) => {
  const currentData = aggregateValues(currDataEvents, fields);
  const previousData = aggregateValues(prevDataEvents, fields);
  const totalMcAttendance = aggregateValue(
    filter(currDataEvents, { categoryId: 'mc' }),
    'attendance',
  );
  const totalMcAttendancePrev = aggregateValue(
    filter(prevDataEvents, { categoryId: 'mc' }),
    'attendance',
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
      title: 'Small Group Attendance',
      value: printInteger(totalMcAttendance),
      percentage: getPercentage(totalMcAttendance, totalMcAttendancePrev),
      icon: Grain,
    },
    {
      title: 'Salvations',
      value: printInteger(currentData.noOfSalvations),
      percentage: getPercentage(
        previousData.noOfSalvations,
        currentData.noOfSalvations,
      ),
      icon: Info,
    },
    {
      title: 'No. of Volunteers',
      value: printInteger(currentData.noOfMechanics),
      percentage: getPercentage(
        previousData.noOfMechanics,
        currentData.noOfMechanics,
      ),
      icon: Build,
    },
    {
      title: 'No. of Baptisms',
      value: printInteger(currentData.noOfBaptisms),
      percentage: getPercentage(
        previousData.noOfBaptisms,
        currentData.noOfBaptisms,
      ),
      icon: EmojiPeople,
    },
    {
      title: 'Church Service Attendance',
      value: printInteger(currentData.totalGarageAttendance),
      percentage: getPercentage(
        previousData.totalGarageAttendance,
        currentData.totalGarageAttendance,
      ),

      icon: People,
    },

    {
      title: 'Giving',
      value: printMoney(currentData.giving),
      percentage: getPercentage(previousData.giving, currentData.giving),
      icon: Money,
    },
  ];

  return (
    <Grid container spacing={2}>
      {data.map((it) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={it.title}>
          <Widget interval={interval} {...it} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardData;
