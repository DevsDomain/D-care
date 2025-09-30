-- POPULAÇÃO INICIAL REALISTA PARA JACAREÍ-SP

-- ===== LEGAL TERMS =====
INSERT INTO auth.legal_terms (id, version, content)
VALUES (uuid_generate_v4(), '1.0', 'Termos de uso do sistema D-Care, versão inicial.');


-- ===== USERS & PROFILES =====
-- 5 Families
INSERT INTO auth.users (id, email, password_hash, role) VALUES
(uuid_generate_v4(), 'maria.silva@exemplo.com', '$2a$10$hashFakeSenha1', 'FAMILY'),
(uuid_generate_v4(), 'joao.oliveira@exemplo.com', '$2a$10$hashFakeSenha2', 'FAMILY'),
(uuid_generate_v4(), 'ana.costa@exemplo.com', '$2a$10$hashFakeSenha3', 'FAMILY'),
(uuid_generate_v4(), 'carlos.souza@exemplo.com', '$2a$10$hashFakeSenha4', 'FAMILY'),
(uuid_generate_v4(), 'fernanda.alves@exemplo.com', '$2a$10$hashFakeSenha5', 'FAMILY');

-- 5 Caregivers
INSERT INTO auth.users (id, email, password_hash, role) VALUES
(uuid_generate_v4(), 'cintia.enfermeira@exemplo.com', '$2a$10$hashFakeSenha6', 'CAREGIVER'),
(uuid_generate_v4(), 'roberto.medico@exemplo.com', '$2a$10$hashFakeSenha7', 'CAREGIVER'),
(uuid_generate_v4(), 'aline.fisioterapeuta@exemplo.com', '$2a$10$hashFakeSenha8', 'CAREGIVER'),
(uuid_generate_v4(), 'lucas.tecnico@exemplo.com', '$2a$10$hashFakeSenha9', 'CAREGIVER'),
(uuid_generate_v4(), 'juliana.psicologa@exemplo.com', '$2a$10$hashFakeSenha10', 'CAREGIVER');


-- perfis
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Maria da Silva', '12991001122', '1980-03-15', 'female' FROM auth.users WHERE email='maria.silva@exemplo.com';
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'João Oliveira', '12991112233', '1975-07-20', 'male' FROM auth.users WHERE email='joao.oliveira@exemplo.com';
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Ana Costa', '12992223344', '1988-02-10', 'female' FROM auth.users WHERE email='ana.costa@exemplo.com';
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Carlos Souza', '12993334455', '1970-12-01', 'male' FROM auth.users WHERE email='carlos.souza@exemplo.com';
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Fernanda Alves', '12994445566', '1985-09-05', 'female' FROM auth.users WHERE email='fernanda.alves@exemplo.com';

-- perfis caregivers
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Cíntia Ramos', '12995556677', '1990-04-18', 'female' FROM auth.users WHERE email='cintia.enfermeira@exemplo.com';
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Roberto Lima', '12996667788', '1982-06-12', 'male' FROM auth.users WHERE email='roberto.medico@exemplo.com';
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Aline Ferreira', '12997778899', '1993-11-03', 'female' FROM auth.users WHERE email='aline.fisioterapeuta@exemplo.com';
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Lucas Martins', '12998889900', '1987-05-27', 'male' FROM auth.users WHERE email='lucas.tecnico@exemplo.com';
INSERT INTO auth.user_profiles (user_id, name, phone, birthdate, gender)
SELECT id, 'Juliana Pereira', '12999990011', '1991-08-14', 'female' FROM auth.users WHERE email='juliana.psicologa@exemplo.com';


-- ===== FAMILIES =====
INSERT INTO family.families (user_id, address, city, state, zip_code, location) 
SELECT id, 'Rua Santa Helena, 120', 'Jacareí', 'SP', '12308-320', ST_SetSRID(ST_MakePoint(-45.9651, -23.3054),4326)::GEOGRAPHY
FROM auth.users WHERE email='maria.silva@exemplo.com';

INSERT INTO family.families (user_id, address, city, state, zip_code, location) 
SELECT id, 'Av. Nove de Julho, 540', 'Jacareí', 'SP', '12327-620', ST_SetSRID(ST_MakePoint(-45.9672, -23.3050),4326)::GEOGRAPHY
FROM auth.users WHERE email='joao.oliveira@exemplo.com';

INSERT INTO family.families (user_id, address, city, state, zip_code, location) 
SELECT id, 'Rua Major Acácio, 300', 'Jacareí', 'SP', '12315-010', ST_SetSRID(ST_MakePoint(-45.9725, -23.3030),4326)::GEOGRAPHY
FROM auth.users WHERE email='ana.costa@exemplo.com';

