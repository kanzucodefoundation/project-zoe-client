import React, {
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
} from "react"
import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";

import { signInToGoogle, initClient,getSignedInUserEmail , publishTheCalenderEvent } from "./GoogleCalSync"

import { Button, Grid } from "@material-ui/core"
import {  remoteRoutes } from "../../../data/constants"
import { get, del } from "../../../utils/ajax"
import Toast from "../../../utils/Toast"
import { useDispatch, useSelector } from "react-redux"
import EditDialog from "../../../components/EditDialog"
import EventForm from "../../events/forms/EventForm"
import { eventsEdit } from "../../../data/events/eventsReducer"
import { IEvent } from "../../events/types"
import AddIcon from "@material-ui/icons/Add"
import { IState } from "../../../data/types"
import TUICalendar from "@toast-ui/react-calendar"
import { ISchedule } from "tui-calendar"
import "tui-calendar/dist/tui-calendar.css"
import "tui-date-picker/dist/tui-date-picker.css"
import "tui-time-picker/dist/tui-time-picker.css"
import Layout from "../../../components/layout/Layout"
import DisableDayOff from "./DisableDayOff"


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const intl = new Intl.DateTimeFormat("en-US")


const MembersCalendar = () => {
    const [event, setEvent] = useState<any>([]);
    const cal = useRef(null) // this will store the `Calendar` instance.
	const [updateCount, forceUpdate] = useReducer((c) => c + 1, 0)
	const [currentRange, setCurrentRange] = useState("")
	const [dialog, setDialog] = useState(false)
	const [value, setValue] = useState<any[]>([])
	const [schedules, setSchedules] = useState<any[]>([])
	const dispatch = useDispatch()
	const [selectedEvent, setSelectedEvent] = useState<Partial<IEvent>>({})
	const [events, setEvents] = useState<IEvent[]>([])
	const [isNew, setIsNew] = useState<boolean>(true)
	const profile = useSelector((state: IState) => state.core.user)
  const [day, setDay] = useState<any>();

	useEffect(() => {
		console.log(profile)
		get(remoteRoutes.events, (data) => {
			setEvents(data)
			let myEvents: ISchedule[] = []

			for (let i = 0; i < data.length; i++) {
				const calEvent = {
					category: "time",
					isVisible: true,
					id: data[i].id,
					title: data[i].name,
					body: data[i].summary,
					group: data[i].group.name,
					location: data[i].venue.name,
					start: data[i].startDate,
					end: data[i].endDate,
				}
				myEvents.push(calEvent)
			}
			setSchedules(myEvents)
		})

    get(remoteRoutes.dayOff, (data) => {
      setEvent(data);
      console.log(data, "hello");
      let myDayOff: any[] = [];
      for (let i = 0; i < data.length; i++) {
        const disableDay = {
          category: "time",
          isVisible: true,
          id: data[i].id,
          body: data[i].reason,
          start: data[i].startDate,
          end: data[i].endDate,
        };
        myDayOff.push(disableDay);
      }
      console.log(myDayOff, "hey!")
      setDay(myDayOff);
    });

	}, [dialog, profile])

	const onBeforeCreateSchedule = useCallback(
		(scheduleData) => {
			setValue(scheduleData)

			setDialog(true)
		},
		[dialog]
	)

	const onBeforeDeleteSchedule = useCallback((res) => {
		const { id, calendarId, title } = res.schedule

		cal.current.calendarInst.deleteSchedule(id, calendarId)
		del(`${remoteRoutes.events}/${id}`, (response) => {
			Toast.success(`${title} has been deleted successfully`)
		})
	}, [])

  const onBeforeUpdateSchedule = (e: any) => {
    setDialog(true)
setIsNew(false)
for (let i = 0; i < events.length; i++) {
  if (events[i].id === e.schedule.id) {
    setSelectedEvent({ ...events[i] })
  }

}
}

	function handleNew() {
		setDialog(true)
	}

	function handleClose() {
		setDialog(false)
	}

	function handleEdited(dt: any) {
		setDialog(false)
		dispatch(eventsEdit(dt))
	}
	function handleCreated() {
		setDialog(false)
	}

	function onClickTodayBtn() {
		cal.current.calendarInst.today()
		cal.current.calendarInst.changeView("day", true)
		forceUpdate()
	}

	const moveToPrev = () => {
		cal.current.calendarInst.prev()
		forceUpdate()
	}
	const moveToNext = () => {
		cal.current.calendarInst.next()
		forceUpdate()
	}
	useEffect(() => {
		if (cal) {
			const rangeStart = cal.current.calendarInst.getDateRangeStart().getTime()
			const rangeEnd = cal.current.calendarInst.getDateRangeEnd().getTime()

			setCurrentRange(`${intl.format(rangeStart)} ~ ${intl.format(rangeEnd)}`)
		}
	}, [updateCount, cal])

  
  useEffect(() => {
        get (`${remoteRoutes.events}`,
        (data) => { let events: ISchedule[] = [];
          console.log(events);
          for (let i = 0; i < data.length; i++) {
            const mce = {
              //calendarId: data[i].id,
              category: "time",
              isVisible: true,
              id: data[i].id,
              title: data[i].name,
              body: data[i].summary,
              location: data[i].venue.name,
              start:data[i].startDate,
              end:data[i].endDate,
            };
  
            events.push(mce);
          }
          setEvent(events);
          },)
},
[]);


useEffect(()=>{
  initClient((success: any)=>{
      if (success){
          getGoogleAuthorizedEmail();
          } 
  });
},[]);

const getGoogleAuthorizedEmail =async ()=>{
  let email = await getSignedInUserEmail();
  if (email){
      
  }
};
const getAuthToGoogle =async ()=>{
  let successfull =await signInToGoogle();
  if (successfull){
      getGoogleAuthorizedEmail();
  }
};

/*const _signOutFromGoogle = () => {
  let status = signOutFromGoogle();
  if (status){
      setSignedIn(false);
      //setgoogleAuthedEmail(null);
  }
};*/

const handleClick = (calEvent: any | "") => { 
  getAuthToGoogle()
  .then(() => {
    var googleCalEvent = {}; 
    if (calEvent !== "" ) {
          googleCalEvent = {
            'summary': calEvent.title,
            'location': calEvent.location,
            'description': calEvent.body,
            'start':{dateTime:calEvent.start},
            'end': {dateTime:calEvent.end}
      }; 
      publishTheCalenderEvent(googleCalEvent);
      console.log(googleCalEvent);
  }
})
}
  
    return (
      <Layout>
        <h1>Worship Harvest Calendar</h1>
        <Grid item xs={12}> 
        <Grid item xs={6} md={6}>
        <Button
        variant='outlined'
        color='primary'
        onClick={handleNew}
        startIcon={<AddIcon />}
        style={{ marginLeft: 8 }}
      >
        Create Event&nbsp;&nbsp;
      </Button>
     </Grid>
     <Grid item xs={6} md={6}>
        <Button
          onClick={()=>handleClick(event? event[5]:"")}
        >
          Add to Google Calendar
     </Button>
     </Grid>
        </Grid>
         <Grid item xs={12}>        
						<EditDialog
							open={dialog}
							onClose={handleClose}
							title={isNew ? "Add Event" : "Edit Event"}
						>
							<EventForm
								data={selectedEvent}
								cal={cal}
								scheduleData={value}
								//e={eventdialog}
								isNew={isNew}
								onUpdated={handleEdited}
								onCancel={handleClose}
								onCreated={handleCreated}
							/>
						</EditDialog>
            {/* 
                  <EditDialog
              title="Event day off."
              open={showDialog}
              onClose={closeCreateDialog}
            >
              <DisableDayOff
                data={{}}
                isNew={true}
                onCreated={closeCreateDialog}
                onCancel={handleClose}
                e={value}
              />
            </EditDialog>
            */}
					</Grid>

          <Grid item xs={12}>
          <div>
            <div className='button'>
              <span>Current range: {currentRange}</span>&nbsp;
              <Button
                variant='outlined'
                size='small'
                color='primary'
                onClick={onClickTodayBtn}
              >
                Today
              </Button>
              <Button
                variant='outlined'
                size='small'
                color='primary'
                onClick={moveToPrev}
              >
                {"<"}Prev Month
              </Button>
              <Button
                variant='outlined'
                size='small'
                color='primary'
                onClick={moveToNext}
              >
                Next Month{">"}
              </Button>
            </div>

            <TUICalendar
              ref={cal}
              height='1000px'
              view='month'
              useCreationPopup={false}
              useDetailPopup={true}
              //schedules={schedules}
              schedules={day}
              onBeforeCreateSchedule={onBeforeCreateSchedule}
              onBeforeDeleteSchedule={onBeforeDeleteSchedule}
              onBeforeUpdateSchedule={onBeforeUpdateSchedule}
            />
          </div>
        </Grid>
        </Layout>
    );
}
  
export default MembersCalendar; 