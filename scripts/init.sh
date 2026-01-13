#!/bin/bash

# Скрипт инициализации проекта

set -e

echo "🚀 Инициализация проекта 'Крокодил'..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

# Создание .env файла из примера, если его нет
if [ ! -f .env ]; then
    echo "📝 Создание .env файла из .env.example..."
    cp .env.example .env
    echo "✅ Файл .env создан. Пожалуйста, отредактируйте его при необходимости."
else
    echo "✅ Файл .env уже существует."
fi

# Запуск Docker Compose
echo "🐳 Запуск Docker Compose..."
docker-compose up -d postgres redis

echo "⏳ Ожидание готовности PostgreSQL и Redis..."
sleep 5

# Установка зависимостей backend
echo "📦 Установка зависимостей backend..."
cd backend
if [ ! -d node_modules ]; then
    npm install
fi

# Выполнение миграций
echo "🗄️  Выполнение миграций базы данных..."
npm run prisma:generate
npm run prisma:migrate -- --name init

# Заполнение базы данных начальными данными
echo "🌱 Заполнение базы данных начальными данными..."
npm run prisma:seed || echo "⚠️  Seed выполнен с ошибками или данные уже существуют"

cd ..

# Установка зависимостей frontend
echo "📦 Установка зависимостей frontend..."
cd frontend
if [ ! -d node_modules ]; then
    npm install
fi
cd ..

echo ""
echo "✅ Инициализация завершена!"
echo ""
echo "Для запуска проекта используйте:"
echo "  docker-compose up"
echo ""
echo "Или запустите только инфраструктуру:"
echo "  docker-compose up -d postgres redis"
echo "  cd backend && npm run start:dev"
echo "  cd frontend && npm run dev"
