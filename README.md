# Firebase verifier middleware for `expressjs`

When you don't want to install `firebase-admin-sdk` just to verify id token and/or app check token.

## Install

```sh
npm install firebase-verifier
```

## Config

Obtains `project_id` and `project_no` from [Google Cloud Console](https://console.cloud.google.com)

## Usage

### Initialize app:

```ts
import express from "express";
import {
  authVerifier,
  appCheckVerifier,
  firebaseVerifier,
} from "firebase-verifier";

const project_id = "<project_id>";
const project_no = "<project_no>";

const app = express();

// Verify Id token
app.use(authVerifier(project_id));
app.get("/", (req, res) => {
  const user = res.locals.user; // user: JWTPayload
});

...

// Verify App Check token
app.use(appCheckVerifier({ project_id, project_no }));
app.get("/", (req, res) => {
  const device = res.locals.device; // device: JWTPayload
});

...

// Verify both Id token and App Check token
app.use(firebaseVerifier({ project_id, project_no }));
app.get("/", (req, res) => {
  const user = res.locals.user; // user: JWTPayload
  const device = res.locals.device; // device: JWTPayload
});

app.listen(3000);
```
