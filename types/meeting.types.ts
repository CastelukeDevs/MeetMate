export type Meetings = {
  id: string;
  created_at: string;
  users: string;
  name: string;
  annotation?: any;
  summary?: Summary;
  inProgress: boolean;
  recording: string;
};

export type Summary = {
  text: string;
};
