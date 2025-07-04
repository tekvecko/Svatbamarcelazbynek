#!/bin/bash

echo "Running Wedding Website Tests..."
echo "================================="

# Run API tests
echo "Testing API endpoints..."
npx vitest run tests/api.test.ts

# Run Storage tests  
echo "Testing Database Storage..."
npx vitest run tests/storage.test.ts

# Run Integration tests
echo "Testing Full Integration..."
npx vitest run tests/integration.test.ts

# Run Component tests
echo "Testing React Components..."
npx vitest run tests/components.test.tsx

echo "================================="
echo "All tests completed!"