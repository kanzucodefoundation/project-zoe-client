





export default function AppointmentTemplate(model) {
  // const movieData = getMovieById(model.appointmentData.movieId) || {};
  return (
    <div className="">
      <div> </div>
      <div>
        Ticket Price: <strong>${ model.appointmentData.price }</strong>
      </div>
      <div>
        {Globalize.formatDate(model.appointmentData.startDate, { time: 'short' })}
        {' - '}
        {Globalize.formatDate(model.appointmentData.endDate, { time: 'short' }) }
      </div>
    </div>
  );
}
