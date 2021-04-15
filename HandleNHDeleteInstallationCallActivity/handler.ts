import { NotificationHubService } from "azure-sb";
import { toString } from "fp-ts/lib/function";
import * as t from "io-ts";

import { NonEmptyString } from "italia-ts-commons/lib/strings";

import {
  ActivityBody,
  ActivityResultSuccess,
  failActivity
} from "../utils/durable/activities";
import { deleteInstallation } from "../utils/notification";
import { NotificationHubConfig } from "../utils/notificationhubServicePartition";

// Activity name for df
export const ActivityName = "HandleNHDeleteInstallationCallActivity";

// Activity input
export type ActivityInput = t.TypeOf<typeof ActivityInput>;
export const ActivityInput = t.interface({
  installationId: NonEmptyString,
  notificationHubConfig: NotificationHubConfig
});

// Activity Result
export { ActivityResultSuccess } from "../utils/durable/activities";

/**
 * For each Notification Hub Message of type "Delete" calls related Notification Hub service
 */

export const getActivityBody = (
  buildNHService: (nhConfig: NotificationHubConfig) => NotificationHubService
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
): ActivityBody<ActivityInput, ActivityResultSuccess> => ({
  input,
  logger
}) => {
  logger.info(`INSTALLATION_ID=${input.installationId}`);
  const nhService = buildNHService(input.notificationHubConfig);

  return deleteInstallation(nhService, input.installationId).bimap(
    e => failActivity(logger)(`ERROR=${toString(e)}`),
    ActivityResultSuccess.encode
  );
};
