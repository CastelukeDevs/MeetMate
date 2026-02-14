export type TranscriptSegment = {
  text: string;
  start: number;
  end: number;
};

export type Meetings = {
  id: string;
  created_at: string;
  users: string;
  name: string;
  annotation?: TranscriptSegment[];
  summary?: Summary;
  inProgress: boolean | null;
  recording: string;
};

export type Summary = {
  text: string;
  short: string;
};
