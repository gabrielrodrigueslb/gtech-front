import axios from 'axios';

// Dica de Debug: Isso vai imprimir no console do navegador qual URL ele pegou
console.log("URL DA API:", process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Usa direto do .env (que já tem /api)
  withCredentials: true,
  timeout: 10000,
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY, //
    'Content-Type': 'application/json',
  },
});