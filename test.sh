#!/bin/sh
set -eu
printf 'Test OK as %s (uid=%s)\n' "$(whoami)" "$(id -u)"
node -v >/dev/null 2>&1 && echo node:$(node -v) || echo node-missing
npm -v  >/dev/null 2>&1 && echo npm:$(npm -v)   || echo npm-missing
