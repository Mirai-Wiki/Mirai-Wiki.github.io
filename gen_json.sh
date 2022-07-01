#!/bin/sh

echo '' > ./data/temp.json

echo '$meta-json$' > /tmp/metadata.pandoc-tpl

echo "[" > ./data/temp.json
find ./markdown -name "*.md" -not -path "./markdown/Excalidraw/*" -not -path "./markdown/filters/*" -not -path "./markdown/templates/*" -not -path "./markdown/homepage.md" |
sort |
while read file ;
do
    pandoc "$file" --template=/tmp/metadata.pandoc-tpl | 
    sed 's/.$//' | sed 's/"/\\"/g' |
    xargs -I {} echo '{},'$(dirname "$file" |
    cut -d '/' -f3- | rev | cut -f 2- -d '.' | rev |
    xargs -I {} echo '"folder":"{}",') |
    sed 's/.$//' |
    xargs -0 -I {} echo {}'}' |
    jq >> ./data/temp.json

    echo ',' >> ./data/temp.json
done;
head -n -1 ./data/temp.json > ./data/pages.json
echo "]" >> ./data/pages.json
rm ./data/temp.json

echo "JSON Generation: Successful!"
