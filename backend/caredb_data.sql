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
INSERT INTO auth.users VALUES ('91507b05-e7cf-49bb-8593-b19f6cb969a9', 'jmarcos@email.com', '$2b$10$alqPZunsBHFLI31Ss379R.5EI/pLMmuE7W96yh5FMxDkA/gzcrta2', 'FAMILY', 'active', '2025-11-02 22:02:35.772', '2025-11-02 22:02:35.772', NULL);
INSERT INTO auth.users VALUES ('ff5b39ae-4ca1-462c-b924-ae5f286f979f', 'morais@familia.com', '$2b$10$wutd01UyZDZPYI0YoYMr2.D9oI8/UNGpmFNU3ZNX3r33Ft2tjfd0i', 'FAMILY', 'active', '2025-11-08 02:00:33.709', '2025-11-08 02:00:33.709', NULL);
INSERT INTO auth.users VALUES ('5bdd8939-da2d-428c-a77b-ca47f91aa056', 'joao@mail.com', '$2b$10$wRBrDDGMgLi.kXpNrVedLubwnl6VuJGyz7zEBQCkkHLbfzzurqnuq', 'FAMILY', 'active', '2025-11-20 19:44:50.417', '2025-11-20 19:44:50.417', NULL);


--
-- Data for Name: caregivers; Type: TABLE DATA; Schema: caregiver; Owner: care
--

