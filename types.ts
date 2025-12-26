export interface Dependent {
  id: string;
  name: string;
  dob: string;
}

export interface FormData {
  consent: boolean;
  personal: {
    fullName: string;
    cpf: string;
    rg: string;
    dob: string;
    address: string;
    whatsapp: string;
    email: string;
    profession: string;
    workAddress: string;
    workPhone: string;
  };
  spouse: {
    name: string;
    email: string;
  };
  dependents: Dependent[];
}

export enum Step {
  Start = 1,
  Consent = 2,
  Personal = 3,
  Professional = 4,
  Spouse = 5,
  Dependents = 6,
  Success = 7
}