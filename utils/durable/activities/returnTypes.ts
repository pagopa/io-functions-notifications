import { toError } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { ActivityLogger } from "./log";

export type ActivityResultSuccess = t.TypeOf<typeof ActivityResultSuccess>;
export const ActivityResultSuccess = t.interface({
  kind: t.literal("SUCCESS")
});

export type ActivityResultFailure = t.TypeOf<typeof ActivityResultFailure>;
export const ActivityResultFailure = t.interface({
  kind: t.literal("FAILURE"),
  reason: t.string
});

export const ActivityResult = t.taggedUnion("kind", [
  ActivityResultSuccess,
  ActivityResultFailure
]);

export type ActivityResult = t.TypeOf<typeof ActivityResult>;

export const failure = (logger: ActivityLogger) => (
  err: Error,
  description: string = ""
) => {
  const logMessage =
    description === ""
      ? `FAILURE=${err.message}`
      : `${description}|FAILURE=${err.message}`;
  logger.info(logMessage);
  return ActivityResultFailure.encode({
    kind: "FAILURE",
    reason: err.message
  });
};

export const failActivity = (logger: ActivityLogger) => (
  errorMessage: string,
  errorDetails?: string
): ActivityResultFailure => {
  const details = errorDetails ? `|ERROR_DETAILS=${errorDetails}` : ``;
  logger.error(`${errorMessage}${details}`);
  return ActivityResultFailure.encode({
    kind: "FAILURE",
    reason: errorMessage
  });
};

// trigger a rety in case of activity failure
export const retryActivity = (logger: ActivityLogger, msg: string): never => {
  logger.error(msg);
  throw toError(msg);
};

/**
 * Build a retryActivity from `context` and `logPrefix`
 * @param context
 * @param logPrefix
 * @returns a function that log the error and throw an exception
 *          so that the orchestrator can retry the activity
 */
export const getRetryActivity = (context: Context, logPrefix: string) => (
  e: Error
) => retryActivity(context, `${logPrefix}|ERROR=${e.message}`);

/**
 * @returns an `ActivityResultSuccess`
 */
export const success = () =>
  ActivityResultSuccess.encode({
    kind: "SUCCESS"
  });
