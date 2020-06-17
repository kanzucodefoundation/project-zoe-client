import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import { reqDate, reqObject, reqString } from "../../data/validations";
// import {ministryCategories} from "../../data/comboCategories";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XDateInput from "../../components/inputs/XTimeInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import { toOptions } from "../../components/inputs/inputHelpers";

import { remoteRoutes } from "../../data/constants";
import { useDispatch } from 'react-redux';
import { servicesConstants } from "../../data/teamlead/reducer";
import { post, put } from "../../utils/ajax";
import Toast from "../../utils/Toast";
import { XRemoteSelect } from "../../components/inputs/XRemoteSelect";
import { Box, TextField } from "@material-ui/core";
import { ICreateDayDto, ISaveToATT, ISaveToUTT } from "./types";
import { isoDateString } from "../../utils/dateHelpers";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Header from "./Header";
import { owners } from '../../data/teamlead/tasks';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import { enumToArray } from "../../utils/stringHelpers";

import { ministryCategories } from "../../data/comboCategories";
import Autocomplete from '@material-ui/lab/Autocomplete';

interface IProps {
    data: any | null
    done?: () => any

}

const schema = yup.object().shape(
    {
        taskId: reqObject,
        startDate: reqDate,
        endDate: reqDate,
        taskInfo: reqString,
        userId: reqObject,


    }
)

const initialValues = {

    taskId: '',
    startDate: '',
    endDate: '',
    taskInfo: '',
    userId: null,

}

const RightPadded = ({ children, ...props }: any) => <Grid item xs={6}>
    <Box pr={1} {...props}>
        {children}
    </Box>
</Grid>

const LeftPadded = ({ children, ...props }: any) => <Grid item xs={6}>
    <Box pl={1} {...props}>
        {children}
    </Box>
</Grid>


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
            maxWidth: 300,
        },
        root: {
            flexGrow: 1,
        },
        filterPaper: {
            borderRadius: 0,
            padding: theme.spacing(2)
        },
        fab: {
            position: 'absolute',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    }),
);

