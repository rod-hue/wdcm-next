#!/bin/bash
# stamp local css/js references with a content hash so browsers always load the newest
cd "$(dirname "$0")"
V=$(cat assets/*.css assets/*.js | md5 | cut -c1-8)
for f in index.html article.html; do
  sed -E -i '' "s#(assets/[a-z0-9]+\.(css|js))(\?v=[a-f0-9]+)?\"#\1?v=$V\"#g" "$f"
done
echo "v=$V"
