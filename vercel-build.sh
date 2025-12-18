#!/bin/bash

# Output what we're doing
echo "Running custom build script for Vercel deployment..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run the Next.js build
echo "Building Next.js app..."
next build --turbopack

echo "Build completed successfully!"
