import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Carregar constantes
const constantsPath = join(__dirname, 'src', 'constants.ts');
let SYSTEM_INSTRUCTION = '';

try {
  const constantsContent = readFileSync(constantsPath, 'utf8');
  const match = constantsContent.match(/export const SYSTEM_INSTRUCTION = `([\s\S]*?)`;/);
  if (match) {
    SYSTEM_INSTRUCTION = match[1];
  }
} catch (error) {
  console.error('Erro ao carregar SYSTEM_INSTRUCTION:', error);
  SYSTEM_INSTRUCTION = 'Você é um assistente útil.';
}

// Rota da API de chat
app.post('/api/chat', async (req, res) => {
  try {
    const { history, message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY não está configurada");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // Converter histórico para o formato do Gemini
    const chatHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.parts[0].text }]
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessageStream(message);

    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream da resposta
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(chunkText);
      }
    }

    res.end();

  } catch (error) {
    console.error('Erro na API de chat:', error);
    
    // Tratamento específico para diferentes tipos de erro
    let statusCode = 500;
    let errorMessage = 'Erro interno do servidor';
    let userMessage = 'Desculpe, ocorreu um erro. Por favor, tente novamente.';
    
    if (error.status === 429) {
      // Quota excedida - implementar retry com backoff exponencial
      statusCode = 429;
      errorMessage = 'Quota da API excedida';
      userMessage = '**Ops!** 😅 Parece que atingimos o limite de uso da API por hoje. \n\n• **Não se preocupe** - isso é temporário!\n• **Tente novamente** em alguns minutos\n• **Seus dados** estão seguros e não foram perdidos\n\nEnquanto isso, você pode entrar em contato diretamente conosco pelo WhatsApp: **(11) 99999-9999**\n\n*Dica: Aguarde pelo menos 30 segundos antes de tentar novamente.*';
      
      // Log para monitoramento
      console.warn(`Rate limit atingido. Retry após: ${error.errorDetails?.[2]?.retryDelay || '30s'}`);
    } else if (error.message?.includes('GEMINI_API_KEY')) {
      // Problema de configuração
      errorMessage = 'Erro de configuração da API';
      userMessage = '**Erro de configuração** detectado. Por favor, entre em contato com o suporte técnico.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      // Problema de rede
      errorMessage = 'Erro de conexão';
      userMessage = '**Problema de conexão** detectado. \n\n• **Verifique sua internet**\n• **Tente novamente** em alguns segundos\n\nSe o problema persistir, entre em contato conosco!';
    }
    
    const errorDetails = error instanceof Error ? error.message : 'Erro desconhecido';
    
    if (!res.headersSent) {
      res.status(statusCode).json({ 
        error: errorMessage,
        userMessage: userMessage,
        details: errorDetails 
      });
    }
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor da API rodando em http://localhost:${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/chat`);
});