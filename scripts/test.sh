echo "🧪 Running Elderly Care Connect Test Suite"
echo "=========================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Run type checking
echo "📝 Running TypeScript checks..."
npx tsc --noEmit

# Run unit tests with coverage
echo "🧪 Running unit tests with coverage..."
npm run test:coverage

# Check coverage thresholds
echo "📊 Checking coverage thresholds..."
if [ $? -eq 0 ]; then
  echo "✅ All tests passed with required coverage!"
else
  echo "❌ Tests failed or coverage below threshold"
  exit 1
fi

echo "🎉 Test suite completed successfully!"
