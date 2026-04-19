# Migração de PostgreSQL/Prisma para MongoDB/Mongoose

## ✅ O que foi alterado

### 1. **Dependências (package.json)**
- ❌ Removido: @prisma/client, prisma
- ✅ Adicionar: mongoose, mongodb
- Scripts atualizados (removidas migrations Prisma)

### 2. **Configuração de BD**
- ❌ Removido: src/config/prisma.js (conectava ao PostgreSQL)
- ✅ Criado: src/config/mongodb.js (conecta ao MongoDB)
- ✅ Criado: src/models/index.js (schemas Mongoose com 11 modelos)

### 3. **Arquivo principal (app.js)**
- ✅ Adicionada chamada de `connectDB()` na inicialização

### 4. **Repositórios convertidos (prontos)**
- ✅ auth.repository.js → MongoDB queries
- ✅ users.repository.js → MongoDB queries
- ✅ categories.repository.js → MongoDB queries
- ✅ products.repository.js → MongoDB queries
- ✅ ingredients.repository.js → MongoDB queries
- ✅ recipes.repository.js → MongoDB queries
- ✅ orders.repository.js → MongoDB queries
- ✅ cash.repository.js → MongoDB queries
- ✅ logService.js → MongoDB queries

### 5. **Repositórios ainda com Prisma (precisam conversão)**
⚠️ cash.service.js (parcialmente convertido)
⚠️ orders.service.js (usa transações - precisa reescrita)
⚠️ reports.service.js (agregações - precisam reescrita com aggregation pipeline)
⚠️ print.service.js (simples - rápido converter)

---

## 📦 Como instalar MongoDB

### Opção 1: MongoDB local (Mac)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verificar
mongosh
> show databases
```

### Opção 2: MongoDB Atlas (cloud)
1. Criar conta em https://www.mongodb.com/cloud/atlas
2. Criar cluster grátis
3. Copiar connection string
4. Usar em MONGODB_URI no .env

### Opção 3: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## 🔧 Próximos passos para finalizar a migração

### 1. Instalar Mongoose
```bash
npm uninstall @prisma/client prisma
npm install mongoose mongodb
```

### 2. Configurar .env
```env
PORT=3000
JWT_SECRET=sua-chave-secreta
MONGODB_URI="mongodb://localhost:27017/restaurant_db"
NODE_ENV=development
```

### 3. Converter remaining repositories

#### cash.service.js
Já está parcialmente feito. Você pode testar, mas precisa revisar a parte de pagamentos:

```javascript
// ANTES (Prisma):
const payments = await prisma.payment.findMany({
  where: { order: { paidAt: { gte: open.openedAt } } },
});

// DEPOIS (MongoDB):
const payments = await Payment.find({
  createdAt: { $gte: open.openedAt },
});
```

#### orders.service.js
É o arquivo mais complexo. Precisa de reescrita completa das transações:

```javascript
// ANTES (Prisma transação):
await prisma.$transaction(async (tx) => {
  // ...
});

// DEPOIS (MongoDB session):
const session = await mongoose.startSession();
session.startTransaction();
try {
  // ... operações com session
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  await session.endSession();
}
```

#### reports.service.js
Usar MongoDB aggregation pipeline:

```javascript
// ANTES (Prisma):
const orders = await prisma.order.findMany({
  where: { paidAt: { gte: start, lte: end } },
});

// DEPOIS (MongoDB aggregation):
const orders = await Order.aggregate([
  {
    $match: {
      paidAt: { $gte: start, $lte: end },
      status: "pago"
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$total" },
      count: { $sum: 1 }
    }
  }
]);
```

---

## 🎯 Guia de conversão rápida

### Padrões Prisma → MongoDB/Mongoose

| Prisma | MongoDB/Mongoose |
|--------|------------------|
| `findUnique({ where: { id } })` | `findById(id)` |
| `findMany()` | `find()` |
| `findFirst()` | `findOne()` |
| `create({ data })` | `new Model(data); await doc.save()` |
| `update({ where, data })` | `findByIdAndUpdate(id, data)` |
| `delete({ where })` | `findByIdAndDelete(id)` |
| `include: { relation }` | `.populate("relation")` |
| `$transaction` | `session.startTransaction()` |
| Índices em schema | `.index()` no schema |

---

## 📝 Checklist de conclusão

Depois de converter todos os repositórios:

- [ ] Instalar Mongoose
- [ ] Atualizar .env com MONGODB_URI
- [ ] Converter orders.service.js (transações)
- [ ] Converter reports.service.js (agregações)
- [ ] Converter print.service.js
- [ ] Deletar prisma/ (se não mais necessário)
- [ ] Testar todos os endpoints
- [ ] Verificar logs funcionando

---

## 🧪 Como testar

Após terminar:

```bash
npm run dev

# Em outro terminal:
curl http://localhost:3000/health

# MongoDB Studio (visualizar dados):
mongosh
> use restaurant_db
> db.users.find()
```

---

## 🎁 Bônus: Visualizar dados MongoDB

### Opção 1: Mongosh (CLI)
```bash
mongosh
> use restaurant_db
> db.users.find().pretty()
> db.orders.count()
```

### Opção 2: MongoDB Compass (GUI)
- Download: https://www.mongodb.com/products/tools/compass
- Conectar a `mongodb://localhost:27017`
- Visualizar dados graficamente

---

## ⚠️ Diferenças importantes

### IDs
- **Prisma/SQL**: strings (UUID ou custom)
- **MongoDB**: ObjectId por padrão (mais eficiente)

Todos os modelos já usam ObjectId.

### Tipos de dados
- **Decimal**: MongoDB usa `Number` (prejudica precisão)
- **Solução**: Usar `mongoose-decimal128` se precisar precisão máxima
- Para restaurante, `Number` é suficiente

### Relacionamentos
- **Prisma**: Join automático
- **MongoDB**: Precisa `.populate()` explícito

Todos os repositórios já fazem isso.

---

## 🚀 Próximo passo

Execute este comando para continuar:

```bash
npm install mongoose mongodb

# Depois edite os 3 arquivos restantes (orders, reports, print)
# Copie os padrões dos arquivos já convertidos
```

Quer que eu termine a conversão dos 3 arquivos restantes?
