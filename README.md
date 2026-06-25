# Traitors

Mobile-first in-person social deduction game built with React, Vite, TypeScript, MUI, Zustand, Express, and Socket.IO.

## Run

```bash
npm install
npm run dev
```

Client: http://localhost:5173  
Server: http://localhost:3001

## Gameplay

- 4-5 players: 1 Traitor, remaining players Innocent.
- 6+ players: 1 Traitor, 1 Doctor, remaining players Innocent.
- Every alive player submits night actions, but only the Traitor kill and Doctor save are used.
- Daytime elimination votes are real; ties eliminate no one.
- Eliminated players stay connected as watchers.
- Refresh/reconnect is supported from local session storage while the in-memory server room exists.

## Scripts

```bash
npm run dev        # run client and server together
npm run build      # type-check/build server and client
npm run start      # run built server
npm run typecheck  # check frontend types
```
