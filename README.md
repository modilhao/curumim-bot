# 🤖 Agência OCA - Assistente Pro (Curumim)

Um assistente de IA especializado para a agência OCA, desenvolvido com React, TypeScript e integração com Google Gemini AI.

## 🚀 Funcionalidades

- **Chat Inteligente**: Conversas em tempo real com IA especializada em marketing digital
- **Interface Moderna**: Design responsivo e intuitivo
- **Coleta de Leads**: Integração automática com Formspree
- **Streaming de Respostas**: Experiência fluida com respostas em tempo real
- **Tratamento de Erros**: Sistema robusto de tratamento de erros e rate limiting

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Streaming API** para respostas em tempo real

### Backend
- **Node.js** com Express
- **Google Gemini AI** para processamento de linguagem natural
- **Formspree** para coleta de leads
- **CORS** e middleware de segurança

## 📋 Pré-requisitos

- Node.js 18+ 
- NPM ou Yarn
- Chave da API do Google Gemini
- Conta no Formspree (opcional)

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd agencia-oca---assistente-pro
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
GEMINI_API_KEY=sua_chave_da_api_gemini_aqui
NODE_ENV=development
PORT=3001
FRONTEND_PORT=3000
FORMSPREE_ENDPOINT=https://formspree.io/f/seu_form_id_aqui
```

### 4. Obtenha a chave da API do Gemini
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova chave de API
3. Adicione a chave no arquivo `.env`

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
# Executar frontend e backend simultaneamente
npm run dev:full

# Ou executar separadamente:
# Frontend (porta 3000)
npm run dev

# Backend (porta 3001)
npm run dev:server
```

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 🌐 Deploy no Vercel

### 1. Preparação
O projeto já está configurado para deploy no Vercel com:
- `vercel.json` configurado
- Script `vercel-build` no package.json
- Variáveis de ambiente mapeadas

### 2. Deploy via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 3. Deploy via GitHub
1. Conecte seu repositório ao Vercel
2. Configure a variável de ambiente `GEMINI_API_KEY` no dashboard do Vercel
3. O deploy será automático a cada push

### 4. Configuração de Variáveis no Vercel
No dashboard do Vercel, adicione:
- `GEMINI_API_KEY`: Sua chave da API do Gemini

## 📁 Estrutura do Projeto

```
agencia-oca---assistente-pro/
├── api/                    # Serverless functions (Vercel)
│   └── chat.ts            # Endpoint da API de chat
├── src/
│   ├── components/        # Componentes React
│   │   ├── ChatInput.tsx
│   │   ├── ChatWindow.tsx
│   │   └── MessageItem.tsx
│   ├── services/          # Serviços e APIs
│   │   └── geminiService.ts
│   ├── constants.ts       # Constantes e configurações
│   ├── types.ts          # Definições de tipos TypeScript
│   └── App.tsx           # Componente principal
├── server.js             # Servidor Express (desenvolvimento)
├── vercel.json           # Configuração do Vercel
├── .env.example          # Exemplo de variáveis de ambiente
└── README.md
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (frontend)
- `npm run dev:server` - Inicia o servidor Express (backend)
- `npm run dev:full` - Inicia frontend e backend simultaneamente
- `npm run build` - Gera build de produção
- `npm run preview` - Preview da build de produção
- `npm run vercel-build` - Build específico para Vercel

## 🛡️ Segurança

- Variáveis de ambiente para chaves sensíveis
- CORS configurado adequadamente
- Rate limiting implementado
- Tratamento robusto de erros
- Sanitização de dados de entrada

## 📊 Monitoramento

O sistema inclui:
- Logs detalhados de erros
- Tratamento específico para rate limiting (429)
- Mensagens de erro amigáveis para usuários
- Retry automático com backoff exponencial

## 🐛 Solução de Problemas

### Erro 429 (Rate Limit)
- Aguarde 30 segundos antes de tentar novamente
- Verifique se não há múltiplas instâncias fazendo requisições
- Considere implementar cache local para reduzir chamadas

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Confirme se o arquivo `constants.ts` existe
- Execute `npm run build` para verificar erros de TypeScript

### Problemas de CORS
- Verifique se o servidor backend está rodando na porta correta
- Confirme a configuração de proxy no `vite.config.ts`

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da Agência OCA. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico, entre em contato:
- **Website**: [ocacomunica.com.br](https://ocacomunica.com.br)
- **WhatsApp**: (11) 99999-9999

---

**Desenvolvido com ❤️ pela Agência OCA**
