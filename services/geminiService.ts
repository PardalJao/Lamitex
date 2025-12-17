import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Get API Key from defined process.env.API_KEY
const API_KEY = process.env.API_KEY || '';

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
    return "A chave de API não foi configurada. Por favor, adicione a variável API_KEY no painel do Vercel.";
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
    return result.text || "Desculpe, não consegui processar sua solicitação.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Erro de conexão com a Nath. Verifique se a chave de API está correta ou se o limite foi atingido.";
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
    return { text: "API_KEY ausente.", prospects: [] };
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
    return { text: "Não foi possível realizar a busca no Google Maps no momento.", prospects: [] };
  }
};