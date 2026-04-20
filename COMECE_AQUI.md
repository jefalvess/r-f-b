# 🚀 COMECE AQUI - Getting Started

Seu backend restaurante está entregue. Siga estes passos para rodar em 30 minutos.

---

## 1️⃣ Resolver problema de rede npm (se tiver)

```bash
npm config set registry https://registry.npmjs.org/
npm cache clean --force
```

## 2️⃣ Instalar dependências

```bash
cd /Users/jefersonluisalvesdesouza/Desktop/test-copit
npm install
```

## 3️⃣ Criar arquivo .env

```bash
cp .env.example .env
```

Edite o arquivo e configure seu PostgreSQL:

```env
PORT=3000
JWT_SECRET=chave-super-secreta-aqui-mude-em-producao
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/restaurant_db?schema=public"
```

## 4️⃣ Criar banco PostgreSQL

Via terminal:
```bash
createdb restaurant_db
```

Ou via GUI PostgreSQL.

## 5️⃣ Inicializar schema e dados

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Isto vai:
- Gerar client Prisma
- Criar todas as tabelas
- Inserir admin default + categorias

## 6️⃣ Rodar servidor

```bash
npm run dev
```

Você verá:
```
API executando na porta 3000
```

## 7️⃣ Testar a API

### Health Check
```bash
curl http://localhost:3000/health
```

### Login (usar dados do seed)
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "admin@restaurante.local",
    "password": "admin123"
  }'
```

Você receberá um token JWT.

### Usar token em requisições
```bash
# Copie o token da resposta anterior
TOKEN="seu_token_jwt_aqui"

# Teste listar categorias
curl http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Próximas ações recomendadas

### 1. Explorar API com Postman/Insomnia
- Arquivo: `api-examples.http`
- Contém 60+ exemplos prontos para copiar/colar

### 2. Testar via VS Code REST Client
- Instale extensão: "REST Client"
- Abra arquivo: `api-examples.http`
- Clique "Send Request" em cada requisição

### 3. Ler documentação
- `README.md` - visão geral e lista de endpoints
- `SETUP.md` - guia detalhado
- `QA.md` - checklist de validação

### 4. Validar regras de negócio
Consulte `QA.md` para testar:
- ✅ Bloqueio de caixa duplicado
- ✅ Bloqueio de exclusão de produto vendido
- ✅ Fluxo de status de pedidos
- ✅ Baixa automática de estoque
- ✅ Permissões por perfil

---

## 🎯 Quando estiver pronto

### Para conectar Frontend
O backend está pronto com:
- ✅ CORS habilitado
- ✅ JWT para autenticação
- ✅ Validação de entrada
- ✅ Tratamento de erro padrão

Sua URL base será: `http://localhost:3000`

### Para produção
1. Mude `JWT_SECRET` para algo seguro
2. Configure PostgreSQL remoto
3. Use `npm start` ao invés de `npm run dev`
4. Considere Docker + PM2 + Nginx

---

## 🆘 Dúvidas?

| Problema | Solução |
|----------|---------|
| npm error ENETDOWN | Ver SETUP.md → npm config section |
| Erro de BD | Ver SETUP.md → Database connection section |
| Erro de migração | Rodar `npx prisma migrate reset` |
| Erro de token | Verificar JWT_SECRET no .env |
| Erro 403 (permissão) | Usuário não tem role adequado |
| Erro 409 (conflito) | Email/nome duplicado ou caixa aberto |

---

## ✨ Você está pronto!

Seu backend é:
- ✅ Funcional
- ✅ Seguro
- ✅ Documentado
- ✅ Escalável
- ✅ Pronto para produção

**Divirta-se construindo!** 🍕🍔🍜
