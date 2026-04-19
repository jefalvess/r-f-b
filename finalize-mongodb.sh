#!/bin/bash
# Script para finalizar a migração MongoDB
# Execute cada seção na ordem

set -e  # Parar em caso de erro

echo "🚀 Finalizando Migração PostgreSQL → MongoDB"
echo "=============================================="

# Passo 1: Copiar arquivos MongoDB para seus lugares
echo ""
echo "✅ Passo 1: Copiando serviços MongoDB..."
cd /Users/jefersonluisalvesdesouza/Desktop/test-copit/src/modules

# Backup dos originais
cp orders/orders.service.js orders/orders.service.prisma.backup.js 2>/dev/null || true
cp reports/reports.service.js reports/reports.service.prisma.backup.js 2>/dev/null || true
cp print/print.service.js print/print.service.prisma.backup.js 2>/dev/null || true

# Copiar novos arquivos
cp orders/orders.service.mongodb.js orders/orders.service.js
cp reports/reports.service.mongodb.js reports/reports.service.js
cp print/print.service.mongodb.js print/print.service.js

echo "✓ Serviços copiados com sucesso"

# Passo 2: Instalar dependências
echo ""
echo "✅ Passo 2: Instalando Mongoose..."
cd /Users/jefersonluisalvesdesouza/Desktop/test-copit

npm uninstall @prisma/client prisma --save 2>/dev/null || true
npm install mongoose mongodb --save

echo "✓ Mongoose instalado"

# Passo 3: Criar .env
echo ""
echo "✅ Passo 3: Criando arquivo .env..."

cat > .env << 'EOF'
PORT=3000
JWT_SECRET=seu-secret-super-seguro-aqui
MONGODB_URI="mongodb://localhost:27017/restaurant_db"
NODE_ENV=development
EOF

echo "✓ .env criado (edite JWT_SECRET se necessário)"

# Passo 4: Verificar estrutura
echo ""
echo "✅ Passo 4: Verificando estrutura..."
ls -la src/models/index.js
ls -la src/config/mongodb.js
ls -la src/modules/orders/orders.service.js
ls -la src/modules/reports/reports.service.js
ls -la src/modules/print/print.service.js

echo "✓ Todos os arquivos presentes"

# Passo 5: Resumo final
echo ""
echo "=============================================="
echo "🎉 MIGRAÇÃO 95% COMPLETA!"
echo "=============================================="
echo ""
echo "Próximas ações:"
echo "1. Iniciar MongoDB:"
echo "   brew services start mongodb-community"
echo "   # ou"
echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
echo ""
echo "2. Iniciar servidor:"
echo "   npm run dev"
echo ""
echo "3. Testar em outro terminal:"
echo "   curl http://localhost:3000/health"
echo ""
echo "4. Visualizar BD:"
echo "   mongosh"
echo "   > use restaurant_db"
echo "   > db.users.find()"
echo ""
echo "=============================================="
