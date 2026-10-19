import { createSignal } from "solid-js";
import { Calendar, DatePicker } from "@wsagency/radix2solid-primitives";
import "./styles.css";
function CalendarView() {
  return <DatePicker.Calendar class="grid grid-cols-7 gap-1">
    <Calendar.PrevTrigger class="rounded border p-2" aria-label="Previous month">‹</Calendar.PrevTrigger>
    <Calendar.Heading class="col-span-5 text-center font-semibold"/>
    <Calendar.NextTrigger class="rounded border p-2" aria-label="Next month">›</Calendar.NextTrigger>
    <Calendar.Grid class="col-span-7 grid gap-1">{state => <>
      <Calendar.Row class="grid grid-cols-7 text-center">{state.weekdays.map(day => <Calendar.HeaderCell class="font-semibold" weekday={day.index}>{day.shortLabel}</Calendar.HeaderCell>)}</Calendar.Row>
      {state.weeks.map(week => <Calendar.Row class="grid grid-cols-7 text-center">{week.map(item => item
        ? <Calendar.Cell date={item.date}><Calendar.Day class="min-h-8 w-full rounded border p-1 focus-visible:outline focus-visible:outline-2 data-[selected]:bg-violet-700 data-[selected]:text-white" date={item.date}>{item.date.slice(-2).replace(/^0/,"")}</Calendar.Day></Calendar.Cell>
        : <span class="p-0.5" role="gridcell" aria-disabled="true" />)}</Calendar.Row>)}
    </>}</Calendar.Grid>
  </DatePicker.Calendar>;
}
export default function DatePickerDemo(){const [value,setValue]=createSignal<Calendar.DateValue|null>(null);return <section class="grid max-w-lg gap-4 text-sm"><form class="grid gap-3" aria-label="Appointment booking"><DatePicker.Root name="appointment" required today="2026-10-19" value={value()} onValueChange={setValue} defaultViewMonth="2026-10"><DatePicker.Trigger class="rounded border px-3 py-2" aria-label="Choose appointment date"><DatePicker.Value placeholder="Choose a date"/></DatePicker.Trigger><DatePicker.Clear class="rounded border px-3 py-2" aria-label="Clear date">Clear</DatePicker.Clear><DatePicker.Portal><DatePicker.Content class="relative z-50 grid max-w-sm max-h-[min(var(--radix-popover-content-available-height,100dvh),calc(100dvh_-_1rem))] overflow-auto gap-3 rounded-xl border bg-white p-4 shadow-xl"><DatePicker.Title>Choose an appointment date</DatePicker.Title><DatePicker.Description>Choose one available day.</DatePicker.Description><CalendarView/></DatePicker.Content></DatePicker.Portal><DatePicker.FormControl aria-label="Appointment date"/></DatePicker.Root><button class="rounded border px-3 py-2" type="submit">Submit appointment</button></form><div aria-label="Accepted date">{value()??"No date selected"}</div></section>}