const AssignTask = ({ done }: IProps) => {
    const dispatch = useDispatch();
    const classes = useStyles();

    function appointmentTasks(values: any, actions: any, id: any) {
        const toSaveAppointmentTaskTable: ISaveToATT = {
            appointmentId: id,
            taskId: values.taskId.value,
        }

        post(remoteRoutes.appointmentTask, toSaveAppointmentTaskTable,
            (data) => {

                userTask(values, actions, data.id)
            },
            undefined,
            () => {
                actions.setSubmitting(false);

            }
        )
    }

    function userTask(values: any, actions: any, id: any) {
        const toSaveUserTaskTable: ISaveToUTT = {
            appointmentTaskId: id,
            userId: values.userId.value,
        }

        post(remoteRoutes.userTask, toSaveUserTaskTable,
            (data) => {
                Toast.info('Operation successful')
                actions.resetForm()
                dispatch({
                    type: servicesConstants.servicesAddDay,
                    payload: { ...data },
                })
                if (done)
                    done()
            },
            undefined,
            () => {
                actions.setSubmitting(false);

            }
        )

    }

    function handleSubmit(values: any, actions: FormikHelpers<any>) {

        const toSave: ICreateDayDto = {
            startDate: values.startDate,
            endDate: values.endDate,
            taskInfo: values.taskInfo,

        }
        post(remoteRoutes.appointments, toSave,
            (data) => {
                console.log(data, data.id)
                appointmentTasks(values, actions, data.id);
            },
            undefined,
            () => {
                actions.setSubmitting(false);

            }

        )






    }





    // enum TeamPrivacy {
    //     Sweeping = "sweeping",
    //     Mopping = "mopping",
    //     Coaching = "coaching",
    //     Arranging = "Arranging church",

    // }

    const [persons, setPersons] = useState<any>({id: 0, contactId: 0, listOfPersons: []});
    useEffect(() => {
        const fetchPersons = async () => {
            const result = await fetch(remoteRoutes.contactsPerson).then(
                response => response.json()
            )
            setPersons({
                ...persons,
                listOfPersons: result
            });
        }
        fetchPersons();
    }, []);

    const handleChange = (value: any) => {
        const fetchEmail = async () => {
            const fetchedEmail = await fetch(remoteRoutes.contactsEmail + "/" + value.id).then(
                response => response.json()
            )

            setPersons({
                ...persons,
                id: value.id,
                email: fetchedEmail.value,
                contactId: fetchedEmail.contactId,
            });
        }
        fetchEmail();
    }

    return (

        <Box p={1} className={classes.root}>
            <Header title="Assign Volunteers Task" />

            <Grid item xs={6}>
                <XForm
                    onSubmit={handleSubmit}
                    schema={schema}
                    initialValues={initialValues}
                >
                    <Grid spacing={0} container>
                        <Grid item xs={12}>
                            {/* <XSelectInput
                                name="taskId"
                                label="Task Name"
                                // options={toOptions(enumToArray(TeamPrivacy))}
                                options={toOptions(ministryCategories)}
                                variant='outlined'
                            /> */}
                            <XRemoteSelect
                                remote={remoteRoutes.tasks}
                                filter={{ 'taskName[]': '' }}
                                parser={({ taskName, id }: any) => ({ label: taskName, value: id })}
                                name="taskId"
                                label="Task Name"
                                variant='outlined'
                            />
                        </Grid>
                        <RightPadded>
                            <XDateInput
                                name="startDate"
                                label="Start Date"

                            />
                        </RightPadded>
                        <LeftPadded>
                            <XDateInput
                                name="endDate"
                                label="End Date"

                            />
                        </LeftPadded>
                        <Grid item xs={12}>
                            <XTextInput
                                name="taskInfo"
                                label="Task Details"
                                type="text"
                                variant='outlined'
                            />
                        </Grid>

                        <Grid item xs={12}>
                            {/* <XRemoteSelect
                            remote={remoteRoutes.contactsPerson}
                            filter={{'firstName[]': 'Volunteer'}}
                            parser={({firstName, id}: any) => ({label: firstName, value: id})}
                            name="userId"
                            label="Volunteers"
                            variant='outlined'
                            /> */}

                            <Autocomplete
                                multiple
                                id="free-solo-demo"
                                freeSolo
                                options={persons.listOfPersons}
                                getOptionLabel={(option) => option.firstName + " " + option.lastName}
                                onChange={(event: any, value: any) => handleChange(value)} // prints the selected value
                                renderInput={(params) => (
                                <TextField {...params} label="Search for person to add as Volunteer" margin="normal" variant="outlined" />
                                )}
                            />

                            {/*<Autocomplete

                                multiple
                                // limitTags={2}
                                id="multiple-limit-tags"
                                options={top100Films}
                                getOptionLabel={(option) => option.title}
                                defaultValue={[top100Films[13], top100Films[12], top100Films[11]]}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="limitTags" placeholder="Favorites" />
                                )}
                            /> */}
                        </Grid>
                    </Grid>

                </XForm>
            </Grid>
        </Box>




    );
}