INSERT INTO family.families (user_id, address, city, state, zip_code, location) 
SELECT id, 'Rua Barão de Jacareí, 78', 'Jacareí', 'SP', '12320-120', ST_SetSRID(ST_MakePoint(-45.9739, -23.3018),4326)::GEOGRAPHY
FROM auth.users WHERE email='carlos.souza@exemplo.com';

INSERT INTO family.families (user_id, address, city, state, zip_code, location) 
SELECT id, 'Rua Minas Gerais, 455', 'Jacareí', 'SP', '12322-210', ST_SetSRID(ST_MakePoint(-45.9712, -23.3075),4326)::GEOGRAPHY
FROM auth.users WHERE email='fernanda.alves@exemplo.com';


-- ===== ELDERS =====
INSERT INTO family.elders (family_id, name, birthdate, medical_conditions, medications)
SELECT f.id, 'José da Silva', '1942-06-10', '{"diabetes":"tipo 2"}', '{"metformina":"850mg"}'
FROM family.families f JOIN auth.users u ON f.user_id=u.id WHERE u.email='maria.silva@exemplo.com';

INSERT INTO family.elders (family_id, name, birthdate, medical_conditions, medications)
SELECT f.id, 'Helena Oliveira', '1938-11-22', '{"hipertensão":"crônica"}', '{"losartana":"50mg"}'
FROM family.families f JOIN auth.users u ON f.user_id=u.id WHERE u.email='joao.oliveira@exemplo.com';

INSERT INTO family.elders (family_id, name, birthdate, medical_conditions, medications)
SELECT f.id, 'Paulo Costa', '1945-01-30', '{"alzheimers":"inicial"}', '{"donepezila":"10mg"}'
FROM family.families f JOIN auth.users u ON f.user_id=u.id WHERE u.email='ana.costa@exemplo.com';

INSERT INTO family.elders (family_id, name, birthdate, medical_conditions, medications)
SELECT f.id, 'Sebastião Souza', '1939-09-14', '{"cardiopatia":"isquêmica"}', '{"atenolol":"25mg"}'
FROM family.families f JOIN auth.users u ON f.user_id=u.id WHERE u.email='carlos.souza@exemplo.com';

INSERT INTO family.elders (family_id, name, birthdate, medical_conditions, medications)
SELECT f.id, 'Lúcia Alves', '1947-12-05', '{"artrite":"severa"}', '{"ibuprofeno":"400mg"}'
FROM family.families f JOIN auth.users u ON f.user_id=u.id WHERE u.email='fernanda.alves@exemplo.com';


-- ===== CAREGIVERS =====
INSERT INTO caregiver.caregivers (user_id, crm_coren, validated, bio, location)
SELECT id, 'COREN-SP 123456', true, 'Enfermeira com 10 anos de experiência em cuidados domiciliares.', 
ST_SetSRID(ST_MakePoint(-45.9701, -23.3041),4326)::GEOGRAPHY
FROM auth.users WHERE email='cintia.enfermeira@exemplo.com';

INSERT INTO caregiver.caregivers (user_id, crm_coren, validated, bio, location)
SELECT id, 'CRM-SP 654321', true, 'Médico clínico geral, experiência em geriatria.', 
ST_SetSRID(ST_MakePoint(-45.9699, -23.3035),4326)::GEOGRAPHY
FROM auth.users WHERE email='roberto.medico@exemplo.com';

INSERT INTO caregiver.caregivers (user_id, crm_coren, validated, bio, location)
SELECT id, 'CREFITO 987654', true, 'Fisioterapeuta especializada em reabilitação de idosos.', 
ST_SetSRID(ST_MakePoint(-45.9688, -23.3058),4326)::GEOGRAPHY
FROM auth.users WHERE email='aline.fisioterapeuta@exemplo.com';

INSERT INTO caregiver.caregivers (user_id, crm_coren, validated, bio, location)
SELECT id, 'COREN-SP 456789', false, 'Técnico de enfermagem em processo de validação.', 
ST_SetSRID(ST_MakePoint(-45.9715, -23.3027),4326)::GEOGRAPHY
FROM auth.users WHERE email='lucas.tecnico@exemplo.com';

INSERT INTO caregiver.caregivers (user_id, crm_coren, validated, bio, location)
SELECT id, 'CRP 112233', true, 'Psicóloga com foco em saúde mental de idosos.', 
ST_SetSRID(ST_MakePoint(-45.9722, -23.3049),4326)::GEOGRAPHY
FROM auth.users WHERE email='juliana.psicologa@exemplo.com';


-- ===== AVAILABILITY =====
INSERT INTO caregiver.caregiver_availability (caregiver_id, date, time_start, time_end, emergency)
SELECT id, CURRENT_DATE + 1, '08:00', '12:00', false FROM caregiver.caregivers LIMIT 5;

