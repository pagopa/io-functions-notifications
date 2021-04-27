import { NotificationHubService } from "azure-sb";
import * as t from "io-ts";

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { InstallationId } from "../generated/notifications/InstallationId";
import { IConfig } from "./config";
import { ExtendedNotificationHubService } from "./notification";
import { NotificationHubPartition } from "./types";

export const NotificationHubConfig = t.interface({
  AZURE_NH_ENDPOINT: NonEmptyString,
  AZURE_NH_HUB_NAME: NonEmptyString
});

export type NotificationHubConfig = t.TypeOf<typeof NotificationHubConfig>;

/**
 * It returns the configuration related to the Legacy Notification Hub instance
 *
 * @param envConfig the env config, containing
 *                  `AZURE_NH_ENDPOINT` and `AZURE_NH_HUB_NAME` variables
 */
export const getNHLegacyConfig = (
  envConfig: IConfig
): NotificationHubConfig => ({
  AZURE_NH_ENDPOINT: envConfig.AZURE_NH_ENDPOINT,
  AZURE_NH_HUB_NAME: envConfig.AZURE_NH_HUB_NAME
});

/**
 * @param sha The sha to test
 * @returns
 */
export const testShaForPartitionRegex = (
  regex: RegExp | string,
  sha: InstallationId
): boolean => (typeof regex === "string" ? new RegExp(regex) : regex).test(sha);

/**
 * @returns A connection string based on NH namespace and sharedAccessKey provided
 */
export const buildNHConnectionString = ({
  namespace,
  sharedAccessKey
}: NotificationHubPartition): NonEmptyString =>
  `Endpoint=sb://${namespace}.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=${sharedAccessKey}` as NonEmptyString;

/**
 * It returns the configuration related to one of the new Notification Hub instances
 * based on the partion mechanism defined
 *
 * @param envConfig the env config with Notification Hub connection strings and names
 * @param sha a valid hash256 representing a Fiscal Code
 */
export const getNotificationHubPartitionConfig = (envConfig: IConfig) => (
  sha: InstallationId
): NotificationHubConfig => {
  const partition = envConfig.AZURE_NOTIFICATION_HUB_PARTITIONS.find(p =>
    testShaForPartitionRegex(p.partitionRegex, sha)
  );

  if (partition) {
    const connectionString = buildNHConnectionString(partition);

    return {
      AZURE_NH_ENDPOINT: connectionString,
      AZURE_NH_HUB_NAME: partition.name
    };
  }

  throw new Error(`Unable to find Notification Hub partition for ${sha}`);
};

/**
 * @param config The NotificationHubConfig
 * @returns a NotificationHubService used to call Notification Hub APIs
 */
export const buildNHService = ({
  AZURE_NH_HUB_NAME,
  AZURE_NH_ENDPOINT
}: NotificationHubConfig): NotificationHubService =>
  new ExtendedNotificationHubService(AZURE_NH_HUB_NAME, AZURE_NH_ENDPOINT);
