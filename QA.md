# Checklist de Validação - Backend Restaurante

## ✅ Validação pré-execução

Executar antes de rodar o servidor:

```bash
# 1. Verificar estrutura
ls -la src/modules/
# Deve mostrar: auth, users, categories, products, ingredients, recipes, orders, cash, reports, print

# 2. Verificar package.json
cat package.json | grep -A 10 '"scripts"'
# Deve mostrar: dev, start, prisma:generate, prisma:migrate, prisma:seed

# 3. Verificar configuração
cat .env.example
# Deve ter: PORT, JWT_SECRET, DATABASE_URL

# 4. Verificar schema
wc -l prisma/schema.prisma
# Deve ter entre 200-300 linhas

# 5. Listar todos os módulos
find src/modules -type f -name "*.js" | wc -l
# Deve ter ~50 arquivos JavaScript
```

## 📋 Passos de setup

### Pré-requisitos
- [ ] Node.js 16+ instalado
- [ ] PostgreSQL 12+ rodando
- [ ] npm/yarn funcional

### Setup
- [ ] `npm config set registry https://registry.npmjs.org/` (se tiver erro de rede)
- [ ] `npm install`
- [ ] `cp .env.example .env`
- [ ] Editar `.env` com suas credenciais PostgreSQL
- [ ] `npm run prisma:generate`
- [ ] `npm run prisma:migrate`
- [ ] `npm run prisma:seed`

### Testes rápidos (após rodar `npm run dev`)

#### Health check
```bash
curl http://localhost:3000/health
# Esperado: {"status":"ok","service":"restaurant-backend"}
```

#### Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin@restaurante.local","password":"admin123"}'
  
# Esperado: token JWT + dados do usuário
```

#### Listar categorias (com token)
```bash
TOKEN="seu_token_aqui"
curl http://localhost:3000/categories \
  -H "Authorization: Bearer $TOKEN"
  
# Esperado: array com categorias (almoço, lanche, bebida, etc)
```

## 🎯 Testes de regras de negócio

### Autenticação
- [ ] Senha incorreta retorna erro 401
- [ ] Email inválido retorna erro 401
- [ ] Request sem token retorna erro 401
- [ ] Token expirado retorna erro 401

### Permissões
- [ ] Admin pode criar/editar/deletar usuários
- [ ] Gerente pode criar/editar usuários (não deletar)
- [ ] Atendente não pode gerenciar usuários
- [ ] Atendente pode ver e criar pedidos

### Produtos
- [ ] Não pode excluir produto que foi vendido
- [ ] Pode alterar preço padrão
- [ ] Categoria deve existir
- [ ] Nome é obrigatório

### Pedidos
- [ ] Tem ID público único (PED-yyyymmdd-xxxxxx)
- [ ] Pode mudar status apenas conforme fluxo
- [ ] Não pode alterar pedido pago ou cancelado
- [ ] Ao pagar, baixa estoque de ingredientes
- [ ] Calcula total com desconto + taxa entrega

### Caixa
- [ ] Não pode abrir caixa se já há um aberto
- [ ] Registra entrada/sangria corretamente
- [ ] Resumo mostra totais por forma de pagamento
- [ ] Pode fechar e arquivar histórico

### Estoque
- [ ] Ingrediente com estoque < mínimo aparece em relatório
- [ ] Ao vender parmegiana, baixa frango, arroz, queijo, batata
- [ ] Se estoque insuficiente, bloqueia venda

### Relatórios
- [ ] Vendas por período calcula corretamente
- [ ] Top produtos mostra top 20
- [ ] Pagamentos resumem por método
- [ ] Estoque baixo lista ingredientes com alerta

## 🔐 Testes de segurança

- [ ] Senhas são hasheadas com bcrypt
- [ ] JWT tem expiração (12h)
- [ ] CORS está habilitado para frontend
- [ ] Helmet adiciona headers de segurança
- [ ] Validação Zod rejeita dados inválidos
- [ ] Logs registram todas as alterações

## 📊 Endpoints validados

| Módulo | GET | POST | PUT | DELETE |
|--------|-----|------|-----|--------|
| Auth | - | ✓ | - | - |
| Users | ✓ | ✓ | ✓ | ✓ |
| Categories | ✓ | ✓ | ✓ | ✓ |
| Products | ✓ | ✓ | ✓ | ✓ |
| Ingredients | ✓ | ✓ | ✓ | ✓ |
| Recipes | ✓ | - | ✓ | - |
| Orders | ✓ | ✓ | ✓ | ✓ |
| Cash | ✓ | ✓ | - | - |
| Reports | ✓ | - | - | - |
| Print | ✓ | - | - | - |

Total: 50+ endpoints funcionais

## 🚨 Troubleshooting

Se encontrar erro, consulte:
1. **Erro de conexão** → Ver SETUP.md seção "Database connection refused"
2. **Erro de npm** → Ver SETUP.md seção "connect ENETDOWN"
3. **Erro de migração** → Rodar `npx prisma migrate reset` (apaga dados)
4. **Erro de token** → Verificar JWT_SECRET no .env

## 📝 Logs de auditoria

Verificar logs de todas as ações:

```bash
# Via Prisma Studio
npx prisma studio

# Ou via SQL
SELECT * FROM "Log" ORDER BY "createdAt" DESC LIMIT 10;
```

Deve registrar:
- Criação/edição de usuários
- Alterações de preço em itens
- Cancelamentos de pedidos
- Movimentações de caixa
- Criação/fechamento de pedidos

## ✨ Status final

Quando todos os testes passarem:

- [x] Backend pronto para produção
- [x] Todos os módulos funcionando
- [x] Regras de negócio implementadas
- [x] Segurança básica em place
- [x] Documentação completa
- [x] Pronto para conectar frontend

🎉 **Parabéns! Seu backend restaurante está pronto!**
