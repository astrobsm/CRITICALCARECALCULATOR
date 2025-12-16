export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  hospital: string;
  hospitalNumber: string;
  diagnosis: string;
  comorbidities: string[];
}

export interface PatientInfoProps {
  patientInfo: PatientInfo;
}