INSERT INTO caregiver.caregivers VALUES ('b4d2b9ef-eb59-4727-a151-6c5b42af4b6c', '5fafe5de-769f-450d-a61b-59bd60a5be5c', 'COREN-SP 123456', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/caregivers/92071770-ea9f-4ad5-98f6-a2a550a2f599-52E18857-74F3-45A4-8B2E-466396F7AA71.jpeg', false, 'O melhor cuidador de idoso da região ', 'Alameda Pau-Brasil', 'Jacareí', 'SP', '12302314', '0101000020E6100000687D25EBCBF546C069CC7FA3784637C0', 0, 0, '3 anos', '20', true, true, '["Administração de medicamentos", "Alimentação assistida", "Troca de curativos simples", "Acompanhamento em atividades externas"]', NULL, '["Cuidador de Idosos", "Atendente de Enfermagem"]', NULL, '2025-11-01 23:48:27.518', '2025-11-02 00:01:11.946');
INSERT INTO caregiver.caregivers VALUES ('02e02342-738c-41cd-a2b8-5fdef897ec99', 'fc4963f5-f3ee-43b3-bb45-b14d58985151', 'CRM-MG 123456', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/caregivers/382f6642-513a-4a65-919c-3339a5d86b0a-5D0E0FDA-3ACA-44E5-A344-876870BB8211.jpeg', false, 'Estudante de medicina do primeiro periodo', 'Rua Betim', 'São José dos Campos', 'SP', '12228080', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', 4.6, 5, '1 ano', '30', true, false, '["Administração de medicamentos"]', '["Português", "Espanhol"]', '["Cuidador de Idosos", "Clínica Médica"]', '["CRM Ativo"]', '2025-10-27 23:43:39.914', '2025-11-22 21:11:06.625');


--
-- Data for Name: families; Type: TABLE DATA; Schema: family; Owner: care
--

INSERT INTO family.families VALUES ('3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', NULL, NULL, NULL, NULL, NULL, '2025-11-02 11:27:22.868024', '2025-11-02 11:27:22.868024');
INSERT INTO family.families VALUES ('91507b05-e7cf-49bb-8593-b19f6cb969a9', '91507b05-e7cf-49bb-8593-b19f6cb969a9', NULL, NULL, NULL, NULL, NULL, '2025-11-02 22:02:35.797', '2025-11-02 22:02:35.797');
INSERT INTO family.families VALUES ('ff5b39ae-4ca1-462c-b924-ae5f286f979f', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', NULL, NULL, NULL, NULL, NULL, '2025-11-08 02:00:33.729', '2025-11-08 02:00:33.729');
INSERT INTO family.families VALUES ('5bdd8939-da2d-428c-a77b-ca47f91aa056', '5bdd8939-da2d-428c-a77b-ca47f91aa056', NULL, NULL, NULL, NULL, NULL, '2025-11-20 19:44:50.506', '2025-11-20 19:44:50.506');


--
-- Data for Name: elders; Type: TABLE DATA; Schema: family; Owner: care
--

INSERT INTO family.elders VALUES ('c63d50ef-cccf-4882-adc4-02997a47da22', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', 'Jaozinho', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/elders/6d874e60-d8ea-4379-b9a4-bf1abf1cf82d-me.jpg', '1952-10-07', '["Diabetes", "Parkinson"]', '["Losartan", "Insulina"]', 'Rua Betim 1', 'São José dos Campos', 'SP', '12228080', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', '2025-10-31 23:55:16.875', '2025-10-31 23:55:16.875');
INSERT INTO family.elders VALUES ('3c6d4263-b6ee-4c79-b3ec-fa207a39c8cc', NULL, 'Meu teste', NULL, '2025-11-02', '[]', '[]', 'Rua Betim, 520', 'São José dos Campos', 'SP', NULL, NULL, '2025-11-02 14:32:09.088', '2025-11-02 14:32:09.088');
INSERT INTO family.elders VALUES ('554e2e2f-4c85-4394-9e4f-d980cc8e31c3', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', 'Teste da Silva ', NULL, '1990-11-04', '[]', '[]', 'Rua Betim', 'São José dos Campos', 'SP', '12228080', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', '2025-11-02 01:01:10.983', '2025-11-02 01:01:10.983');
INSERT INTO family.elders VALUES ('7f641c66-5990-4277-a691-8d8da7d154e1', '91507b05-e7cf-49bb-8593-b19f6cb969a9', 'Testes do studyRats', NULL, '2025-11-02', '[]', '[]', 'Rua Betim, 520', 'São José dos Campos', 'SP', '12228-080', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', '2025-11-02 22:08:52.004', '2025-11-02 22:16:12.039');
INSERT INTO family.elders VALUES ('34832ade-fd98-4ac4-a31f-cb64d07db712', '91507b05-e7cf-49bb-8593-b19f6cb969a9', 'Teste 123', NULL, '2025-11-03', '["Diabetes"]', '["Ibuprofeno", "Insulina"]', 'Rua Betim', 'São José dos Campos', 'SP', '', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', '2025-11-02 22:03:13.59', '2025-11-02 22:16:32.879');
INSERT INTO family.elders VALUES ('258b4225-dfa9-4488-a955-cdf211515b02', '91507b05-e7cf-49bb-8593-b19f6cb969a9', 'Juvenal', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/elders/79c939ca-f272-493d-ae80-f971edf0a53b-me.jpg', '1971-11-01', '["Ansiedade", "Problemas de visão"]', '["Ibuprofeno", "Donepezil"]', 'Rua Arturus 300', 'São José dos Campos', 'SP', '12230200', '0101000020E6100000E0BE0E9C33F246C01BBB44F5D63837C0', '2025-11-02 22:19:01.308', '2025-11-02 22:19:01.308');
INSERT INTO family.elders VALUES ('65c23282-0ed3-4b85-9891-dba07c1fc61b', NULL, 'Elza Rodrigues', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/elders/a085d144-9da7-4d4d-ad76-336a0dcddc3a-Elza.jpg', '1954-11-09', '["Problemas de visão", "Diabetes"]', '["Insulina"]', 'Avenida Jorge Zarur 100', 'São José dos Campos', 'SP', '12242020', '0101000020E6100000B9A5D590B8F346C0BD18CA89763537C0', '2025-11-08 02:23:46.272', '2025-11-08 02:23:46.272');
INSERT INTO family.elders VALUES ('b305b488-216a-4acc-8ab5-394316d6983e', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', 'David Marcelo', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/elders/fe288915-6f95-4d03-8b60-6d8decec9849-davi.jpg', '1950-11-08', '["Hipertensão", "Problemas cardíacos"]', '["Metformina", "Losartan"]', 'Avenida Presidente Juscelino Kubitschek de Oliveira 30', 'Sorocaba', 'SP', '18035060', '0101000020E61000006D904946CEBA47C01AA88C7F9F8137C0', '2025-11-20 15:34:04.596', '2025-11-20 15:34:04.596');
INSERT INTO family.elders VALUES ('762fd57f-1605-4819-9c46-b41106316e6c', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', 'Elza Rodrigues', 'https://devsdomainbucket.s3.us-east-2.amazonaws.com/dcare/elders/be56c41e-a358-47d9-aa16-d2b573725638-Elza.jpg', '1960-11-01', '["Osteoporose", "Parkinson"]', '[]', 'Rua Betim 23', 'São José dos Campos', 'SP', '12228080', '0101000020E61000007AC2120F28EB46C0F4893C49BA3E37C0', '2025-11-20 15:55:02.119', '2025-11-20 15:55:02.119');


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: appointments; Owner: care
--

INSERT INTO appointments.appointments VALUES ('1897840d-e45a-4d95-99a1-d5495e43cf57', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', 'c63d50ef-cccf-4882-adc4-02997a47da22', 'b4d2b9ef-eb59-4727-a151-6c5b42af4b6c', '2025-11-02 20:00:00', '2025-11-02 20:04:00', 'PENDING', false, 'APlicar insulina', 80, '2025-11-02 21:51:34.494', '2025-11-02 21:51:34.494');
INSERT INTO appointments.appointments VALUES ('b431f53e-7b83-4509-9e11-184cd2cf9735', '91507b05-e7cf-49bb-8593-b19f6cb969a9', '258b4225-dfa9-4488-a955-cdf211515b02', 'b4d2b9ef-eb59-4727-a151-6c5b42af4b6c', '2025-11-10 15:00:00', '2025-11-10 15:04:00', 'PENDING', false, 'Aplicar insulina ', 80, '2025-11-02 22:19:59.939', '2025-11-02 22:19:59.939');
INSERT INTO appointments.appointments VALUES ('7f228c12-06d8-4a66-a5a0-3a0ae01215a7', '91507b05-e7cf-49bb-8593-b19f6cb969a9', '258b4225-dfa9-4488-a955-cdf211515b02', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-06 15:00:00', '2025-11-06 15:04:00', 'CANCELLED', false, '', 120, '2025-11-06 23:30:15.571', '2025-11-20 15:29:43.756');
INSERT INTO appointments.appointments VALUES ('56cfc803-65fd-4c3b-a43f-a6337d2c4b01', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', '554e2e2f-4c85-4394-9e4f-d980cc8e31c3', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-03 13:00:00', '2025-11-03 13:04:00', 'CANCELLED', false, 'AGora com o teste da silva', 120, '2025-11-02 21:50:36.569', '2025-11-20 15:29:45.491');
INSERT INTO appointments.appointments VALUES ('db1a2b19-23b6-40d6-a01f-9f468a070e11', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', '554e2e2f-4c85-4394-9e4f-d980cc8e31c3', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-03 13:00:00', '2025-11-03 13:04:00', 'CANCELLED', false, 'AGora com o teste da silva', 120, '2025-11-02 21:50:08.217', '2025-11-20 15:29:47.234');
INSERT INTO appointments.appointments VALUES ('169777b6-ca9a-4ea1-a01e-c7a7e0805e67', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', '762fd57f-1605-4819-9c46-b41106316e6c', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-20 11:00:00', '2025-11-20 13:00:00', 'COMPLETED', false, 'Aplicar medicação.', 60, '2025-11-20 16:55:42.675', '2025-11-20 16:56:30.484');
INSERT INTO appointments.appointments VALUES ('e7978313-8c80-4133-b909-ed035e01167b', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', 'b305b488-216a-4acc-8ab5-394316d6983e', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-20 13:00:00', '2025-11-20 15:00:00', 'COMPLETED', false, 'Aplicar medicação', 60, '2025-11-20 19:10:14.857', '2025-11-20 19:11:52.306');
INSERT INTO appointments.appointments VALUES ('21c8995b-d88c-485d-bfef-79010a148601', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', 'b305b488-216a-4acc-8ab5-394316d6983e', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-20 11:00:00', '2025-11-20 15:00:00', 'COMPLETED', false, 'Passeio no parque', 120, '2025-11-20 15:45:45.058', '2025-11-20 15:45:57.275');
INSERT INTO appointments.appointments VALUES ('52b8ffe4-6211-46b1-ae50-abbebdf747ae', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', 'b305b488-216a-4acc-8ab5-394316d6983e', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-21 18:00:00', '2025-11-21 22:00:00', 'COMPLETED', false, 'Favor realizar caminhada  no parque pela manhã e passar na farmácia.
Durante a tarde, aplicar insulina e esquentar o almoço.', 120, '2025-11-20 15:42:47.058', '2025-11-22 20:01:16.875');
INSERT INTO appointments.appointments VALUES ('cc85e5a3-3353-4168-b262-9d9b688b9c9d', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', 'c63d50ef-cccf-4882-adc4-02997a47da22', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-02 13:00:00', '2025-11-02 13:04:00', 'CANCELLED', false, 'Um teste apenas rsrs', 120, '2025-11-02 21:42:15.302', '2025-11-22 20:49:10.42');
INSERT INTO appointments.appointments VALUES ('4b5f49d9-2a83-49f7-ae3b-4f1ba8dc7959', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', '762fd57f-1605-4819-9c46-b41106316e6c', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-22 15:00:00', '2025-11-22 19:00:00', 'COMPLETED', false, 'As mesmas da última consulta, obrigado ', 120, '2025-11-22 20:03:20.764', '2025-11-22 21:11:06.62');
INSERT INTO appointments.appointments VALUES ('e31022ae-db60-49ab-a368-41a3896f1f9c', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', '762fd57f-1605-4819-9c46-b41106316e6c', '02e02342-738c-41cd-a2b8-5fdef897ec99', '2025-11-23 15:00:00', '2025-11-23 17:00:00', 'ACCEPTED', false, 'Preparar almoço e medicação', 60, '2025-11-22 21:13:45.293', '2025-11-22 21:14:22.198');


--
-- Data for Name: legal_terms; Type: TABLE DATA; Schema: auth; Owner: care
--



--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: auth; Owner: care
--

INSERT INTO auth.user_profiles VALUES ('4164cc80-19c3-45cc-abb2-8689c4f16c7d', 'fc4963f5-f3ee-43b3-bb45-b14d58985151', 'Isabella Danes', '999999', NULL, NULL, '2025-10-27 23:43:39.914', '2025-10-27 23:43:39.914');
INSERT INTO auth.user_profiles VALUES ('11c2f5c2-9c04-4f3f-9ae2-8a2ac8856c21', '3218bf21-0bf7-4ad7-9fa2-be9aa2ab48f4', 'Michael A Morais', '12222222222', NULL, NULL, '2025-10-31 23:54:19.793', '2025-10-31 23:54:19.793');
INSERT INTO auth.user_profiles VALUES ('c3630a30-7c93-4188-880f-bec53cef1f16', '5fafe5de-769f-450d-a61b-59bd60a5be5c', 'Jose', '1299491132', NULL, NULL, '2025-11-01 23:48:27.518', '2025-11-01 23:48:27.518');
INSERT INTO auth.user_profiles VALUES ('bc3b6fb9-046b-4faf-a549-78cb397b1864', '91507b05-e7cf-49bb-8593-b19f6cb969a9', 'João Marcos', '12978745454', NULL, NULL, '2025-11-02 22:02:35.772', '2025-11-02 22:02:35.772');
INSERT INTO auth.user_profiles VALUES ('7d1ed7c7-c0a1-4409-b8e9-8fdd9b6c50a6', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', 'Michael', '12996791299', NULL, NULL, '2025-11-08 02:00:33.709', '2025-11-08 02:00:33.709');
INSERT INTO auth.user_profiles VALUES ('b5db2280-2ab4-45bf-96d9-95944f48c42b', '5bdd8939-da2d-428c-a77b-ca47f91aa056', 'João Marcos', '12998762514', NULL, NULL, '2025-11-20 19:44:50.417', '2025-11-20 19:44:50.417');


--
-- Data for Name: user_terms_acceptance; Type: TABLE DATA; Schema: auth; Owner: care
--



--
-- Data for Name: caregiver_documents; Type: TABLE DATA; Schema: caregiver; Owner: care
--



--
-- Data for Name: ivcf20_responses; Type: TABLE DATA; Schema: family; Owner: care
--

INSERT INTO family.ivcf20_responses VALUES ('32d77590-dfd8-4f73-8dc2-d77e4630e0c2', 'c63d50ef-cccf-4882-adc4-02997a47da22', '"{\"q1\":1,\"q2\":0,\"q4_i\":4,\"q5_i\":0,\"q6_b\":0,\"q7\":0,\"q8\":0,\"q9\":0,\"q10\":0,\"q11\":0,\"q12\":1,\"q13\":0,\"q14\":2,\"q15\":2,\"q16\":2,\"q17\":2,\"q18\":2,\"q19\":2,\"q20\":4}"', 22, 'Idoso(a) Frágil', '2025-11-11 14:15:50.171', '2025-11-11 14:15:50.171');
INSERT INTO family.ivcf20_responses VALUES ('7e4b4e2e-092d-4709-b00e-418afe1a0420', '554e2e2f-4c85-4394-9e4f-d980cc8e31c3', '"{\"q1\":0,\"q2\":0,\"q4_i\":0,\"q5_i\":0,\"q6_b\":0,\"q7\":1,\"q8\":0,\"q9\":0,\"q10\":0,\"q11\":0,\"q12\":0,\"q13\":0,\"q14\":0,\"q15\":0,\"q16\":0,\"q17\":0,\"q18\":0,\"q19\":0,\"q20\":4}"', 5, 'Idoso(a) Robusto', '2025-11-11 15:49:18.443', '2025-11-11 15:49:18.443');
INSERT INTO family.ivcf20_responses VALUES ('0b46de3b-238e-4db1-a70c-8f56d8817bc9', '762fd57f-1605-4819-9c46-b41106316e6c', '"{\"q1\":0,\"q2\":0,\"q4_i\":0,\"q5_i\":0,\"q6_b\":0,\"q7\":1,\"q8\":0,\"q9\":0,\"q10\":2,\"q11\":0,\"q12\":0,\"q13\":0,\"q14\":2,\"q15\":0,\"q16\":0,\"q17\":0,\"q18\":2,\"q19\":0,\"q20\":0}"', 7, 'Idoso(a) Potencialmente Frágil', '2025-11-20 15:56:47.932', '2025-11-20 15:56:47.932');
INSERT INTO family.ivcf20_responses VALUES ('6158762d-4576-4572-9120-a02931513737', 'b305b488-216a-4acc-8ab5-394316d6983e', '"{\"q1\":1,\"q2\":0,\"q4_i\":0,\"q5_i\":0,\"q6_b\":0,\"q7\":0,\"q8\":0,\"q9\":0,\"q10\":0,\"q11\":0,\"q12\":0,\"q13\":0,\"q14\":0,\"q15\":0,\"q16\":0,\"q17\":0,\"q18\":0,\"q19\":0,\"q20\":0}"', 1, 'Idoso(a) Robusto', '2025-11-20 18:54:20.069', '2025-11-20 18:54:20.069');


--
-- Data for Name: faq_ai_queries; Type: TABLE DATA; Schema: knowledge; Owner: care
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: care
--

INSERT INTO public._prisma_migrations VALUES ('aff22a9a-8db6-4424-b87a-b85f34569cec', '70ef3f54d7ae9133f91d3d8ad12306bdf9a935c979340c0e63cd0b57e8d24450', '2025-11-02 14:09:16.459597+00', '20251102140916_removendo_appointment_request_table', NULL, NULL, '2025-11-02 14:09:16.242697+00', 1);
INSERT INTO public._prisma_migrations VALUES ('5e13ef0d-4dd4-4391-9448-6948b66c2fa4', '443d495d0444bdde2d9990984fc61dbed8c14118f56978c3563e08f147047e49', '2025-10-27 23:18:35.47032+00', '20251027231835_extend_caregivers_availability', NULL, NULL, '2025-10-27 23:18:35.17884+00', 1);


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: care
--



--
-- Data for Name: reviews; Type: TABLE DATA; Schema: reviews; Owner: care
--

INSERT INTO reviews.reviews VALUES ('524bc7aa-34db-47df-8bc4-0c8a4105f53f', '21c8995b-d88c-485d-bfef-79010a148601', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', '02e02342-738c-41cd-a2b8-5fdef897ec99', 5, 'Muito atenciosa e simpática', '2025-11-20 15:46:38.791', '2025-11-20 15:46:38.791');
INSERT INTO reviews.reviews VALUES ('c5d32e3c-100e-4044-802e-3fb24d20730a', '169777b6-ca9a-4ea1-a01e-c7a7e0805e67', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', '02e02342-738c-41cd-a2b8-5fdef897ec99', 5, 'Excelente atendimento, rápida e atenciosa', '2025-11-20 16:56:30.48', '2025-11-20 16:56:30.48');
INSERT INTO reviews.reviews VALUES ('414c6321-2bdf-4942-abb7-9349b9b2b7ac', 'e7978313-8c80-4133-b909-ed035e01167b', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', '02e02342-738c-41cd-a2b8-5fdef897ec99', 3, 'Esqueceu do medicamento', '2025-11-20 19:11:52.302', '2025-11-20 19:11:52.302');
INSERT INTO reviews.reviews VALUES ('e65cebca-142d-4396-89a3-0b0351d8ca1a', '52b8ffe4-6211-46b1-ae50-abbebdf747ae', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', '02e02342-738c-41cd-a2b8-5fdef897ec99', 5, 'Melhor cuidadora da região ', '2025-11-22 20:01:16.868', '2025-11-22 20:01:16.868');
INSERT INTO reviews.reviews VALUES ('68923c0a-aa52-467b-b5ec-409278a6b5f6', '4b5f49d9-2a83-49f7-ae3b-4f1ba8dc7959', 'ff5b39ae-4ca1-462c-b924-ae5f286f979f', '02e02342-738c-41cd-a2b8-5fdef897ec99', 5, 'Mais uma avaliação nota 5', '2025-11-22 21:11:06.615', '2025-11-22 21:11:06.615');


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

