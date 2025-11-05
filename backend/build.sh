#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏗️  Building NestJS application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Checking dist folder..."
ls -la dist/ || echo "⚠️  dist folder not found!"

