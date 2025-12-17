import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Safely access the API KEY defined in vite.config.ts
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const API_KEY = getApiKey();

// Initialize GenAI safely
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Chat Model Instance
let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 1000,
      },
    });
  }
  return chatSession;
};

export const sendMessageToAgent = async (
  text: string, 
  attachment?: { data: string; mimeType: string }
): Promise<string> => {
  if (!API_KEY) {
    return "Atenção: API_KEY não configurada no Vercel. Vá em Settings > Environment Variables e adicione a API_KEY.";
  }

  try {
    const chat = getChatSession();
    
    let messageContent: any;

    if (attachment) {
      const cleanData = attachment.data.split(',')[1] || attachment.data;
      
      messageContent = {
        parts: [
          {
            inlineData: {
              mimeType: attachment.mimeType,
              data: cleanData
            }
          },
          {
            text: text || " "
          }
        ]
      };
    } else {
      messageContent = text;
    }

    const result = await chat.sendMessage({ message: messageContent });
    return result.text || "Desculpe, a Nath não conseguiu processar sua solicitação agora.";
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    if (error?.message?.includes('API_KEY')) {
        return "Erro de autenticação: Verifique se sua chave de API do Gemini é válida.";
    }
    return "Erro de conexão com a Nath. Tente novamente em instantes.";
  }
};

export interface Prospect {
  companyName: string;
  address: string;
  recommendedProduct: string;
}

export interface SearchResult {
  text: string;
  prospects: Prospect[];
  groundingLinks?: { title: string, uri: string }[];
}

export const searchProspects = async (niche: string, location: string): Promise<SearchResult> => {
  if (!API_KEY) {
    return { text: "API_KEY ausente nas configurações do servidor.", prospects: [] };
  }

  try {
    const prompt = `Find 5 businesses in the niche "${niche}" in or near "${location}".
    
    CRITICAL OUTPUT FORMAT:
    1. First, provide a very brief summary text in Portuguese.
    2. Then, provide a Markdown Code Block containing a JSON array of the results. 
    
    The JSON array must follow this structure exactly:
    [
      {
        "companyName": "Name of Company",
        "address": "Full Address",
        "recommendedProduct": "One specific Lamitex product suitable for them"
      }
    ]

    Use the Google Maps tool to find real data.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: -23.5505,
              longitude: -46.6333
            }
          }
        }
      }
    });

    const text = response.text || "";
    
    let prospects: Prospect[] = [];
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        prospects = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse prospect JSON", e);
      }
    }

    const groundingLinks: { title: string, uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          groundingLinks.push({
            title: chunk.maps.title || 'Ver no Maps',
            uri: chunk.maps.uri
          });
        }
      });
    }

    return { text, prospects, groundingLinks };
  } catch (error) {
    console.error("Gemini Prospecting Error:", error);
    return { text: "Erro ao consultar o serviço de prospecção. Verifique a chave de API.", prospects: [] };
  }
};