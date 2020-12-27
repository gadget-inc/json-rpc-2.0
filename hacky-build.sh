#!/usr/bin/env bash
set -ex
npm run build
git branch -f gadget-hacks HEAD
git co gadget-hacks
rm .gitignore
git add dist

SHA=$(git rev-parse --short HEAD)

git commit -m "Build $SHA"
git push origin gadget-hacks --force
echo "Add to package.json:"
git rev-parse HEAD