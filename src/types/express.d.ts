/* eslint-disable no-unused-vars */
export {};

declare global {
  namespace Express {
    interface Request {
      currentGithubEmail?: string;
    }
  }
}