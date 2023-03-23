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
  verifyIdToken = ({
    idToken,
    project_id,
  }: {
    idToken: string;
    project_id: string;
  }) =>
    Promise.all([decodeProtectedHeader(idToken), forIdTokenPublicKeys])
      .then(([header, publicKeys]) => publicKeys[header.kid!])
      .then((certificate) => importX509(certificate, "RS256"))
      .then((key) =>
        jwtVerify(idToken, key, {
          issuer: `https://securetoken.google.com/${project_id}`,
          audience: project_id,
        })
      )
      .then((result) => result.payload),
  verifyAppCheckToken = ({
    appCheckToken,
    project_id,
    project_no,
  }: {
    appCheckToken: string;
    project_id: string;
    project_no: string;
  }) =>
    jwtVerify(appCheckToken, appCheckJWKS, {
      issuer: `https://firebaseappcheck.googleapis.com/${project_no}`,
      audience: `projects/${project_id}`,
    }).then((res) => res.payload),
  authVerifier =
    (project_id: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const authorization = req.header("Authorization")!,
        idToken = authorization.split(" ")[1],
        user = await verifyIdToken({ idToken, project_id });
      res.locals.user = user;
      next();
    },
  appCheckVerifier =
    ({ project_no, project_id }: { project_id: string; project_no: string }) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const appCheckToken = req.header("X-Firebase-AppCheck")!,
        device = await verifyAppCheckToken({
          appCheckToken,
          project_no,
          project_id,
        });
      res.locals.device = device;
      next();
    },
  firebaseVerifier =
    ({ project_no, project_id }: { project_id: string; project_no: string }) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const authorization = req.header("Authorization")!,
        idToken = authorization.split(" ")[1],
        appCheckToken = req.header("X-Firebase-AppCheck")!,
        [user, device] = await Promise.all([
          verifyIdToken({ idToken, project_id }),
          verifyAppCheckToken({ appCheckToken, project_no, project_id }),
        ]);
      res.locals.user = user;
      res.locals.device = device;
      next();
    };
export { authVerifier, appCheckVerifier, firebaseVerifier };
