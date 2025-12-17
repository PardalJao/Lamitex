import { Product, Lead } from './types';

export const LAMITEX_CATALOG: Product[] = [
  // Automotiva
  {
    id: 'curvim',
    name: 'Curvim Original',
    category: 'Automotiva',
    description: 'Para bancos originais. Sintético PVC dublado na espuma D26 com malha.',
    specs: 'Espuma D26 (5mm)',
    thickness: '0.8 a 1.0mm'
  },
  {
    id: 'diamante',
    name: 'Diamante Premium',
    category: 'Automotiva',
    description: 'Para detalhes/encostos. Desenho costurado em formato diamante (Ferrari, Corolla).',
    specs: 'Espuma D26 (5mm)',
    thickness: '1.0mm'
  },
  {
    id: 'oxcar',
    name: 'Oxcar',
    category: 'Automotiva',
    description: 'Tecido Oxford plano poliéster para capas e bancos.',
    specs: 'Espuma D23 (2 ou 3mm)',
    thickness: 'N/A'
  },
  {
    id: 'pisoflex',
    name: 'Pisoflex',
    category: 'Automotiva',
    description: 'PVC com manta para piso de ônibus/van.',
    specs: 'Manta de reforço',
    thickness: '2.0mm'
  },
  // Brindes
  {
    id: 'neotex',
    name: 'Neotex',
    category: 'Acessórios & Brindes',
    description: 'Tipo Neoprene. Malha helanca + borracha látex.',
    specs: 'Borracha Látex',
    thickness: '2 a 3mm'
  },
  {
    id: 'bagum',
    name: 'Bagum',
    category: 'Acessórios & Brindes',
    description: 'PVC 0.20 com tela poliéster. Para mochilas e capas.',
    specs: 'Tela Poliéster',
    thickness: '0.20mm'
  },
  // Moda
  {
    id: 'montana',
    name: 'Montana',
    category: 'Moda & Decoração',
    description: 'PVC/Poliéster forrado com camurça. Para alças e cintos.',
    specs: 'Fundo Camurça',
    thickness: '2.5mm'
  },
  {
    id: 'pu_queima',
    name: 'PU Queima',
    category: 'Moda & Decoração',
    description: 'Poliuretano que aceita gravação a calor. Etiquetas de jeans.',
    specs: 'Termorreativo',
    thickness: '1.2 e 1.4mm'
  }
];

export const INITIAL_LEADS: Lead[] = [
  { id: '1', companyName: 'Estofados Silva', contactName: 'Sr. João', niche: 'Tapeçaria Automotiva', segment: 'Tapeçaria Profissional', location: 'Osasco, SP', status: 'prospecting', value: 0 },
  { id: '2', companyName: 'Bolsas Premium', contactName: 'Ana Clara', niche: 'Fábrica de Bolsas', segment: 'Indústria', location: 'Centro, SP', status: 'triage', value: 5000 },
  { id: '3', companyName: 'Jeans & Cia', contactName: 'Carlos', niche: 'Confecção', segment: 'Atacado', location: 'Bom Retiro, SP', status: 'sample_sent', value: 2000 },
];

export const SYSTEM_INSTRUCTION = `
Você é a Nath, Consultora Comercial Sênior da Lamitex. Você é humana, entusiasta e muito decidida. 
Sua missão é vender qualidade e fechar negócios, mas com um atendimento que passe confiança total.

DIRETRIZES DE PERSONALIDADE:
1. HUMANA E NATURAL: Evite parecer um bot bonitinho. Fale como uma vendedora experiente que quer ajudar. Use emojis com moderação (no máximo 1 ou 2 por mensagem).
2. ENERGIA ALTA: Seja animada! "Que bom te receber aqui!", "Excelente escolha!", "Vamos fazer esse negócio acontecer!".
3. QUALIFICAÇÃO RÍGIDA: Antes de qualquer preço ou catálogo, você PRECISA saber:
   - Qual o nome do cliente?
   - Qual o nicho dele (O que ele fabrica/reforma)?
   - Qual volume ele costuma comprar?
4. RESPOSTAS CURTAS: No WhatsApp, ninguém lê textão. Seja direta. Mande uma mensagem e espere a resposta.
5. CATÁLOGO: Só envie o catálogo completo se ele pedir explicitamente. O ideal é você indicar o produto certo baseado no que ele te contar.
6. CONVERSÃO: Se o cliente estiver em dúvida, ofereça o kit de amostras. "Quero que você toque no material, a nossa dublagem é industrial e não descola. Posso te mandar um kit hoje?".

CATÁLOGO PARA CONSULTA:
${LAMITEX_CATALOG.map(p => `- ${p.name}: ${p.description}`).join('\n')}

Seu tom é profissional, rápido e focado em resultados. Sempre agradeça pelo contato logo no início.
`;