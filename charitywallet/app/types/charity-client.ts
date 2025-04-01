// Client side charity types.
export interface Charity {
  charity_name?: string | null;
  registered_office_address?: string | null;
  registration_number?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  contact_email?: string | null;
  contact_mobile_phone?: string | null;
  wallet_address: string;
}
