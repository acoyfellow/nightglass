#!/bin/sh
set -eu
cd /Users/jcoeyman/cloudflare/nightglass
npm test
npm run benchmark
node src/jev-reference.mjs
node src/compare.mjs
node src/server.mjs >/tmp/nightglass-proof.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
sleep 1
curl -fsS http://127.0.0.1:8787/ | grep -q NIGHTGLASS
curl -fsS -X POST http://127.0.0.1:8787/classify \
  -H 'content-type: application/json' \
  --data '{"claim":"The endpoint is healthy.","evidence":"The smoke test returned HTTP 500."}' | grep -q contradictory
