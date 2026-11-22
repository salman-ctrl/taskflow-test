# TaskFlow

A responsive, accessible dark task manager built with React, TypeScript, and Vite.

## Run locally

Requires Node.js 22.12+ (or a newer supported release) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To validate and preview production:

```sh
npm test
npm run build
npm run preview
```

## Behavior

- Add a task with Enter or Add task. Blank titles are rejected; titles allow up to 240 characters.
- Edit inline, save with Enter, and cancel with Escape or the cancel button.
- Toggle the checkbox to complete or reactivate; delete with the task's delete button.
- All tasks, Active, and Completed filters include live counts. Adding a task returns to All tasks.
- Changes save automatically to this browser's localStorage under `taskflow.tasks.v1` using a versioned payload.
- Malformed data is validated: valid entries are retained, invalid or duplicate entries skipped, and a warning displayed. The cleaned list replaces damaged stored data.
- When storage is blocked or full, the app continues in memory and displays a warning. Such changes may be lost on reload.
- Storage is per browser and origin; there is no account, server, cross-device sync, or cross-tab synchronization. Use the same local port to keep the same task list.
- Deletion is immediate. Keyboard focus indicators, named controls, live announcements, and reduced-motion preferences are supported.
- When deleting a focused task or toggling it out of the current filter, focus moves to the next task, then the previous task, or the add-task input if no tasks remain. A neighboring task receives focus on its checkbox (or its edit field if already editing). Actions on a row that does not contain focus do not move focus.
- Action announcements include the task title. The live region clears and updates after 100 ms so identical consecutive actions can be announced again. Rapid actions replace pending announcements instead of creating a stale queue.

## Structure

`src/components/` contains the composer, filters, task row, progress card, and SVG icons. `src/hooks/useTasks.ts` owns task state and persistence; `src/hooks/useLiveAnnouncement.ts` handles announcement timing and cleanup. `src/storage.ts` validates saved data. Tests exercise user journeys, filtering, reload persistence, edit cancellation, damaged data, unavailable storage, keyboard focus after removal, and repeated live-region updates.

All packages are project-local. `.npmrc` also keeps npm's download cache in `.npm-cache/` within this project. Production files are generated in `dist/`.
