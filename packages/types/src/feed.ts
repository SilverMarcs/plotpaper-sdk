/** Feed action displayed on the user's home feed */
export interface FeedAction {
  title: string;
  body?: string;
  icon?: string;
  /** Maps template placeholders to custom_app_data keys for dynamic resolution */
  dataKeys?: Record<string, string>;
  buttons?: FeedActionButton[];
}

/** Button on a feed action card for quick interactions */
export interface FeedActionButton {
  label: string;
  icon?: string;
  action:
    | { type: "increment"; key: string; amount?: number }
    | { type: "set"; key: string; value: any };
}
