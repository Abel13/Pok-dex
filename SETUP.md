# Guia de Configuração - Pokédex PWA

## Pré-requisitos

- Node.js 18+ instalado
- Chave da API OpenAI (GPT-4o ou GPT-4o-mini)

## Passos de Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione sua chave da OpenAI:
```
OPENAI_API_KEY=sk-sua-chave-aqui
```

3. **Criar ícones da PWA:**
Os ícones são necessários para a PWA funcionar corretamente. Você pode:
- Usar uma ferramenta online como https://realfavicongenerator.net/
- Criar manualmente dois arquivos PNG:
  - `public/icon-192x192.png` (192x192 pixels)
  - `public/icon-512x512.png` (512x512 pixels)

**Design sugerido:**
- Fundo: #8B0000 (vermelho escuro)
- Ícone: Pokéball ou símbolo de Pokédex
- Estilo: Futurista, minimalista

4. **Executar em desenvolvimento:**
```bash
npm run dev
```

Para testar recursos de PWA e câmera (requer HTTPS):
```bash
npm run dev -- --experimental-https
```

Acesse: https://localhost:3000

5. **Build para produção:**
```bash
npm run build
npm start
```

6. **Webhook Stripe (assinaturas PRO):**
Para receber eventos do Stripe em desenvolvimento, use o comando com a URL correta:
```bash
npm run stripe:listen
```
Ou manualmente:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
O `stripe listen` exibirá um signing secret (`whsec_...`). Atualize `STRIPE_WEBHOOK_SECRET` no `.env` com esse valor para testes locais.

## Funcionalidades

- ✅ Reconhecimento de Pokémon via câmera usando OpenAI Vision
- ✅ Síntese de voz (TTS) em português
- ✅ Exibição completa de dados do Pokémon
- ✅ Cadeia de evolução visual
- ✅ Design responsivo e futurista
- ✅ PWA instalável

## Notas Importantes

1. **HTTPS obrigatório**: A câmera e recursos PWA requerem HTTPS. Use `--experimental-https` em desenvolvimento ou configure um proxy reverso.

2. **Custos da OpenAI**: A API Vision tem custos por requisição. Considere usar `gpt-4o-mini` para reduzir custos.

3. **Permissões**: O navegador solicitará permissão para acessar a câmera. Certifique-se de permitir.

4. **Navegadores suportados**: Chrome, Edge, Safari (iOS 16.4+), Firefox. Alguns recursos podem variar.

## Troubleshooting

**Câmera não funciona:**
- Verifique se está usando HTTPS
- Verifique as permissões do navegador
- Tente em outro navegador

**Erro ao identificar Pokémon:**
- Verifique se a chave da OpenAI está configurada corretamente
- Verifique sua cota da API OpenAI
- Tente com uma imagem mais clara do Pokémon

**Service Worker não registra:**
- Verifique o console do navegador
- Certifique-se de que está usando HTTPS
- Limpe o cache do navegador
