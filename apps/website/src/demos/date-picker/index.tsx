import { createSignal } from "solid-js";
import { Calendar, DatePicker } from "@wsagency/radix2solid-primitives";
import styles from "./styles.module.css";
function CalendarView() {
  return <DatePicker.Calendar class={styles.Calendar}>
    <Calendar.PrevTrigger class={styles.Button} aria-label="Previous month">‹</Calendar.PrevTrigger>
    <Calendar.Heading class={styles.Heading}/>
    <Calendar.NextTrigger class={styles.Button} aria-label="Next month">›</Calendar.NextTrigger>
    <Calendar.Grid class={styles.Grid}>{state => <>
      <Calendar.Row class={styles.Row}>{state.weekdays.map(day => <Calendar.HeaderCell class={styles.Weekday} weekday={day.index}>{day.shortLabel}</Calendar.HeaderCell>)}</Calendar.Row>
      {state.weeks.map(week => <Calendar.Row class={styles.Row}>{week.map(item => item
        ? <Calendar.Cell class={styles.Cell} date={item.date}>
            <Calendar.Day class={styles.Day} date={item.date}>{item.date.slice(-2).replace(/^0/, "")}</Calendar.Day>
          </Calendar.Cell>
        : <span class={styles.Cell} role="gridcell" aria-disabled="true" />)}</Calendar.Row>)}
    </>}</Calendar.Grid>
  </DatePicker.Calendar>;
}
export default function DatePickerDemo() {
  const [accepted, setAccepted] = createSignal<Calendar.DateValue | null>(null);
  const [requested, setRequested] = createSignal<Calendar.DateValue | null>(null);
  const refusalValue: Calendar.DateValue = "2026-10-18";
  return <section class={styles.Demo} aria-label="DatePicker demonstration">
    <form class={styles.Form} aria-label="Appointment booking">
      <DatePicker.Root class={styles.Root} name="appointment" required today="2026-10-19" value={accepted()} onValueChange={setAccepted} defaultViewMonth="2026-10" locale="en-US">
        <DatePicker.Trigger class={styles.Trigger} aria-label="Choose appointment date"><DatePicker.Value placeholder="Choose a date"/></DatePicker.Trigger>
        <DatePicker.Clear class={styles.Button} aria-label="Clear date">Clear</DatePicker.Clear>
        <DatePicker.Portal><DatePicker.Content class={styles.Content}><DatePicker.Title class={styles.Title}>Choose an appointment date</DatePicker.Title><DatePicker.Description>Choose one available day.</DatePicker.Description><CalendarView/></DatePicker.Content></DatePicker.Portal>
        <DatePicker.FormControl aria-label="Appointment date" />
      </DatePicker.Root>
      <button class={styles.Button} type="submit">Submit appointment</button>
    </form>
    <div class={styles.Status} aria-label="Accepted date">{accepted() ?? "No date selected"}</div>
    <div class={styles.Refusal}><DatePicker.Root class={styles.Root} value={refusalValue} onValueChange={value => setRequested(value)} today="2026-10-19" defaultViewMonth="2026-10">
      <DatePicker.Trigger class={styles.Trigger} aria-label="Choose a date"><DatePicker.Value/></DatePicker.Trigger>
      <DatePicker.Portal><DatePicker.Content class={styles.Content}><DatePicker.Title>Choose a date</DatePicker.Title><CalendarView/></DatePicker.Content></DatePicker.Portal>
    </DatePicker.Root><span>Requested: <span aria-label="Value requests">{requested() ?? "none"}</span></span><span aria-label="Accepted date">{refusalValue}</span></div>
  </section>;
}
