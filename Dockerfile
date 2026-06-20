# Imagem base: Node.js na versão usada no TCC (24.x), variante "slim" para imagem mais leve
FROM node:24-slim

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia primeiro apenas os arquivos de dependências
# Isso aproveita o cache do Docker: se o código mudar mas as dependências não,
# o "npm install" não precisa rodar de novo no próximo build
COPY package.json ./

# Instala as dependências de produção
RUN npm install --omit=dev

# Agora copia o restante do código da aplicação
COPY . .

# Documenta que a aplicação escuta na porta 3000 (informativo, não abre a porta de fato)
EXPOSE 3000

# Comando que inicia a aplicação quando o container sobe
CMD ["node", "index.js"]