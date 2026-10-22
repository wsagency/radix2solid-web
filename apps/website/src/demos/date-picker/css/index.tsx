import { createSignal } from "solid-js";
import { Calendar, DatePicker } from "@wsagency/radix2solid-primitives";
import "./styles.css";
function CalendarView() {
  return <DatePicker.Calendar class="date-calendar">
    <Calendar.PrevTrigger class="date-button" aria-label="Previous month">‹</Calendar.PrevTrigger>
    <Calendar.Heading class="date-heading"/>
    <Calendar.NextTrigger class="date-button" aria-label="Next month">›</Calendar.NextTrigger>
    <Calendar.Grid class="date-grid">{state => <>
      <Calendar.Row class="date-row">{state.weekdays.map(day => <Calendar.HeaderCell class="date-weekday" weekday={day.index}>{day.shortLabel}</Calendar.HeaderCell>)}</Calendar.Row>
      {state.weeks.map(week => <Calendar.Row class="date-row">{week.map(item => item
        ? <Calendar.Cell class="date-cell" date={item.date}><Calendar.Day class="date-day" date={item.date}>{item.date.slice(-2).replace(/^0/, "")}</Calendar.Day></Calendar.Cell>
        : <span class="date-cell" role="gridcell" aria-disabled="true" />)}</Calendar.Row>)}
    </>}</Calendar.Grid>
  </DatePicker.Calendar>;
}
export default function DatePickerDemo(){const [value,setValue]=createSignal<Calendar.DateValue|null>(null);return <section class="date-demo"><form class="date-form" aria-label="Appointment booking"><DatePicker.Root name="appointment" required today="2026-10-19" value={value()} onValueChange={setValue} defaultViewMonth="2026-10"><DatePicker.Trigger class="date-trigger" aria-label="Choose appointment date"><DatePicker.Value placeholder="Choose a date"/></DatePicker.Trigger><DatePicker.Clear class="date-button" aria-label="Clear date">Clear</DatePicker.Clear><DatePicker.Portal><DatePicker.Content class="date-content"><DatePicker.Title>Choose an appointment date</DatePicker.Title><DatePicker.Description>Choose one available day.</DatePicker.Description><CalendarView/></DatePicker.Content></DatePicker.Portal><DatePicker.FormControl aria-label="Appointment date"/></DatePicker.Root><button class="date-button" type="submit">Submit appointment</button></form><div aria-label="Accepted date">{value()??"No date selected"}</div></section>}
