#!/bin/sh

echo '$meta-json$' > /tmp/metadata.pandoc-tpl
#pandoc test.md --template=/tmp/metadata.pandoc-tpl | jq

for i in $(find ./markdown -name "*.md" -not -path "./markdown/Excalidraw/*" -not -path "./markdown/filters/*" -not -path "./markdown/templates/*")
do
    echo $i
    #pandoc $i --template=/tmp/metadata.pandoc-tpl | jq
done;
