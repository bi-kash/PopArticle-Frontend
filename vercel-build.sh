#!/bin/bash

# Output what we're doing
echo "Running custom build script for Vercel deployment..."

# Run the Next.js build
echo "Building Next.js app..."
next build

echo "Build completed successfully!"
