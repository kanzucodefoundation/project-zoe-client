import { Grid } from '@material-ui/core';
import { Build, ChildFriendly, EmojiPeople, Grain, Info, LocalFlorist, Money, People, Restore } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { eventsCategories } from '../../data/constants';
import { printInteger, printMoney } from '../../utils/numberHelpers';
import { IEvent } from '../events/types';
import UsersByDevice from './UsersByDevice';
import Widget from './Widget';

interface IProps {
  currWeekEvents: IEvent[];
  prevWeekEvents: IEvent[];
}

const DashboardData = ({ currWeekEvents,  prevWeekEvents }: IProps) => {

  const [giving, setGiving] = useState<number>(0)
  const [prevGiving, setPrevGiving] = useState<number>(0)
  const [att, setAtt] = useState<number>(0)
  const [prevAtt, setPrevAtt] = useState<number>(0)
  const [mcAtt, setMcAtt] = useState<number>(0)
  const [prevMcAtt, setPrevMcAtt] = useState<number>(0)
  const [salvation, setSalvation] = useState<number>(0)
  const [prevSalvation, setPrevSalvation] = useState<number>(0)
  const [mechanics, setMechanics] = useState<number>(0)
  const [prevMechanics, setPrevMechanics] = useState<number>(0)
  const [baptism, setBaptism] = useState<number>(0)
  const [prevBaptism, setPrevBaptism] = useState<number>(0)
  const [recom, setRecom] = useState<number>(0)
  const [prevRecom, setPrevRecom] = useState<number>(0)
  const [babies, setBabies] = useState<number>(20)
  const [prevBabies, setPrevBabies] = useState<number>(10)
  const [weddings, setWeddings] = useState<number>(0)
  const [prevWeddings, setPrevWeddings] = useState<number>(0)

  useEffect(() => {
    currWeekEvents.map(it => (getValues(it, true)))
    prevWeekEvents.map(it => (getValues(it, false)))
  }, [currWeekEvents.length])

  const getValues = (data: any, isCurrWeek: boolean) => {

    if (data.category.name === eventsCategories.garage) {
      
      const attValue = data.attendance.length
      isCurrWeek ? setAtt(att + attValue) : setPrevAtt(prevAtt + attValue)
      if (data.metaData) {
        const givingValue = data.metaData.totalGiving
        const mechValue = data.metaData.noOfMechanics
        isCurrWeek ? setGiving(giving + givingValue) : setPrevGiving(prevGiving + givingValue)
        isCurrWeek ? setMechanics(mechanics + mechValue) : setPrevMechanics(prevMechanics + mechValue)
      }
    }

    if (data.category.name === eventsCategories.mc) {
      const value = data.attendance.length
      isCurrWeek ? setMcAtt(mcAtt + value) : setPrevMcAtt(prevMcAtt + value)
    }

    if (data.category.name === eventsCategories.evangelism) {
      if (data.metaData) {
        const value = data.metaData.noOfSalvations
        const recomValue = data.metaData.noOfRecommitments
        isCurrWeek ? setSalvation(salvation + value) : setPrevSalvation(prevSalvation + value)
        isCurrWeek ? setRecom(recom + recomValue) : setPrevRecom(setPrevRecom + recomValue)
      }
    }

    if (data.category.name === eventsCategories.baptism) {
      if(data.metaData) {
        const value = data.metaData.noOfBaptisms
        isCurrWeek ? setBaptism(baptism + value) : setPrevBaptism(prevBaptism + value)
      }
    }

    if (data.category.name === eventsCategories.wedding) {
      isCurrWeek ? setWeddings(weddings + 1) : setPrevWeddings(prevWeddings + 1)
    }
  }

  const getPercentage = (prev: number, current: number) => {
    if (prev > 0) {
      return (((current - prev) / prev) * 100)
    }
    return 0
  }

  const data = [
    {
      title: "Giving",
      value: printMoney(giving),
      percentage: getPercentage(prevGiving, giving),
      icon: Money
    },
    {
      title: "Attendance",
      value: printInteger(att),
      percentage: getPercentage(prevAtt, att),
      icon: People
    },
    {
      title: "MC Attendance",
      value: mcAtt,
      percentage: getPercentage(prevMcAtt, mcAtt),
      icon: Grain
    },
    {
      title: "Salvation",
      value: salvation,
      percentage: getPercentage(prevSalvation, salvation),
      icon: Info
    },
    {
      title: "No. of Mechanics",
      value: mechanics,
      percentage: getPercentage(prevMechanics, mechanics),
      icon: Build
    },
    {
      title: "No. of Baptisms",
      value: baptism,
      percentage: getPercentage(prevBaptism, baptism),
      icon: EmojiPeople
    },
    {
      title: "No. of Recommitments",
      value: recom,
      percentage: getPercentage(prevRecom, recom),
      icon: Restore
    },
    {
      title: "No. of Babies Born",
      value: babies,
      percentage: getPercentage(prevBabies, babies),
      icon: ChildFriendly
    },
    {
      title: "No. of Weddings",
      value: weddings,
      percentage: getPercentage(prevWeddings, weddings),
      icon: LocalFlorist
    }
  ];

  return (
    <Grid container spacing={2}>
      {data.map(it => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={it.title}>
          <Widget {...it} />
        </Grid>
      ))}
      <Grid item xs={12} md={6}>
        <UsersByDevice />
      </Grid>
    </Grid>
  )
}

export default DashboardData

