# 📸 Gasto na Foto

O **Gasto na Foto** é uma aplicação web educacional da **SpaceD**, criada a partir da evolução prática de um exercício de estudo sobre programação e Inteligência Artificial.

O usuário seleciona uma imagem de comprovante, o backend processa essa imagem temporariamente com o Google Gemini e devolve dados estruturados. O resultado alimenta uma experiência local de organização e consulta de despesas.

Esta é uma V1 educacional. Ela não deve ser apresentada como um SaaS pronto para produção.

## Principais recursos

- Upload de comprovantes nos formatos JPEG, PNG e WEBP;
- limite de 5 MB por imagem;
- backend em Node.js;
- análise de imagem com Google Gemini;
- resposta estruturada com estabelecimento, data, valor total e moeda;
- normalização da resposta antes do envio ao frontend;
- dashboard com Total gasto, Comprovantes e Média;
- persistência dos registros no `localStorage` do navegador;
- visualização das últimas análises;
- histórico completo;
- exclusão individual de registros;
- limpeza completa do histórico mediante confirmação;
- cinco comprovantes fictícios da SpaceD para demonstração;
- visualização ampliada e download das amostras.

## Arquitetura e fluxo

```text
Usuário
   ↓
Frontend
   ↓
POST + FormData
   ↓
Backend Node.js
   ↓
Gemini API
   ↓
Resposta estruturada
   ↓
Backend normaliza
   ↓
Frontend
   ↓
localStorage
   ↓
Dashboard + Histórico
```

O frontend é responsável pela interação com o usuário, pela apresentação dos resultados e pela persistência local dos registros. O backend recebe a imagem em memória, aplica as validações e coordena a análise com o Gemini.

A variável `GEMINI_API_KEY` é carregada exclusivamente no backend. Ela não é enviada ao navegador, não deve ser colocada no código-fonte e não deve ser adicionada a arquivos versionados.

## Privacidade e limitações da V1

- As imagens enviadas não são persistidas pela aplicação;
- a imagem fica em memória somente durante o fluxo necessário para análise;
- os dados extraídos são armazenados localmente no navegador;
- não existe conta de usuário nesta V1;
- não existe banco de dados;
- os registros não são sincronizados entre dispositivos ou navegadores;
- limpar os dados do navegador pode remover todo o histórico local;
- as cinco amostras da SpaceD são totalmente fictícias e destinadas exclusivamente a testes e demonstração.

Antes de utilizar comprovantes próprios, considere que a imagem será enviada à API do Google Gemini para processamento.

## Tecnologias utilizadas

- HTML5;
- CSS3;
- JavaScript;
- Node.js;
- Google Gemini API;
- Web Storage API (`localStorage`);
- REST/HTTP;
- `FormData` e `multipart/form-data`.

O projeto não utiliza framework frontend, banco de dados ou biblioteca de componentes nesta V1.

## Execução local

### Pré-requisitos

- Node.js instalado;
- uma chave própria para acesso à Gemini API.

### 1. Obtenha o projeto

Depois que o repositório estiver disponível, clone-o ou faça o download dos arquivos. Entre na pasta principal da aplicação, onde está o `package.json`.

### 2. Configure o ambiente

Use o arquivo `.env.example` como referência e crie localmente um arquivo `.env`:

```env
PORT=3000
GEMINI_API_KEY=sua_chave_aqui
```

Cada desenvolvedor deve utilizar sua própria chave. Nunca publique ou envie o arquivo `.env` ao repositório.

### 3. Instale e execute

```bash
npm install
npm start
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

## Comprovantes de demonstração

O projeto inclui cinco comprovantes fictícios oficiais:

- Mercado SpaceD;
- Padaria SpaceD;
- Posto SpaceD;
- Farmácia SpaceD;
- Café SpaceD.

Eles podem ser visualizados e baixados diretamente na área **Comprovantes para teste**. As amostras não contêm informações pessoais reais.

## 🛰️ SpaceD Operations Center

Este projeto foi desenvolvido por meio da colaboração entre um desenvolvedor humano e agentes de Inteligência Artificial.

### 🧑🏽‍💻 Ojed — Humano

**Desenvolvedor Full Stack Júnior · Criador da SpaceD**

Responsável pela direção do projeto, decisões de produto, aprendizado, testes, validação e evolução da aplicação.

### 👨🏽‍🏫 Professor — IA

**Engenharia e Arquitetura de Software · Papel Full Stack Sênior**

Responsável pelo planejamento arquitetural, divisão das missões, decisões técnicas, revisão e orientação do desenvolvimento.

### 🤖 T.I. — IA

**Engenharia de Implementação · Papel Full Stack Sênior**

Responsável pela execução das missões de desenvolvimento, implementação, testes técnicos e relatórios de validação.

Professor e T.I. são agentes de Inteligência Artificial. A expressão **Full Stack Sênior** descreve o papel exercido por cada agente dentro do processo deste projeto; não significa que sejam profissionais humanos empregados ou portadores de experiência profissional real.

A Inteligência Artificial foi utilizada como ferramenta de engenharia e colaboração durante o desenvolvimento, com decisões, testes e validações conduzidos dentro de um processo supervisionado pelo desenvolvedor humano.

## Método de trabalho

```text
Ojed
Produto · decisões · aprendizado · validação
      ↓
Professor
Arquitetura · planejamento · revisão
      ↓
T.I.
Implementação · testes · relatório
      ↓
Ojed + Professor
Validação
      ↓
Próxima missão
```

O desenvolvimento foi dividido em missões incrementais. Cada missão estabeleceu um escopo limitado, passou por implementação e testes e aguardou validação antes do início da etapa seguinte. Esse método permitiu aprender, revisar decisões e evoluir a arquitetura sem tentar construir toda a aplicação de uma única vez.

## Estrutura resumida do projeto

```text
projetocurso/
├── assets/
│   └── samples/                 # Comprovantes fictícios
├── backend/
│   ├── routes/                  # Rotas HTTP
│   ├── services/                # Integração com Gemini
│   ├── utils/                   # Processamento multipart
│   └── server.js                # Servidor e arquivos estáticos
├── components/                  # Componentes da interface
├── scripts/
│   ├── api.js                   # Comunicação frontend/backend
│   ├── navigation.js            # Navegação entre áreas
│   └── storage.js               # Persistência local centralizada
├── styles/                      # Estilos da aplicação
├── .env.example                 # Exemplo das variáveis necessárias
├── inde.html                    # Entrada da interface
├── package.json
└── README.md
```

## Evolução futura

Possíveis evoluções incluem persistência no servidor, banco de dados, autenticação e uma arquitetura multiusuário. Esses recursos poderão servir de base para uma futura aplicação ou SaaS, mas **não estão implementados na V1 atual**.

## Natureza do projeto

O Gasto na Foto é um projeto educacional da SpaceD. Seu objetivo é registrar o aprendizado prático de desenvolvimento web, integração com Inteligência Artificial, separação de responsabilidades e evolução incremental de software.
