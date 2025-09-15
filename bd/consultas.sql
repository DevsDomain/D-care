
-- 1. Buscar cuidadores em um raio de **5km** de uma família

SELECT 
    up.name AS caregiver_name,
    c.crm_coren,
    c.validated,
    c.bio,
    ROUND(ST_Distance(f.location, c.location)::NUMERIC, 2) AS distancia_metros
FROM family.families f
JOIN caregiver.caregivers c ON TRUE
JOIN auth.user_profiles up ON up.user_id = c.user_id
WHERE f.user_id = (SELECT id FROM auth.users WHERE email='maria.silva@exemplo.com')
  AND ST_DWithin(f.location, c.location, 5000) -- 5000 metros = 5km
ORDER BY distancia_metros ASC;


-- 2. Buscar cuidadores **disponíveis amanhã de manhã**

SELECT 
    up.name AS caregiver_name,
    c.crm_coren,
    a.date,
    a.time_start,
    a.time_end
FROM caregiver.caregivers c
JOIN caregiver.caregiver_availability a ON c.id=a.caregiver_id
JOIN auth.user_profiles up ON up.user_id = c.user_id
WHERE a.date = CURRENT_DATE + 1
  AND a.time_start <= '09:00'
  AND a.time_end >= '12:00'
  AND a.status = 'available';


-- 3. Buscar cuidadores com **nota média acima de 4**

SELECT 
    up.name AS caregiver_name,
    c.crm_coren,
    ROUND(AVG(r.rating),2) AS media_avaliacao,
    COUNT(r.id) AS qtd_avaliacoes
FROM caregiver.caregivers c
JOIN reviews.reviews r ON r.caregiver_id=c.id
JOIN auth.user_profiles up ON up.user_id = c.user_id
GROUP BY c.id, up.name, c.crm_coren
HAVING AVG(r.rating) > 4
ORDER BY media_avaliacao DESC;


-- 4. Buscar todos os idosos de uma família com suas condições médicas

SELECT 
    e.name AS elder_name,
    e.birthdate,
    e.medical_conditions,
    e.medications
FROM family.elders e
JOIN family.families f ON f.id=e.family_id
JOIN auth.users u ON u.id=f.user_id
WHERE u.email='joao.oliveira@exemplo.com';


-- 5. Histórico de atendimentos de um cuidador específico

SELECT 
    a.datetime_start,
    a.datetime_end,
    a.status,
    f.address AS endereco_familia,
    e.name AS elder_name
FROM appointments.appointments a
JOIN caregiver.caregivers c ON a.caregiver_id=c.id
JOIN family.families f ON a.family_id=f.id
JOIN family.elders e ON a.elder_id=e.id
JOIN auth.user_profiles up ON up.user_id=c.user_id
WHERE up.name='Cíntia Ramos'
ORDER BY a.datetime_start DESC;


-- 6. Encontrar cuidadores que aceitam **emergência** e estão disponíveis hoje

SELECT 
    up.name AS caregiver_name,
    c.crm_coren,
    a.date,
    a.time_start,
    a.time_end
FROM caregiver.caregivers c
JOIN caregiver.caregiver_availability a ON c.id=a.caregiver_id
JOIN auth.user_profiles up ON up.user_id=c.user_id
WHERE a.date = CURRENT_DATE
  AND a.emergency = true
  AND a.status = 'available';

