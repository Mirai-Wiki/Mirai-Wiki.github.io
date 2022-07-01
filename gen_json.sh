#!/bin/sh

echo '$meta-json$' > /tmp/metadata.pandoc-tpl

find ./markdown -name "*.md" -not -path "./markdown/Excalidraw/*" -not -path "./markdown/filters/*" -not -path "./markdown/templates/*" |
while read line ;
do
pandoc "$line" --template=/tmp/metadata.pandoc-tpl | jq
done;
