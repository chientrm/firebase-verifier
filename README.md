# `firebase-verifier` middleware for `expressjs`

[![ci](https://github.com/chientrm/firebase-verifier/actions/workflows/ci.yml/badge.svg)](https://github.com/chientrm/firebase-verifier/actions/workflows/ci.yml)
[![Commit](https://img.shields.io/github/commit-activity/m/chientrm/firebase-verifier)](https://img.shields.io/github/commit-activity/m/chientrm/firebase-verifier)
[![Languages](https://img.shields.io/github/languages/top/chientrm/firebase-verifier)](https://github.com/trending/javascript)
[![Discord](https://img.shields.io/discord/925391810472329276?logo=discord)](https://discord.gg/HMMtp3dTPh)
[![Dependencies](https://img.shields.io/depfu/chientrm/firebase-verifier)](https://depfu.com/repos/github/chientrm/firebase-verifier)
[![Repo size](https://img.shields.io/github/repo-size/chientrm/firebase-verifier)](https://github.com/chientrm/firebase-verifier)
[![Download](https://img.shields.io/npm/dt/@chientrm/firebase-verifier)](https://www.npmjs.com/package/@chientrm/firebase-verifier)
[![Sponsors](https://img.shields.io/github/sponsors/chientrm)](https://github.com/chientrm)
[![Issues](https://img.shields.io/github/issues/chientrm/firebase-verifier)](https://github.com/chientrm/firebase-verifier/issues)
[![License](https://img.shields.io/npm/l/firebase-verifier)](https://github.com/chientrm/firebase-verifier/blob/main/LICENSE)
[![Version](https://img.shields.io/github/package-json/v/chientrm/firebase-verifier)](https://github.com/chientrm/firebase-verifier)
[![Contributors](https://img.shields.io/npm/v/firebase-verifier)](https://www.npmjs.com/package/firebase-verifier)
[![Contributors](https://img.shields.io/github/contributors/chientrm/firebase-verifier)](https://github.com/chientrm/firebase-verifier/graphs/contributors)

When you don't want to install `firebase-admin-sdk` just to verify `id token` and/or `app check token`.

## Install

```sh
npm install firebase-verifier
```

## Configs

Obtains `project_id` and `project_no` from [Google Cloud Console](https://console.cloud.google.com)

## Usage

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
  console.log(res.locals.user);
  /* Output
    {
      "sub": "kxljssoieeJKLe",
      "email": "chientrm@gmail.com",
      ...
    }
  */
});

...

// Verify App Check token
app.use(appCheckVerifier({ project_id, project_no }));
app.get("/", (req, res) => {
  console.log(res.locals.device);
  /* Output
    {
      ...
    }
  */
});

...

// Verify both Id token and App Check token
app.use(firebaseVerifier({ project_id, project_no }));
app.get("/", (req, res) => {
  console.log(res.locals.user);
  console.log(res.locals.device);
});

app.listen(3000);
```
