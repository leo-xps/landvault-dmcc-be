export interface OrganizationType {
  resource: {
    avatar_url: string | null;
    created_at: string;
    current_organization: string;
    email: string;
    name: string;
    resource_type: string;
    scheduling_url: string;
    slug: string;
    timezone: string;
    updated_at: string;
    uri: string;
  };
}

export interface OnEventCreated {
  created_at: string;
  created_by: string;
  event: string;
  payload: {
    cancel_url: string;
    created_at: string;
    email: string;
    event: string;
    first_name: string | null;
    invitee_scheduled_by: string;
    last_name: string | null;
    name: string;
    questions_and_answers: {
      answer: string;
      position: number;
      question: string;
    }[];
    reschedule_url: string;
    rescheduled: string;
    scheduled_event: {
      created_at: string;
      end_time: string;
      event_guests: {
        created_at: string;
        email: string;
        updated_at: string;
      }[];
      event_memberships: {
        user: string;
        user_email: string;
      }[];
      event_type: string;
      invitees_counter: {
        total: number;
        active: number;
        limit: number;
      };
      location: {
        location: string;
        type: string;
      };
      name: string;
      start_time: string;
      status: string;
      updated_at: string;
      uri: string;
    };
    status: string;
    timezone: string;
    updated_at: string;
    uri: string;
  };
}
