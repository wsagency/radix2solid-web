import { createSignal } from "solid-js";
import { FileDrop } from "@wsagency/radix2solid-primitives";
import styles from "./styles.module.css";
export default function FileDropDemo() {
  const [accepted, setAccepted] = createSignal<readonly File[]>([]);
  const [proposal, setProposal] = createSignal<readonly File[] | null>(null);
  const [rejection, setRejection] = createSignal("");
  let dropIntent: DragEvent | null = null;
  const [disabled, setDisabled] = createSignal(false);
  const [submitted, setSubmitted] = createSignal<readonly File[]>([]);
  return <section class={styles.Demo} aria-label="FileDrop demonstration">
    <form class={styles.Form} aria-label="File upload metadata" onSubmit={event => {
      event.preventDefault();
      setSubmitted(new FormData(event.currentTarget as HTMLFormElement).getAll("attachments").filter((value): value is File => value instanceof File));
    }}>
      <FileDrop.Root class={styles.Drop} value={accepted()} onValueChange={files => {
        setRejection("");
        const fromDrop = dropIntent !== null;
        dropIntent = null;
        if (files.length === 0 || accepted().length === 0 || fromDrop) setAccepted(files);
        else setProposal(files);
      }} onDrop={event => {
        dropIntent = event;
        queueMicrotask(() => {
          if (dropIntent === event) dropIntent = null;
        });
      }} onReject={({ reason }) => setRejection(reason === "accept-mismatch" ? "Choose plain text files." : "Choose one or more files allowed by the current policy.")} name="attachments" accept=".txt,text/plain" multiple required disabled={disabled()}>
        <FileDrop.Input class={styles.Input} aria-label="Attachments" />
        <p>Drop plain text files here or browse.</p>
        <FileDrop.Trigger class={styles.Button} aria-label="Browse files">Browse files</FileDrop.Trigger>
        <ul class={styles.Files}>{accepted().map(file => <li>{file.name} — {file.size} bytes, {file.type || "unknown type"}</li>)}</ul>
      </FileDrop.Root>
      {rejection() && <p class={styles.Alert} role="alert">{rejection()}</p>}
      <div class={styles.Controls}>
        <button class={styles.Button} type="button" onClick={() => { if (proposal()) setAccepted(proposal()!); setProposal(null); }}>Adopt proposed files</button>
        <button class={styles.Button} type="button" onClick={() => setProposal(null)}>Refuse proposed files</button>
        <label><input type="checkbox" checked={disabled()} onChange={event => setDisabled(event.currentTarget.checked)} /> Disable file selection</label>
      </div>
      <button class={styles.Button} type="submit">Submit attachments</button>
    </form>
    <div class={styles.Status} aria-label="Accepted file names">{accepted().map(file => file.name).join(", ") || "No accepted files"}</div>
    <div class={styles.Status} aria-label="Proposed file names">{proposal()?.map(file => file.name).join(", ") || "No pending proposal"}</div>
    <div class={styles.Status} aria-label="Submitted file metadata">{submitted().length ? submitted().map(file => <div>{file.name} — {file.size} bytes, {file.type || "unknown type"}</div>) : "No submitted files"}</div>
  </section>;
}
