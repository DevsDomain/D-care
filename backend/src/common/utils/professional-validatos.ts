export const PROFESSIONAL_REGEX = {
  // 🔹 NÃO MEXER
  CRM: /^CRM-[A-Z]{2}\s\d{4,7}$/,
  COREN: /^COREN-[A-Z]{2}\s\d{4,7}$/,

  // 🔹 CRP – ex.: CRP 06/12345 ou CRP 06/12345-6
  CRP: /^CRP\s?\d{2}\/\d{4,7}(-\d)?$/,

  // 🔹 CREFITO – ex.: CREFITO-3 123456-F, CREFITO-3/123456-F, CREFITO 3 123456-F
  CREFITO: /^CREFITO-?\d{1,2}[-\/ ]\d{4,7}-[A-Z]{1,3}$/,
};