export interface CaregiverInput {
  crm_coren?: string;
  bio?: string;
  userId?: string;
  // Campos adicionais aceitos na criação/atualização:
  [key: string]: unknown;
}
