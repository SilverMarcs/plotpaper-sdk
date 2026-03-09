/** Notification trigger types for scheduleNotification */
export type NotificationTrigger =
  | { type: "daily"; hour: number; minute: number }
  | { type: "delay"; seconds: number };
