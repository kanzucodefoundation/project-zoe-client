import React, {
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
} from "react"
import TUICalendar from "@toast-ui/react-calendar"
import { ISchedule, ICalendarInfo } from "tui-calendar"
import "tui-calendar/dist/tui-calendar.css"
import "tui-date-picker/dist/tui-date-picker.css"
import "tui-time-picker/dist/tui-time-picker.css"
import Layout from "../../../components/layout/Layout"
import { Box, Button, Grid, makeStyles } from "@material-ui/core"
import { localRoutes, remoteRoutes } from "../../../data/constants"
import { get, put, del, post } from "../../../utils/ajax"
import Toast from "../../../utils/Toast"
import { useDispatch, useSelector } from "react-redux"
import EditDialog from "../../../components/EditDialog"
import EventForm from "../../events/forms/EventForm"
import { eventsEdit, IEventState } from "../../../data/events/eventsReducer"
import { IEvent } from "../../events/types"
import AddIcon from "@material-ui/icons/Add"
import Calendar from "@toast-ui/react-calendar"
import { IState } from "../../../data/types"

const start = new Date()
const end = new Date(new Date().setMinutes(start.getMinutes() + 30))
const intl = new Intl.DateTimeFormat("en-US")

const CalendarEvents = () => {
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

	useEffect(() => {
		console.log(profile)
		get(remoteRoutes.events, (data) => {
			console.log("====mydata===", data)
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
	}, [dialog])

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
		// if(user){
		//     setDialog(true)
		// setIsNew(false)
		// for (let i = 0; i < events.length; i++) {
		// 	if (events[i].id === e.schedule.id) {
		// 		setSelectedEvent({ ...events[i] })
		// 	}
		// }
		// }
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

	return (
		<Layout>
			<Box p={2}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Button
							variant='outlined'
							color='primary'
							onClick={handleNew}
							startIcon={<AddIcon />}
							style={{ marginLeft: 8 }}
						>
							Create Event&nbsp;&nbsp;
						</Button>
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
								schedules={schedules}
								onBeforeCreateSchedule={onBeforeCreateSchedule}
								onBeforeDeleteSchedule={onBeforeDeleteSchedule}
								onBeforeUpdateSchedule={onBeforeUpdateSchedule}
							/>
						</div>
					</Grid>
				</Grid>
			</Box>
		</Layout>
	)
}

export default CalendarEvents
