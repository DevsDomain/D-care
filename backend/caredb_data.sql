--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg110+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: care
--

INSERT INTO auth.users VALUES ('fc4963f5-f3ee-43b3-bb45-b14d58985151', 'bella@email.com', '$2b$10$LJ/SaEg.ThlpP4/wxQvbRef.W1U.R5EqzaIwDOswyAWJUGr8Hx9SK', 'CAREGIVER', 'active', '2025-10-27 23:43:39.914', '2025-10-27 23:43:39.914', NULL);
INSERT INTO auth.users VALUES ('3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', 'moraisdpm@email.com', '$2b$10$ZqVlQVFqWiD9RwiAaiHa0.e6IUFaRIfEtSTXzYCaZL7mEUAMs6WIy', 'FAMILY', 'active', '2025-10-31 23:54:19.793', '2025-10-31 23:54:19.793', NULL);
INSERT INTO auth.users VALUES ('5fafe5de-769f-450d-a61b-59bd60a5be5c', 'jose@email.com', '$2b$10$qQXtQUKvdGNuElr.fBFSoujFygu6tss74rENTA4svQwEtUZcqCcw.', 'CAREGIVER', 'active', '2025-11-01 23:48:27.518', '2025-11-01 23:48:27.518', NULL);


--
-- Data for Name: caregivers; Type: TABLE DATA; Schema: caregiver; Owner: care
--

INSERT INTO caregiver.caregivers VALUES ('02e02342-738c-41cd-a2b8-5fdef897ec99', 'fc4963f5-f3ee-43b3-bb45-b14d58985151', 'CRM-MG 123456', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/caregivers/382f6642-513a-4a65-919c-3339a5d86b0a-5D0E0FDA-3ACA-44E5-A344-876870BB8211.jpeg', false, 'Estudante de medicina do primeiro periodo', 'Rua Betim', 'São José dos Campos', 'SP', '12228080', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', 3, 1, '1 ano', '30', true, false, '["Administração de medicamentos", "Acompanhamento em consultas"]', '["Português", "Espanhol"]', '["Cuidador de Idosos", "Clínica Médica"]', '["CRM Ativo"]', '2025-10-27 23:43:39.914', '2025-11-01 23:45:29.051');
INSERT INTO caregiver.caregivers VALUES ('b4d2b9ef-eb59-4727-a151-6c5b42af4b6c', '5fafe5de-769f-450d-a61b-59bd60a5be5c', 'COREN-SP 123456', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/caregivers/92071770-ea9f-4ad5-98f6-a2a550a2f599-52E18857-74F3-45A4-8B2E-466396F7AA71.jpeg', false, 'O melhor cuidador de idoso da região ', 'Alameda Pau-Brasil', 'Jacareí', 'SP', '12302314', '0101000020E6100000687D25EBCBF546C069CC7FA3784637C0', 0, 0, '3 anos', '20', true, true, '["Administração de medicamentos", "Alimentação assistida", "Troca de curativos simples", "Acompanhamento em atividades externas"]', NULL, '["Cuidador de Idosos", "Atendente de Enfermagem"]', NULL, '2025-11-01 23:48:27.518', '2025-11-02 00:01:11.946');


--
-- Data for Name: families; Type: TABLE DATA; Schema: family; Owner: care
--



--
-- Data for Name: elders; Type: TABLE DATA; Schema: family; Owner: care
--

INSERT INTO family.elders VALUES ('c63d50ef-cccf-4882-adc4-02997a47da22', NULL, 'Jaozinho', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/elders/6d874e60-d8ea-4379-b9a4-bf1abf1cf82d-me.jpg', '1952-10-07', '["Diabetes", "Parkinson"]', '["Losartan", "Insulina"]', 'Rua Betim 1', 'São José dos Campos', 'SP', '12228080', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', '2025-10-31 23:55:16.875', '2025-10-31 23:55:16.875');
INSERT INTO family.elders VALUES ('554e2e2f-4c85-4394-9e4f-d980cc8e31c3', NULL, 'Teste da Silva ', NULL, '1990-11-04', '[]', '[]', 'Rua Betim', 'São José dos Campos', 'SP', '12228080', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', '2025-11-02 01:01:10.983', '2025-11-02 01:01:10.983');


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: appointments; Owner: care
--



--
-- Data for Name: appointment_requests; Type: TABLE DATA; Schema: appointments; Owner: care
--



--
-- Data for Name: legal_terms; Type: TABLE DATA; Schema: auth; Owner: care
--



--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: auth; Owner: care
--

INSERT INTO auth.user_profiles VALUES ('4164cc80-19c3-45cc-abb2-8689c4f16c7d', 'fc4963f5-f3ee-43b3-bb45-b14d58985151', 'Isabella Danes', '999999', NULL, NULL, '2025-10-27 23:43:39.914', '2025-10-27 23:43:39.914');
INSERT INTO auth.user_profiles VALUES ('11c2f5c2-9c04-4f3f-9ae2-8a2ac8856c21', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', 'Michael A Morais', '12222222222', NULL, NULL, '2025-10-31 23:54:19.793', '2025-10-31 23:54:19.793');
INSERT INTO auth.user_profiles VALUES ('c3630a30-7c93-4188-880f-bec53cef1f16', '5fafe5de-769f-450d-a61b-59bd60a5be5c', 'Jose', '1299491132', NULL, NULL, '2025-11-01 23:48:27.518', '2025-11-01 23:48:27.518');


--
-- Data for Name: user_terms_acceptance; Type: TABLE DATA; Schema: auth; Owner: care
--



--
-- Data for Name: caregiver_documents; Type: TABLE DATA; Schema: caregiver; Owner: care
--



--
-- Data for Name: ivcf20_responses; Type: TABLE DATA; Schema: family; Owner: care
--



--
-- Data for Name: faq_ai_queries; Type: TABLE DATA; Schema: knowledge; Owner: care
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: care
--

INSERT INTO public._prisma_migrations VALUES ('5e13ef0d-4dd4-4391-9448-6948b66c2fa4', '443d495d0444bdde2d9990984fc61dbed8c14118f56978c3563e08f147047e49', '2025-10-27 23:18:35.47032+00', '20251027231835_extend_caregivers_availability', NULL, NULL, '2025-10-27 23:18:35.17884+00', 1);


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: care
--



--
-- Data for Name: reviews; Type: TABLE DATA; Schema: reviews; Owner: care
--



--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: care
--



--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: care
--



--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: care
--



--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: care
--



--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: care
--



--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: care
--



--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: care
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

