export interface UpdateCompanyPayload {
  name?: string;
  tax_id?: string;
}

export interface Company {
  id: string;
  name: string;
  tax_id: string | null;
  roles: string[];
}