const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Pulp Fiction', year: 1994 },
    { title: 'The Lord of the Rings: The Return of the King', year: 2003 },
    { title: 'The Good, the Bad and the Ugly', year: 1966 },
    { title: 'Fight Club', year: 1999 },
    { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
    { title: 'Star Wars: Episode V - The Empire Strikes Back', year: 1980 },
    { title: 'Forrest Gump', year: 1994 },
    { title: 'Inception', year: 2010 },
    { title: 'The Lord of the Rings: The Two Towers', year: 2002 },
    { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
    { title: 'Goodfellas', year: 1990 },
    { title: 'The Matrix', year: 1999 },
    { title: 'Seven Samurai', year: 1954 },
    { title: 'Star Wars: Episode IV - A New Hope', year: 1977 },
    { title: 'City of God', year: 2002 },
    { title: 'Se7en', year: 1995 },
    { title: 'The Silence of the Lambs', year: 1991 },
    { title: "It's a Wonderful Life", year: 1946 },
    { title: 'Life Is Beautiful', year: 1997 },
    { title: 'The Usual Suspects', year: 1995 },
    { title: 'Léon: The Professional', year: 1994 },
    { title: 'Spirited Away', year: 2001 },
    { title: 'Saving Private Ryan', year: 1998 },
    { title: 'Once Upon a Time in the West', year: 1968 },
    { title: 'American History X', year: 1998 },
    { title: 'Interstellar', year: 2014 },
    { title: 'Casablanca', year: 1942 },
    { title: 'City Lights', year: 1931 },
    { title: 'Psycho', year: 1960 },
    { title: 'The Green Mile', year: 1999 },
    { title: 'The Intouchables', year: 2011 },
    { title: 'Modern Times', year: 1936 },
    { title: 'Raiders of the Lost Ark', year: 1981 },
    { title: 'Rear Window', year: 1954 },
    { title: 'The Pianist', year: 2002 },
    { title: 'The Departed', year: 2006 },
    { title: 'Terminator 2: Judgment Day', year: 1991 },
    { title: 'Back to the Future', year: 1985 },
    { title: 'Whiplash', year: 2014 },
    { title: 'Gladiator', year: 2000 },
    { title: 'Memento', year: 2000 },
    { title: 'The Prestige', year: 2006 },
    { title: 'The Lion King', year: 1994 },
    { title: 'Apocalypse Now', year: 1979 },
    { title: 'Alien', year: 1979 },
    { title: 'Sunset Boulevard', year: 1950 },
    { title: 'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb', year: 1964 },
    { title: 'The Great Dictator', year: 1940 },
    { title: 'Cinema Paradiso', year: 1988 },
    { title: 'The Lives of Others', year: 2006 },
    { title: 'Grave of the Fireflies', year: 1988 },
    { title: 'Paths of Glory', year: 1957 },
    { title: 'Django Unchained', year: 2012 },
    { title: 'The Shining', year: 1980 },
    { title: 'WALL·E', year: 2008 },
    { title: 'American Beauty', year: 1999 },
    { title: 'The Dark Knight Rises', year: 2012 },
    { title: 'Princess Mononoke', year: 1997 },
    { title: 'Aliens', year: 1986 },
    { title: 'Oldboy', year: 2003 },
    { title: 'Once Upon a Time in America', year: 1984 },
    { title: 'Witness for the Prosecution', year: 1957 },
    { title: 'Das Boot', year: 1981 },
    { title: 'Citizen Kane', year: 1941 },
    { title: 'North by Northwest', year: 1959 },
    { title: 'Vertigo', year: 1958 },
    { title: 'Star Wars: Episode VI - Return of the Jedi', year: 1983 },
    { title: 'Reservoir Dogs', year: 1992 },
    { title: 'Braveheart', year: 1995 },
    { title: 'M', year: 1931 },
    { title: 'Requiem for a Dream', year: 2000 },
    { title: 'Amélie', year: 2001 },
    { title: 'A Clockwork Orange', year: 1971 },
    { title: 'Like Stars on Earth', year: 2007 },
    { title: 'Taxi Driver', year: 1976 },
    { title: 'Lawrence of Arabia', year: 1962 },
    { title: 'Double Indemnity', year: 1944 },
    { title: 'Eternal Sunshine of the Spotless Mind', year: 2004 },
    { title: 'Amadeus', year: 1984 },
    { title: 'To Kill a Mockingbird', year: 1962 },
    { title: 'Toy Story 3', year: 2010 },
    { title: 'Logan', year: 2017 },
    { title: 'Full Metal Jacket', year: 1987 },
    { title: 'Dangal', year: 2016 },
    { title: 'The Sting', year: 1973 },
    { title: '2001: A Space Odyssey', year: 1968 },
    { title: "Singin' in the Rain", year: 1952 },
    { title: 'Toy Story', year: 1995 },
    { title: 'Bicycle Thieves', year: 1948 },
    { title: 'The Kid', year: 1921 },
    { title: 'Inglourious Basterds', year: 2009 },
    { title: 'Snatch', year: 2000 },
    { title: '3 Idiots', year: 2009 },
    { title: 'Monty Python and the Holy Grail', year: 1975 },
  ];
  

export default AssignTask;