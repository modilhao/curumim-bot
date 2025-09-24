# Documentação: Curumim - Assistente de IA para Agência OCA

## 1. Visão Geral

**Curumim** é o assistente de IA especialista da **agencia OCA**, projetado para ser o primeiro ponto de contato para visitantes do site. Ele atua como um consultor de marketing digital, com o objetivo de entender as necessidades dos usuários, qualificá-los como potenciais clientes e direcioná-los para uma conversa estratégica com a equipe da agência.

Sua personalidade é prestativa, profissional e empática, garantindo uma experiência de usuário positiva e alinhada com a marca OCA.

### Objetivos Principais
1.  **Responder Dúvidas:** Esclarecer perguntas sobre os serviços e soluções da agência.
2.  **Qualificar Leads:** Coletar informações essenciais para identificar se o visitante tem perfil de cliente.
3.  **Agendar Reuniões:** Facilitar o agendamento de chamadas estratégicas para leads qualificados.

---

## 2. Funcionalidades e Experiência do Usuário

-   **Conversa Inteligente e Contextual:** Utiliza o modelo `gemini-2.5-flash` do Google para diálogos fluidos e naturais, mantendo o contexto da conversa.
-   **Fluxo de Qualificação Estratégico:** Segue um roteiro definido para coletar, de forma orgânica, dados como nome, e-mail, empresa, e desafios de negócio do usuário.
-   **Respostas em Tempo Real (Streaming):** As respostas do assistente são exibidas palavra por palavra, melhorando a dinâmica da interação e a percepção de velocidade.
-   **Interface Intuitiva:**
    -   **Sugestões Iniciais (Icebreakers):** Facilita o início da conversa com botões de perguntas comuns.
    -   **Indicador de "Digitando":** Mostra uma animação enquanto a resposta está sendo processada, informando ao usuário que a IA está "pensando".
    -   **Formatação Rica:** Usa negrito e listas para destacar informações importantes e melhorar a legibilidade.
-   **Ação de Agendamento Condicional:** O botão para agendar uma reunião só é exibido após o lead ser completamente qualificado, garantindo que apenas os contatos mais promissores avancem no funil.

---

## 3. Arquitetura e Tecnologias

O projeto é uma aplicação web moderna que executa a lógica de IA diretamente no navegador do cliente (client-side), simplificando a arquitetura.

-   **Frontend:**
    -   **React & TypeScript:** Para uma interface de usuário robusta, escalável e com tipagem segura.
    -   **Tailwind CSS:** Para estilização rápida, responsiva e consistente com a identidade visual da OCA.

-   **Inteligência Artificial:**
    -   **Google Gemini API:** O cérebro do chatbot, responsável por gerar as respostas. O modelo utilizado é o `gemini-2.5-flash`.
    -   **`@google/genai` SDK:** Biblioteca oficial do Google para interagir com a API Gemini diretamente do frontend.

### Fluxo de Funcionamento
1.  **Inicialização:** O chat é carregado com uma mensagem de boas-vindas e sugestões de tópicos.
2.  **Interação do Usuário:** O usuário envia uma mensagem ou clica em uma sugestão.
3.  **Chamada à API:** O componente `ChatWindow.tsx` constrói o histórico da conversa e faz uma chamada direta para a API do Google Gemini usando o SDK. A chave de API é gerenciada por meio de variáveis de ambiente.
4.  **Processamento da IA:** O `SYSTEM_INSTRUCTION` (localizado em `constants.ts`) guia o modelo Gemini, definindo sua persona, regras e fluxo de qualificação.
5.  **Resposta em Streaming:** A resposta da API é recebida em tempo real (streaming) e exibida na interface.
6.  **Gatilhos de Ação:** O frontend analisa a resposta em busca de tags especiais:
    -   `[LEAD_DATA_JSON]...[/LEAD_DATA_JSON]`: Extrai os dados do lead e os envia para o serviço de formulários.
    -   `[ACTION_SCHEDULE]`: Exibe o botão de agendamento.
    -   `[BUTTON: Texto]`: Cria botões de resposta rápida.

---

## 4. Integrações

-   **Formspree:** Utilizado como um endpoint simples e eficaz para capturar os dados dos leads qualificados. Quando a IA coleta todas as informações necessárias, ela as formata em JSON e o frontend as envia para um formulário Formspree, que por sua vez notifica a equipe da OCA por e-mail.

---

## 5. Próximos Passos e Melhorias Possíveis

O projeto possui uma base sólida que pode ser expandida com funcionalidades ainda mais avançadas para otimizar o processo comercial da agência.

-   **1. Integração Direta com Google Calendar:**
    -   **Objetivo:** Substituir o link estático do Calendly por uma experiência de agendamento totalmente integrada.
    -   **Como:** Desenvolver um backend seguro (ex: usando Cloud Functions) que se conecte à API do Google Calendar. O chatbot poderia perguntar "Qual o melhor dia e horário para você?" e, com base na disponibilidade real da equipe, agendar a reunião diretamente no calendário, enviando o convite para o lead.

-   **2. Integração com CRM (HubSpot, Pipedrive, etc.):**
    -   **Objetivo:** Automatizar a criação de contatos e negócios no CRM da agência.
    -   **Como:** Configurar um webhook no Formspree ou desenvolver um backend que, ao receber os dados de um lead qualificado, utilize a API do CRM para criar um novo contato e iniciar um novo negócio no funil de vendas, atribuindo-o a um vendedor.

-   **3. Persistência de Conversa:**
    -   **Objetivo:** Permitir que os usuários retomem suas conversas de onde pararam, mesmo que fechem e reabram o site.
    -   **Como:** Utilizar o `localStorage` do navegador para salvar o histórico de mensagens. Ao carregar o chat, o sistema verificaria se existe um histórico salvo e o restauraria.

-   **4. Análise de Conversas e Métricas:**
    -   **Objetivo:** Obter insights sobre o desempenho do chatbot e as principais dúvidas dos clientes.
    -   **Como:** Integrar uma ferramenta de analytics (como Google Analytics ou uma solução customizada) para rastrear eventos como: início de conversa, taxa de qualificação, perguntas mais frequentes e pontos de abandono. Esses dados seriam valiosos para refinar o `SYSTEM_INSTRUCTION` e melhorar a eficácia do bot.

-   **5. Suporte a Interações por Voz:**
    -   **Objetivo:** Aumentar a acessibilidade e oferecer uma forma de interação mais moderna.
    -   **Como:** Implementar as APIs de Web Speech do navegador para funcionalidades de "Speech-to-Text" (transcrever a fala do usuário em texto) e "Text-to-Speech" (ler as respostas do bot em voz alta).

---
*Documentação gerada para a **agencia OCA**.*
