<h1 align="center" style="border-bottom: none; white-space: nowrap;">
  👨🏻‍⚕ D-Care 💓
</h1>

## ✎ᝰ Desafio
Este projeto tem como objetivo o desenvolvimento de uma plataforma digital completa (API, aplicação web e mobile) para conectar familiares de idosos a cuidadores de confiança. A solução foca em segurança, rapidez e impacto social, oferecendo verificação de registros profissionais (CRM, COREN), suporte educativo com IA, avaliação funcional (IVCF-20) e agendamento emergencial on-demand. A proposta é inspirada em modelos de intermediação ágil, mas com foco diferenciado em cuidado humanizado e qualidade de vida no envelhecimento.


## ╰┈➤ Entregas de Sprints

Cada entrega será realizada a partir da criação de uma **tag** conforme relação a seguir:

| Sprint | Início | Previsão de entrega | Status | Release | Kanban | BurnDown |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 01 | 16/09/2025 | 06/10/2025 | ​​​​☑️ Concluído | [Ver release 1](https://github.com/DevsDomain/D-care/releases/tag/Sprint1) | [Ver Sprint 1](https://github.com/orgs/DevsDomain/projects/41/views/4) | [Ver BurnDown 1](https://private-user-images.githubusercontent.com/126696706/498062319-be351a9f-1055-462e-aa08-881a9113c934.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjA2NTk4MTEsIm5iZiI6MTc2MDY1OTUxMSwicGF0aCI6Ii8xMjY2OTY3MDYvNDk4MDYyMzE5LWJlMzUxYTlmLTEwNTUtNDYyZS1hYTA4LTg4MWE5MTEzYzkzNC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMDE3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTAxN1QwMDA1MTFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00OTIyNmJjOWIyOTFiNzQxNTY4ZmQ1YjRmN2JjNDc4ODVlNzVlMWZjOWM2NjQyOGY2YTQ2OWQxNzFlNjhkYWU0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.4n_FUZLGY3eBigkINJwM_PAU5qP7sX2-wp6TaIjDKSc) |
| 02 | 13/10/2025 | 02/11/2025 | ⏳ Em andamento | [Ver release 2](https://github.com/DevsDomain/D-care/releases/tag/Sprint2) | [Ver Sprint 2](https://github.com/orgs/DevsDomain/projects/41/views/5) | Ver BurnDown 2 |
| 03 | 06/11/2025 | 23/11/2025 | 🚧 A iniciar | Ver release 3 | Ver Sprint 3 | Ver BurnDown 3 |

## ✍️ Product Backlog
O Product Backlog segue o padrão de priorização:
- *A* Alta
- *M* Média
- *B* Baixa


# 📋 Requisitos Funcionais (User Stories Refinadas)

## 👤 Usuário / Sistema
| ID   | User Story                                                                 | Complexidade | Criticidade | Valor Agregado | Status       |
| ---- | -------------------------------------------------------------------------- | ------------- | ------------ | --------------- | ------------ |
| US01 | Como usuário, quero me cadastrar como família/cuidador para acessar o sistema | Média        | 7            | 5              | Done  |
| US02 | Como usuário, quero entrar no sistema com login/senha                        | Baixa        | 7            | 5               | Done  |
| US13 | Como usuário, quero consultar uma cartilha com IA                            | Alta         | 10           | 10              | In Progress  |
| US14 | Como usuário, quero aceitar termos de uso e consentimento LGPD               | Baixa        | 2            | 2               | In Progress  |
| US15 | Como sistema, preciso validar CRM/COREN de cuidadores                        | Média        | 4            | 7               | To Do  |

---

## 🧑‍⚕️ Cuidador
| ID   | User Story                                                                 | Complexidade | Criticidade | Valor Agregado | Status       |
| ---- | -------------------------------------------------------------------------- | ------------- | ------------ | --------------- | ------------ |
| US04 | Como cuidador, quero editar meu perfil (dados, geolocalização, CRM/COREN, agenda) | Alta        | 8            | 8          | In Progress   |
| US06 | Como cuidador, quero definir disponibilidade (agenda) e emergências          | Alta        | 7            | 7               | To Do        |
| US10 | Como cuidador, quero aceitar/recusar solicitações de agendamento             | Baixa       | 7            | 8               | To Do        |

---

## 👨‍👩‍👧 Família
| ID   | User Story                                                                 | Complexidade | Criticidade | Valor Agregado | Status       |
| ---- | -------------------------------------------------------------------------- | ------------- | ------------ | --------------- | ------------ |
| US03 | Como família, quero registrar um idoso (dados pessoais/saúde)                | Média        | 7            | 7               | Done         |
| US05 | Como família, quero preencher o IVCF-20 digital                              | Baixa        | 4            | 4               | In Progress  |
| US07 | Como família, quero buscar cuidadores com filtros                            | Alta         | 7            | 8               | In Progress  |
| US08 | Como família, quero visualizar perfil do cuidador                            | Média        | 7            | 6               | In Progress  |
| US09 | Como família, quero agendar um cuidador em data/hora                         | Alta         | 6            | 9               | To Do        |
| US11 | Como família, quero avaliar o cuidador após atendimento                      | Baixa        | 4            | 5               | To Do        |
| US12 | Como família, quero visualizar idosos cadastrados                            | Baixa        | 6            | 7               | To Do        |
| US16 | Como família, quero editar dados de idosos cadastrados                       | Média        | 6            | 7               | In Progress  |
| US17 | Como família, quero visualizar meus agendamentos (futuros e passados)        | Média        | 7            | 8               | To Do        |


### 2. Requisitos Não Funcionais

- **Protótipo (Figma)** – Wireframes e protótipos navegáveis
- **Banco de Dados** – Modelagem e implementação
- **Arquitetura do Sistema** – Definição de camadas, APIs e serviços
- **Configuração Docker** – Containers para backend, frontend e banco
- **GitHub** – Organização com board, cards e versionamento


---

## *📌 3. Priorização das Histórias de Usuário*

| Prioridade    | Histórias de Usuário                          |
| ------------- | --------------------------------------------- |
| *A (Alta)*    | US01, US02, US03, US04, US06, US07, US09, US13, US17 |
| *M (Média)*   | US05, US08, US10, US11, US12, US15, US16       |
| *B (Baixa)*   | US14                                           |

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




