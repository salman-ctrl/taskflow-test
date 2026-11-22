# TaskFlow independent QA

Date: 2026-11-22. Reviewer: Pixel. Scope: this project only.

Verdict: core functionality passes; request changes for keyboard focus handling before full accessibility acceptance. One medium defect and one low accessibility issue. No implementation files changed.

## Commands

- `npm test`: exit 0. Vitest 5.1.1; 2 test files passed, 14 tests passed; duration 4.21s.
- `npm run build`: exit 0. `tsc --noEmit && vite build`; Vite 8.3.8, 24 modules transformed, built in 86ms. Assets: CSS 10.59 kB / gzip 3.23 kB; JS 229.84 kB / gzip 72.19 kB.
- Read source, tests, configuration and README directly. Preview at http://127.0.0.1:4173/ was reachable; no server startup required.

## Independently exercised in the production preview

- Add by button and Enter; surrounding whitespace trimmed; whitespace-only submit leaves no task; input clears after successful add.
- Inline edit by Enter and Save; Escape and Cancel discard drafts; blank edit stays open with Save disabled; edit save/cancel restore focus after the animation frame.
- Complete and reactivate using Space and checkbox interaction; delete using button and keyboard Enter.
- Mixed lists: All/Active/Completed contents, selected filter state, live counts and progress agree. Adding from Completed returns to All.
- Full page reload retains titles, edited values, completion state and deletion.
- Malformed JSON loads safely with a warning and a usable empty list. Mixed valid/duplicate/null/blank entries retain only the valid task and persist the cleaned payload.
- Simulated Storage.setItem QuotaExceededError keeps tasks usable in memory and shows Changes are not saved plus a warning. Restoring storage and changing a task saves the in-memory tasks successfully.
- 241-character input is capped at 240. A 240-character unbroken title wraps on mobile. HTML-like task text renders as text with no injected image element.
- Desktop 1440x900: document clientWidth and scrollWidth both 1425 (15px vertical scrollbar). At 320x740: both 305; no horizontal overflow, including a long title and inline editor. Dark UI inspected visually at both sizes and at the initial 1905x947 viewport.
- Native labels, named icon controls, pressed filter state, visible 3px keyboard focus outline, Enter/Space/Tab/Shift+Tab/Escape, and skip link verified. Skip link moves focus to main-content. Reduced-motion emulation produces 0s button transitions.
- Browser diagnostics reported no errors during these flows.

## Defects

### QA-01: focus is lost when a focused task control is removed — Medium

Reproduction:

1. Add two tasks.
2. Focus a task's Delete button and press Enter.
3. Inspect focus, then press Tab.

Actual: document.activeElement becomes BODY; the next Tab focuses Skip to tasks, restarting navigation at the top. Also observed BODY focus after completing a task while Active is selected and reactivating one while Completed is selected, because the focused checkbox's row disappears. The subsequent Tab after a filtered toggle can land on another remaining input rather than the skip link; its destination depends on the DOM position.

Expected: move focus to a predictable nearby remaining task control, or the selected filter/composer when no tasks remain, after the focused row disappears.

Evidence: browser keyboard interaction and document.activeElement readback. Relevant source: src/components/TaskItem.tsx:105, src/App.tsx:143 and :151. Existing edit save/cancel already implements focus restoration at src/components/TaskItem.tsx:25-27; delete and filtered toggle have no equivalent. Add regression coverage for deleting the first/middle/last row and toggling the final visible row.

### QA-02: repeated identical actions do not update the live announcement — Low

Reproduction:

1. Add a task.
2. Observe main's aria-live status region with a MutationObserver.
3. Add another task.

Actual: status text remains Task added.; observer reports zero mutations for the second add. Code sets the same constant string for successive adds/updates/deletes/completions, so repeated actions do not create a new announcement update.

Expected: make each action produce a meaningful live-region update, for example including its task title or updated count. Actual spoken output requires assistive-technology verification; no screen reader was run.

Evidence: production browser MutationObserver result `{ mutations: 0, text: "Task added." }`; src/App.tsx:121, :141, :145, :153, :176.

## Code review

The architecture is clear and proportionate: typed Task model, focused presentational components, one task/persistence hook, and an isolated storage validation module. Strict TypeScript checks pass. Functional state updates avoid stale task arrays; stored fields are validated, deduplicated and reconstructed; rendered titles use React text escaping. No important additional functional/security defect found in the reviewed scope.

Existing automated tests cover core CRUD/filter/persistence journeys and storage failure/validation. They do not assert focus after deleting/filtering rows or repeated live-region updates, explaining why the reported accessibility issues pass the suite. Cross-tab synchronization is explicitly out of scope in README.

## Limits and writes

- Tested one embedded Chromium browser, not Firefox/Safari, a physical mobile device, a screen reader, or a formal WCAG audit. No large-list performance benchmark or dependency vulnerability audit performed.
- Build regenerated dist; test/build tools may write their project-local caches. This report is the only intentionally added QA file. No dependency installation, implementation edit, unrelated file access/change, or server process modification.
- Browser testing wrote only this preview origin's taskflow.tasks.v1 test data. It was restored to the original empty version-1 task list, with no test tasks remaining. Temporary Storage prototype overrides and MutationObserver were removed. No screenshots were saved.
