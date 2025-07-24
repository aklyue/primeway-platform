export interface AnySchedule {
  schedule_type?: string;
  start_time?: string;
  end_time?: string;
  day_of_week?: string;
  schedule_id?: string;
  days_of_week?: { day_of_week?: string }[];
}
