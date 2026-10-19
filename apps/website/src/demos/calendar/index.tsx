import { createSignal } from "solid-js";
import { Calendar } from "@wsagency/radix2solid-primitives";
import styles from "./styles.module.css";

export default function CalendarDemo() {
  const [value, setValue] = createSignal<Calendar.DateValue | null>(null);
  const [rtl, setRtl] = createSignal(false);
  const [weekStartsOn, setWeekStartsOn] = createSignal<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  return <section class={styles.Demo} aria-label="Calendar demonstration">
    <Calendar.Root class={styles.Calendar} aria-label="Choose a date" value={value()} onValueChange={setValue}
      today="2026-10-19" defaultViewMonth="2026-10" locale={rtl() ? "ar-EG" : "en-US"} weekStartsOn={weekStartsOn()} dir={rtl() ? "rtl" : "ltr"}>
      <Calendar.Header class={styles.Header}>
        <Calendar.PrevTrigger class={styles.Button} aria-label="Previous month">‹</Calendar.PrevTrigger>
        <Calendar.Heading class={styles.Heading} />
        <Calendar.NextTrigger class={styles.Button} aria-label="Next month">›</Calendar.NextTrigger>
      </Calendar.Header>
      <Calendar.Grid class={styles.Grid}>
        {state => <>
          <Calendar.Row class={styles.Row}>{state.weekdays.map(day => <Calendar.HeaderCell class={styles.Weekday} weekday={day.index}>{day.shortLabel}</Calendar.HeaderCell>)}</Calendar.Row>
          {state.weeks.map(week => <Calendar.Row class={styles.Row}>{week.map(item => item
            ? <Calendar.Cell class={styles.Cell} date={item.date}>
                <Calendar.Day class={styles.Day} date={item.date}>{item.date.slice(-2).replace(/^0/, "")}</Calendar.Day>
              </Calendar.Cell>
            : <span class={styles.Cell} role="gridcell" aria-disabled="true" />)}</Calendar.Row>)}
        </>}
      </Calendar.Grid>
    </Calendar.Root>
    <button class={styles.Button} type="button" onClick={() => { setRtl(value => !value); setWeekStartsOn(value => value === 0 ? 1 : 0); }}>Change locale, week start and direction</button>
    <div class={styles.Status} aria-label="Accepted date">{value() ?? "No date selected"}</div>
  </section>;
}
