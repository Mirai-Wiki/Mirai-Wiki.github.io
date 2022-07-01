#!/bin/sh

echo '' > ./data/temp.json

echo '$meta-json$' > /tmp/metadata.pandoc-tpl

echo "[" > ./data/temp.json
find ./markdown -name "*.md" -not -path "./markdown/Excalidraw/*" -not -path "./markdown/filters/*" -not -path "./markdown/templates/*" -not -path "./markdown/homepage.md" |
while read line ;
do
    pandoc "$line" --template=/tmp/metadata.pandoc-tpl | jq >> ./data/temp.json
    echo ',' >> ./data/temp.json
done;
head -n -1 ./data/temp.json > ./data/pages.json
echo "]" >> ./data/pages.json
rm ./data/temp.json
