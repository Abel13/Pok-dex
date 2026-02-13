# Pokédex PWA Futurista

Uma Pokédex moderna e futurista construída com Next.js 15, que utiliza reconhecimento de imagem via OpenAI Vision API para identificar Pokémon através da câmera do dispositivo.

## Funcionalidades

- 📷 **Reconhecimento por Câmera**: Aponte a câmera para um Pokémon e identifique-o automaticamente
- 🤖 **IA de Identificação**: Utiliza OpenAI GPT-4o Vision para reconhecer Pokémon em imagens
- 🔊 **Síntese de Voz**: Anuncia o nome do Pokémon identificado em português
- 📊 **Dados Completos**: Exibe estatísticas, tipos, descrição e cadeia de evolução
- 📱 **PWA**: Instalável como aplicativo nativo
- 🎨 **Design Futurista**: Interface inspirada na Pokédex da série

## Tecnologias

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI Vision API
- PokeAPI
- Web Speech API
- Service Workers

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure a variável de ambiente:
```bash
cp .env.example .env.local
```

Adicione sua chave da OpenAI:
```
OPENAI_API_KEY=sk-...
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Para testar com HTTPS (necessário para câmera e PWA):
```bash
npm run dev -- --experimental-https
```

4. Acesse [https://localhost:3000](https://localhost:3000)

## Uso

1. Clique em "Ativar Câmera" para permitir o acesso à câmera
2. Aponte a câmera para um Pokémon (brinquedo, carta, desenho, etc.)
3. Clique em "Identificar"
4. Aguarde a identificação e veja os dados do Pokémon na tela

## Estrutura do Projeto

```
app/
├── api/
│   ├── identify/route.ts      # API para identificação via OpenAI
│   └── pokemon/[name]/route.ts # API para buscar dados do Pokémon
├── components/
│   ├── Pokedex.tsx            # Componente principal
│   ├── VisorCamera.tsx        # Componente da câmera
│   ├── PokemonDisplay.tsx     # Exibição dos dados
│   └── EvolutionChain.tsx    # Cadeia de evolução
├── lib/
│   ├── openai.ts              # Cliente OpenAI
│   ├── pokeapi.ts             # Helpers PokeAPI
│   └── types.ts               # Tipos TypeScript
└── manifest.ts                # Manifest PWA
```

## Notas

- A câmera requer HTTPS (ou localhost em desenvolvimento)
- A OpenAI Vision API tem custos associados
- O PokeAPI é gratuito mas recomenda-se cache local
