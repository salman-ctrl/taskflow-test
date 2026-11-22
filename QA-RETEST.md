# TaskFlow accessibility fix retest

Date: 2026-11-22. Reviewer: Pixel. Scope: TaskFlow-test only.

Verdicts: **QA-01 ACCEPTED. QA-02 ACCEPTED.** No remaining defect found in this retest. Original severities were Medium and Low respectively. Acceptance is based on browser keyboard/focus behavior and live-region DOM mutations, not verified screen-reader speech.

## Commands and preview

- `npm test`: exit 0; Vitest 5.1.1; 3 files passed; 23/23 tests passed; duration 4.06s.
- `npm run build`: exit 0; TypeScript checks passed; Vite 8.3.8 transformed 25 modules; built in 91ms. CSS 10.59 kB (gzip 3.23 kB); JS 230.84 kB (gzip 72.53 kB).
- Production preview http://127.0.0.1:4173/ reachable. Reload confirmed the browser used the newly built `/assets/index-DEAUhIVE.js`, and the named Task updates region existed.

## QA-01: accepted

Independently seeded First/Middle/Last tasks, then used trusted browser Enter/Space/Tab actions and inspected document.activeElement after each action:

- Delete First -> Middle checkbox; Tab -> Edit Middle.
- Delete Middle -> Last checkbox; Tab -> Edit Last.
- Delete Last -> Middle checkbox; Tab -> Edit Middle.
- Sequentially delete Middle/Last/First -> next row / previous row / new-task input. Type into that input then Tab -> Add task.
- In Active, complete Last/First/Middle -> previous remaining row / remaining row / new-task input. Tab from a replacement checkbox -> that row's Edit button.
- In Completed, reactivate Last/First/Middle -> previous remaining row / remaining row / new-task input. Tab continues to that row's Edit button.
- Toggle complete and active in All -> focus remains on the same checkbox.
- Leave Last in edit mode, then delete Middle -> Last's edit input receives focus; Tab -> Save.
- Keep composer focus while invoking another row's delete or filtered toggle through a synthetic click -> composer retains focus. Synthetic activation is intentional here to exercise the unrelated-focus branch without a pointer click moving focus first.
- At 320x740, delete -> remaining checkbox, Tab -> Edit; last visible Active and Completed toggles -> new-task input. All focused replacement elements were present in the rendered layout; no horizontal overflow (clientWidth = scrollWidth = 305, with a 15px scrollbar).
- Edit save and Escape cancellation still restore the edit button after the animation frame. Reload retained the edited title and task state.

Code review: App checks whether the removed row contains activeElement before preparing focus. It chooses next/previous visible task, then applies focus in useLayoutEffect after the DOM update, falling back to the composer. Neighbor lookup uses data-task-id equality, not a CSS selector built from stored IDs. TaskItem exposes that ID, and TaskComposer accepts a ref. The scope and implementation fit the issue; no regression found.

## QA-02: accepted

Observed the named, persistent Task updates status region with MutationObserver. Used duplicate titles so the resulting text was exactly identical across repeated actions, not merely different task messages:

- Two identical adds: subsequent action mutations were empty string then `Added “Same”.`.
- Two identical saves: empty string then `Updated task to “Same”.` each time.
- Complete two Same tasks: empty string then `Completed “Same”.` each time.
- Reactivate two Same tasks: empty string then `Marked “Same” active.` each time.
- Delete two Same tasks: empty string then `Deleted “Same”.` each time.
- Every captured operation retained the same region element, aria-atomic=true, and a single message text node.
- Two synchronous rapid deletes with different titles produced the final `Deleted “Rapid last”.` message and zero remaining tasks.
- Fresh reload had an empty announcement region, with no prior pending message carried over.

Code review: useLiveAnnouncement clears existing text and cancels any pending timer, then publishes the message after 100ms; its unmount cleanup cancels pending work. Titles add useful action context. Rapid actions intentionally coalesce to the latest message. This resolves the original unchanged-string mutation defect.

## Updated regression coverage

Reviewed all 9 new accessibility cases in src/accessibility.test.tsx plus the existing journey/storage tests. New cases cover keyboard neighbor/previous/composer fallback, both filters, editing neighbor, unrelated composer focus, All checkbox retention, repeated identical adds/deletes, rapid-action coalescing and unmount cleanup. Independent browser checks above extend coverage to first/last deletions, reverse-end filter removal, repeated edits/completions/reactivations, and mobile behavior. All 23 tests passed.

## Limits and writes

No screen reader, Firefox/Safari, physical mobile device, formal WCAG audit or performance benchmark was run. Speech delivery and announcement timing across assistive technologies remain unverified. Full malformed-storage/security coverage was not manually repeated this turn; existing automated storage/journey tests passed and storage implementation was reviewed.

No implementation edits or dependency installations. Build regenerated dist; test/build tools may write project-local caches. This report was added. Browser fixture data was restored to the original empty version-1 task list; temporary MutationObserver globals were removed or discarded on navigation. No screenshots saved and no server process changed.
