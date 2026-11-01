#!/usr/bin/env bash
# ReliefLink Render Build Script
set -o errexit

echo "📦 Step 1: Installing Frontend Dependencies..."
npm install

echo "⚡ Step 2: Building Production Frontend Bundle (Vite)..."
npm run build

echo "🐍 Step 3: Installing Backend Python Dependencies..."
pip install --upgrade pip
pip install "pydantic[email]" email-validator
pip install -r requirements.txt

echo "✅ Build completed successfully!"
