export interface Product {
  id: string;
  name: string;
  category: 'Automotiva' | 'Acessórios & Brindes' | 'Moda & Decoração';
  description: string;
  specs: string;
  thickness: string;
}

export type LeadSegment = 'Tapeçaria Profissional' | 'Atacado' | 'Varejo' | 'Indústria';

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  niche: string;
  segment: LeadSegment;
  location: string;
  status: 'prospecting' | 'triage' | 'sample_sent' | 'quote' | 'production' | 'shipping';
  value?: number;
  lastContact?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTechnicalData?: boolean;
  attachment?: {
    type: 'image' | 'audio';
    data: string; // Base64
    mimeType: string;
  };
}

export type ViewState = 'dashboard' | 'kanban' | 'prospecting' | 'chat';
