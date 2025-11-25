<h1 align="center" style="border-bottom: none; white-space: nowrap;">
  👨🏻‍⚕ D-Care 💓
</h1>

## ✎ᝰ Desafio
Este projeto tem como objetivo o desenvolvimento de uma plataforma digital completa (API, aplicação web e mobile) para conectar familiares de idosos a cuidadores de confiança. A solução foca em segurança, rapidez e impacto social, oferecendo verificação de registros profissionais (CRM, COREN), suporte educativo com IA, avaliação funcional (IVCF-20) e agendamento emergencial on-demand. A proposta é inspirada em modelos de intermediação ágil, mas com foco diferenciado em cuidado humanizado e qualidade de vida no envelhecimento.


## ╰┈➤ Entregas de Sprints

Cada entrega será realizada a partir da criação de uma **tag** conforme relação a seguir:

| Sprint | Início | Previsão de entrega | Status | Entregas | Kanban |
|:--:|:--:|:--:|:--:|:--:|:--:|
| 01 | 16/09/2025 | 06/10/2025 | ​​​​☑️ Concluído | [Entregas Sprint 1](https://github.com/DevsDomain/D-care/releases/tag/Sprint1) | [Ver Sprint 1](https://github.com/orgs/DevsDomain/projects/41/views/4) 
| 02 | 13/10/2025 | 02/11/2025 | ☑️ Concluído | [Entregas Sprint 2](https://github.com/DevsDomain/D-care/releases/tag/Sprint2) | [Ver Sprint 2](https://github.com/orgs/DevsDomain/projects/41/views/5) 
| 03 | 06/11/2025 | 24/11/2025 | ☑️ Concluído | [Entregas Sprint 3](https://github.com/DevsDomain/D-care/releases/tag/Sprint3) | [Ver Sprint 3](https://github.com/orgs/DevsDomain/projects/41/views/6) 

## ✍️ Product Backlog

O Product Backlog segue o padrão de priorização:
- *A* Alta
- *M* Média
- *B* Baixa

📌 Requisitos Funcionais 

- **US01 (M)** – Como usuário, quero me cadastrar como família ou cuidador para acessar o sistema.
- **US02 (B)** – Como usuário, quero entrar no sistema com login e senha.
- **US03 (M)** – Como família, quero registrar um idoso (dados pessoais e de saúde).
- **US04 (A)** – Como cuidador, quero editar meu perfil (dados pessoais, geolocalização, CRM/COREN, agenda).
- **US05 (B)** – Como família, quero preencher o IVCF-20 de forma digital.
- **US06 (A)** – Como cuidador, quero definir minha disponibilidade (agenda) e indicar disponibilidade para emergências.
- **US07 (A)** – Como família, quero buscar cuidadores utilizando filtros.
- **US08 (M)** – Como família, quero visualizar o perfil do cuidador.
- **US09 (A)** – Como família, quero agendar um cuidador em uma data e horário específicos.
- **US10 (B)** – Como cuidador, quero aceitar ou recusar solicitações de agendamento.
- **US11 (B)** – Como família, quero avaliar o cuidador após o atendimento.
- **US12 (B)** – Como família, quero visualizar os idosos cadastrados.
- **US13 (A)** – Como usuário, quero consultar uma cartilha com apoio de IA.
- **US14 (B)** – Como usuário, quero aceitar os termos de uso e o consentimento LGPD.
- **US15 (M)** – Como sistema, preciso validar o CRM/COREN de cuidadores.
- **US16 (M)** – Como família, quero editar os dados dos idosos cadastrados.
- **US17 (M)** – Como família, quero visualizar meus agendamentos (futuros e passados).

⚙️ Requisitos Não Funcionais

- Protótipo (Figma)
- Banco de Dados
- Arquitetura do Sistema
- Configuração Docker
- GitHub

# 📋 Requisitos Funcionais (User Stories Refinadas)

## 👤 Usuário / Sistema
| ID   | User Story                                                                 | Complexidade | Criticidade | Valor Agregado | Status  |
| ---- | -------------------------------------------------------------------------- | :----------: |:----------: | :------: | :----------: |
| US01 | Como usuário, quero me cadastrar como família/cuidador para acessar o sistema | Média        | 7            | 5              | Done |
| US02 | Como usuário, quero entrar no sistema com login/senha                        | Baixa        | 7            | 5               | Done |
| US13 | Como usuário, quero consultar uma cartilha com IA                            | Alta         | 10           | 10              | Done |
| US14 | Como usuário, quero aceitar termos de uso e consentimento LGPD               | Baixa        | 2            | 2               | To Do |
| US15 | Como sistema, preciso validar CRM/COREN de cuidadores                        | Média        | 4            | 7               | Done |

---

## 🧑‍⚕️ Cuidador
| ID   | User Story                                                                 | Complexidade | Criticidade | Valor Agregado | Status       |
| ---- | -------------------------------------------------------------------------- | :----------: |:----------: | :------: | :----------: |
| US04 | Como cuidador, quero editar meu perfil (dados, geolocalização, CRM/COREN, agenda) | Alta        | 8            | 8          | Done         |
| US06 | Como cuidador, quero definir disponibilidade (agenda) e emergências          | Alta        | 7            | 7               | Done         |
| US10 | Como cuidador, quero aceitar/recusar solicitações de agendamento             | Baixa       | 7            | 8               | Done         |

---

## 👨‍👩‍👧 Família
| ID   | User Story                                                                 | Complexidade | Criticidade | Valor Agregado | Status       |
| ---- | -------------------------------------------------------------------------- | :----------: |:----------: | :------: | :----------: |
| US03 | Como família, quero registrar um idoso (dados pessoais/saúde)                | Média        | 7            | 7               | Done         |
| US05 | Como família, quero preencher o IVCF-20 digital                              | Baixa        | 4            | 4               | Done         |
| US07 | Como família, quero buscar cuidadores com filtros                            | Alta         | 7            | 8               | Done         |
| US08 | Como família, quero visualizar perfil do cuidador                            | Média        | 7            | 6               | Done         |
| US09 | Como família, quero agendar um cuidador em data/hora                         | Alta         | 6            | 9               | Done         |
| US11 | Como família, quero avaliar o cuidador após atendimento                      | Baixa        | 4            | 5               | Done         |
| US12 | Como família, quero visualizar idosos cadastrados                            | Baixa        | 6            | 7               | Done         |
| US16 | Como família, quero editar dados de idosos cadastrados                       | Média        | 6            | 7               | Done         |
| US17 | Como família, quero visualizar meus agendamentos (futuros e passados)        | Média        | 7            | 8               | Done         |


---

## *📌 3. Priorização das Histórias de Usuário*

| Prioridade    | Histórias de Usuário                          |
| ------------- | --------------------------------------------- |
| *A (Alta)*    | US04, US06, US07, US09, US13 |
| *M (Média)*   | US01, US03, US08, US15, US16, US17 |
| *B (Baixa)*   | US02, US05, US10, US11, US12, US14                                           |

## 👾⋆˚ Tecnologias utilizadas ˖°👾

#### Backend
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Jest](https://img.shields.io/badge/Jest-blue?style=for-the-badge&logo=jest&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-%2300B2A0.svg?style=for-the-badge&logo=swagger&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

#### Frontend
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Jest](https://img.shields.io/badge/Jest-blue?style=for-the-badge&logo=jest&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

#### IA/Deep Learning
![Python](https://img.shields.io/badge/Python-%2337769E.svg?style=for-the-badge&logo=python&logoColor=white)

<span id="equipe">

## Equipe 𐦂𖨆𐀪𖠋:

|    Função       | Nome             | LinkedIn & GitHub |
| :-------------: | :--------------- | :---------------- |
| Product Owner   | Michael Morais   | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/michael-morais22/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/itsmorais) |
| Scrum Master    | Juliana Maciel   | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/juliana-maciel-manso) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/Jummanso) |
| Dev Team        | Abner Rodrigo    | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/abnercosta97) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/abnercosta97) |
| Dev Team        | Fernando Davi    | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/fernando-davi-492842276) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/fnddavi) |
