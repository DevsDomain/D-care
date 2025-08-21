<h1 align="center">👨🏻‍⚕D-Care💓</h1>

## :memo: Desafio
Este projeto tem como objetivo o desenvolvimento de uma plataforma digital completa (API, aplicação web e mobile) para conectar familiares de idosos a cuidadores de confiança. A solução foca em segurança, rapidez e impacto social, oferecendo verificação de registros profissionais (CRM, COREN), suporte educativo com IA, avaliação funcional (IVCF-20) e agendamento emergencial on-demand. A proposta é inspirada em modelos de intermediação ágil, mas com foco diferenciado em cuidado humanizado e qualidade de vida no envelhecimento.
 

## 📋 Product Backlog
O Product Backlog segue o padrão de priorização:
- *A* Alta
- *M* Média
- *B* Baixa

---
# 📌 Backlog e Requisitos do Projeto

## 1. Requisitos Funcionais

| ID   | User Story                                                                 | Complexidade | Criticidade | Valor Agregado | Status |
| ---- | -------------------------------------------------------------------------- | ------------- | ------------ | --------------- | ------ |
| US01 | Como usuário, quero me cadastrar como família/cuidador para acessar o sistema | Média        | 5            | 5               | To Do  |
| US02 | Como usuário, quero entrar no sistema com login/senha                        | Baixa        | 5            | 5               | To Do  |
| US03 | Como família, quero registrar o idoso (dados pessoais/saúde)                | Média        | 5            | 4               | To Do  |
| US04 | Como cuidador, quero editar meu perfil (dados, CRM/COREN, agenda)           | Média        | 4            | 5               | To Do  |
| US05 | Como família, quero preencher o IVCF-20 digital                             | Média        | 4            | 4               | To Do  |
| US06 | Como cuidador, quero definir disponibilidade e emergências                  | Média        | 5            | 5               | To Do  |
| US07 | Como família, quero buscar cuidadores com filtros                           | Alta         | 5            | 5               | To Do  |
| US08 | Como família, quero visualizar perfil do cuidador                           | Média        | 4            | 5               | To Do  |
| US09 | Como família, quero agendar um cuidador em data/hora                        | Alta         | 5            | 5               | To Do  |
| US10 | Como cuidador, quero aceitar/recusar solicitações de agendamento            | Média        | 4            | 5               | To Do  |
| US11 | Como família, quero avaliar o cuidador após atendimento                     | Média        | 4            | 5               | To Do  |
| US12 | Como usuário, quero visualizar avaliações dos cuidadores                    | Baixa        | 3            | 4               | To Do  |
| US13 | Como usuário, quero consultar uma cartilha com IA                           | Alta         | 4            | 5               | To Do  |
| US14 | Como usuário, quero aceitar termos de uso e consentimento LGPD              | Baixa        | 5            | 4               | To Do  |
| US15 | Como sistema, preciso validar CRM/COREN de cuidadores                       | Média        | 4            | 4               | To Do  |

---

## 2. Requisitos Não Funcionais

- **Protótipo (Figma)** – Wireframes e protótipos navegáveis
- **Banco de Dados** – Modelagem e implementação
- **Arquitetura do Sistema** – Definição de camadas, APIs e serviços
- **Configuração Docker** – Containers para backend, frontend e banco
- **GitHub** – Organização com board, cards e versionamento

---

## 3. Priorização das Histórias de Usuário

| Prioridade    | Histórias de Usuário                          |
| ------------- | --------------------------------------------- |
| *A (Alta)*    | US01, US02, US03, US04, US05, US06, US07, US09 |
| *M (Média)*   | US08, US10, US11, US13, US15                   |
| *B (Baixa)*   | US12, US14                                    |
---

## 🔧 Tecnologias utilizadas

#### Backend
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Jest](https://img.shields.io/badge/Jest-blue?style=for-the-badge&logo=jest&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-%2300B2A0.svg?style=for-the-badge&logo=swagger&logoColor=white)

#### Frontend
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Jest](https://img.shields.io/badge/Jest-blue?style=for-the-badge&logo=jest&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

#### IA/Deep Learning
![Python](https://img.shields.io/badge/Python-%2337769E.svg?style=for-the-badge&logo=python&logoColor=white)

<span id="equipe">

## :busts_in_silhouette: Equipe

|    Função       | Nome             | LinkedIn & GitHub |
| :-------------: | :--------------- | :---------------- |
| Product Owner   | Michael Morais   | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/michael-morais22/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/itsmorais) |
| Scrum Master    | Juliana Maciel   | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/juliana-maciel-manso) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/Jummanso) |
| Dev Team        | Claudia Nunes    | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/claudia-nuness) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/Claudia-Nunes) |
| Dev Team        | Fernando Davi    | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/fernando-davi-492842276) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/fnddavi) |
| Dev Team        | Abner Rodrigo    | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/abnercosta97) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/abnercosta97) |



