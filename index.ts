import type { NextFunction, Request, Response } from "express";
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  importX509,
  jwtVerify,
} from "jose";
import fetch from "node-fetch";

const forIdTokenPublicKeys = fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
  )
    .then((res) => res.json())
    .then((data) => data as Record<string, string>),
  appCheckJWKS = createRemoteJWKSet(
    new URL("https://firebaseappcheck.googleapis.com/v1beta/jwks")
  ),
  verifyIdToken = (jwt: string, project_no: string) =>
    Promise.all([decodeProtectedHeader(jwt), forIdTokenPublicKeys])
      .then(([header, publicKeys]) => publicKeys[header.kid!])
      .then((certificate) => importX509(certificate, "RS256"))
      .then((key) =>
        jwtVerify(jwt, key, {
          issuer: `https://securetoken.google.com/${project_no}`,
          audience: project_no,
        })
      )
      .then((result) => result.payload),
  verifyAppCheckToken = (jwt: string, project_no: string) =>
    jwtVerify(jwt, appCheckJWKS, {
      issuer: `https://firebaseappcheck.googleapis.com/${project_no}`,
      audience: `projects/${project_no}`,
    }).then((res) => res.payload),
  authVerifier =
    (project_no: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const authorization = req.header("Authorization")!,
        jwt = authorization.split(" ")[1],
        user = await verifyIdToken(jwt, project_no);
      res.locals.user = user;
      next();
    },
  appCheckVerifier =
    (project_no: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const jwt = req.header("X-Firebase-AppCheck")!,
        device = await verifyAppCheckToken(jwt, project_no);
      res.locals.device = device;
      next();
    },
  firebaseVerifier =
    (project_no: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const authorization = req.header("Authorization")!,
        idToken = authorization.split(" ")[1],
        appCheckToken = req.header("X-Firebase-AppCheck")!,
        [user, device] = await Promise.all([
          verifyIdToken(idToken, project_no),
          verifyAppCheckToken(appCheckToken, project_no),
        ]);
      res.locals.user = user;
      res.locals.device = device;
      next();
    };
export { authVerifier, appCheckVerifier, firebaseVerifier };
