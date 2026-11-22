# TaskFlow QA-01 / QA-02 implementation handoff

Status: fixes implemented and locally verified; independent Pixel acceptance is pending.

Exact project: `C:\Users\MSI\OpenBot\Shared\TaskFlow-test`.

## Changed files

- `src/App.tsx`: capture a useful focus destination before removing a focused row, restore it after the DOM commit, and use task-specific announcements.
- `src/components/TaskItem.tsx`: identify task rows with a data attribute for focus lookup.
- `src/components/TaskComposer.tsx`: expose a typed input ref for the empty-list focus destination.
- `src/hooks/useLiveAnnouncement.ts` (new): clear/repopulate a stable live region, replace pending messages, and cancel the pending timer on unmount.
- `src/accessibility.test.tsx` (new): nine regression cases for focus and announcements.
- `README.md`: document exact keyboard and announcement behavior.
- `IMPLEMENTATION.md`: mark the original handoff as historical and direct readers here.
- `FIXES.md` (new): this handoff.
- `dist/` and `TaskFlow-source.zip`: regenerated from the current source; dependency/cache folders excluded from the archive.

No dependencies were added or changed. All writes remained in the dedicated project directory. No global installs, unrelated edits, or QA delegation occurred.

## Exact focus behavior

When deletion or a completion/reactivation toggle removes the row containing keyboard focus from the current list:

1. Focus the next visible task's checkbox.
2. If no next task exists, focus the previous visible task's checkbox.
3. If that neighboring task is already editing, focus its edit input instead.
4. If the visible list is empty (or the neighboring input is unavailable), focus the add-task input.

The destination is selected before the mutation and focused in a layout effect after React commits the removal. The next Tab follows the destination's normal DOM order (for example, checkbox -> Edit -> Delete). Toggling in All tasks retains focus on the existing checkbox. A row removal that does not contain focus does not move focus elsewhere.

## Exact announcement behavior

The persistent polite, atomic live region is named `Task updates`. Each action uses its task title: `Added “Read”.`, `Updated task to “Read”.`, `Completed “Read”.`, `Marked “Read” active.`, or `Deleted “Read”.`

Every action first clears the current text, then inserts the new message after 100 ms. Identical repeated actions therefore produce a real empty -> populated DOM update. Only one message is retained. Actions within the 100 ms interval cancel/replace the pending announcement; they do not accumulate a stale queue. Unmount cleanup cancels a pending timer.

## Commands and results

Both rounds of the following commands completed successfully (the second round includes the neighboring-editor and nonfocused-row regressions):

```powershell
npm exec -- prettier --write src/App.tsx src/components/TaskItem.tsx src/components/TaskComposer.tsx src/hooks/useLiveAnnouncement.ts src/accessibility.test.tsx
npm exec -- prettier --write src/App.tsx src/accessibility.test.tsx README.md IMPLEMENTATION.md
npm test
npm run build
```

Final tests, exit 0:

```text
Test Files  3 passed (3)
     Tests  23 passed (23)
  Duration  4.11s
```

The nine added cases cover keyboard delete traversal (next, previous, and empty-list destinations), Active-filter completion, Completed-filter reactivation, unchanged focus for All-filter toggles, neighboring edit-field focus, no focus theft from another control, repeated identical adds/deletes, and latest-message replacement for rapid actions.

Final production build, exit 0:

```text
> tsc --noEmit && vite build
vite v8.3.8 building client environment for production...
25 modules transformed.
dist/index.html                   0.60 kB | gzip:  0.36 kB
dist/assets/index-DGzZl2ov.css   10.59 kB | gzip:  3.23 kB
dist/assets/index-DEAUhIVE.js   230.84 kB | gzip: 72.53 kB
built in 94ms
```

## Browser and preview evidence

The existing preview remains running at `http://127.0.0.1:4173/` (Node PID 25412), serving the final `dist` build. An HTTP read confirmed the final `index-DEAUhIVE.js` asset is referenced.

A Chromium check at 320 CSS pixels used keyboard Enter/Tab/Space to verify delete -> next checkbox -> next Edit, completion disappearing from Active, reactivation disappearing from Completed, and focus on `new-task` when the filtered list becomes empty. A MutationObserver on the built app recorded repeated identical adds as `["", "Added “Repeat fix”."]`. Browser diagnostics were empty. Only tasks created by this check were deleted; the test origin was left with an empty list.

The neighboring-editor refinement was subsequently checked by the final automated regression suite; the production build was rebuilt afterward.

## Known limits

Actual screen-reader speech and other browser/assistive-technology combinations were not tested. DOM/live-region updates and keyboard focus were verified; no independent QA acceptance is claimed. Rapid actions intentionally announce only the latest pending action. Existing browser/origin-local storage, no cross-tab synchronization, and immediate deletion behavior are unchanged.