INSERT INTO caregiver.caregiver_availability (caregiver_id, date, time_start, time_end, emergency)
SELECT id, CURRENT_DATE + 2, '14:00', '18:00', true FROM caregiver.caregivers LIMIT 5;


-- ===== APPOINTMENTS =====
-- Maria da Silva (família) marcou com Cíntia (enfermeira)
INSERT INTO appointments.appointments (family_id, elder_id, caregiver_id, datetime_start, datetime_end, status)
SELECT f.id, e.id, c.id, CURRENT_DATE + interval '1 day 09:00', CURRENT_DATE + interval '1 day 10:00', 'confirmed'
FROM family.families f 
JOIN family.elders e ON e.family_id=f.id
JOIN caregiver.caregivers c ON c.crm_coren='COREN-SP 123456'
JOIN auth.users u ON f.user_id=u.id WHERE u.email='maria.silva@exemplo.com';

-- João Oliveira marcou com Roberto (médico) concluído
INSERT INTO appointments.appointments (family_id, elder_id, caregiver_id, datetime_start, datetime_end, status)
SELECT f.id, e.id, c.id, CURRENT_DATE - interval '5 day 15:00', CURRENT_DATE - interval '5 day 16:00', 'completed'
FROM family.families f 
JOIN family.elders e ON e.family_id=f.id
JOIN caregiver.caregivers c ON c.crm_coren='CRM-SP 654321'
JOIN auth.users u ON f.user_id=u.id WHERE u.email='joao.oliveira@exemplo.com';

-- Ana Costa marcou com Aline (fisioterapeuta), pendente
INSERT INTO appointments.appointments (family_id, elder_id, caregiver_id, datetime_start, datetime_end, status)
SELECT f.id, e.id, c.id, CURRENT_DATE + interval '3 day 10:00', CURRENT_DATE + interval '3 day 11:00', 'pending'
FROM family.families f 
JOIN family.elders e ON e.family_id=f.id
JOIN caregiver.caregivers c ON c.crm_coren='CREFITO 987654'
JOIN auth.users u ON f.user_id=u.id WHERE u.email='ana.costa@exemplo.com';

-- Carlos Souza marcou com Lucas (técnico), cancelado
INSERT INTO appointments.appointments (family_id, elder_id, caregiver_id, datetime_start, datetime_end, status)
SELECT f.id, e.id, c.id, CURRENT_DATE - interval '2 day 09:00', CURRENT_DATE - interval '2 day 10:00', 'canceled'
FROM family.families f 
JOIN family.elders e ON e.family_id=f.id
JOIN caregiver.caregivers c ON c.crm_coren='COREN-SP 456789'
JOIN auth.users u ON f.user_id=u.id WHERE u.email='carlos.souza@exemplo.com';

-- Fernanda Alves marcou com Juliana (psicóloga), confirmado
INSERT INTO appointments.appointments (family_id, elder_id, caregiver_id, datetime_start, datetime_end, status)
SELECT f.id, e.id, c.id, CURRENT_DATE + interval '7 day 16:00', CURRENT_DATE + interval '7 day 17:00', 'confirmed'
FROM family.families f 
JOIN family.elders e ON e.family_id=f.id
JOIN caregiver.caregivers c ON c.crm_coren='CRP 112233'
JOIN auth.users u ON f.user_id=u.id WHERE u.email='fernanda.alves@exemplo.com';


-- ===== REVIEWS =====
INSERT INTO reviews.reviews (appointment_id, family_id, caregiver_id, rating, comment)
SELECT a.id, a.family_id, a.caregiver_id, 5, 'Atendimento excelente, muito atenciosa!'
FROM appointments.appointments a
JOIN caregiver.caregivers c ON a.caregiver_id=c.id
WHERE c.crm_coren='COREN-SP 123456' LIMIT 1;

INSERT INTO reviews.reviews (appointment_id, family_id, caregiver_id, rating, comment)
SELECT a.id, a.family_id, a.caregiver_id, 4, 'Médico foi ótimo, explicou bem.'
FROM appointments.appointments a
JOIN caregiver.caregivers c ON a.caregiver_id=c.id
WHERE c.crm_coren='CRM-SP 654321' LIMIT 1;


-- ===== FAQ SIMULATION =====
INSERT INTO knowledge.faq_ai_queries (user_id, question, answer)
SELECT id, 'Quais cuidados devo ter com idosos com diabetes?', 'Manter dieta equilibrada, controle da glicemia e acompanhamento médico regular.'
FROM auth.users WHERE email='maria.silva@exemplo.com';

INSERT INTO knowledge.faq_ai_queries (user_id, question, answer)
SELECT id, 'Como funciona o agendamento de emergência?', 'Você pode marcar atendimento rápido através do aplicativo, com prioridade para urgências.'
FROM auth.users WHERE email='joao.oliveira@exemplo.com';
