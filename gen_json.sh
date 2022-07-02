#!/bin/sh

echo '' > ./data/temp.json

echo '$meta-json$' > /tmp/metadata.pandoc-tpl

echo "[" > ./data/temp.json
find ./markdown -name "*.md" -not -path "./markdown/Excalidraw/*" -not -path "./markdown/filters/*" -not -path "./markdown/templates/*" -not -path "./markdown/homepage.md" |
sort |
while read file ;
do
    pandoc "$file" --template=/tmp/metadata.pandoc-tpl | 
    jq '.folder |= "'$(dirname "$file" | 
    cut -d '/' -f3- | rev | cut -f 2- -d '.' | rev)'"' |
    xargs -0 -I {} echo '{},' >> ./data/temp.json
done;
head -n -1 ./data/temp.json > ./data/pages.json
echo "]" >> ./data/pages.json
rm ./data/temp.json

echo "JSON Generation: Successful!"

#pandoc "$file" --template=/tmp/metadata.pandoc-tpl |   > {"field":"value"}
#sed 's/.$//' | sed 's/"/\\"/g' |                       > 'delete last char' | 'escape the quotes'
#xargs -I {} echo '{},'$(dirname "$file" |              > 
#cut -d '/' -f3- | rev | cut -f 2- -d '.' | rev |       > 'cut the two first dirs'
#xargs -I {} echo '"folder":"{}",') |                   >
#sed 's/.$//' |                                         > 'delete the pending , at the end'
#xargs -0 -I {} echo {}'}' |                            > 'add } at the end'
#jq >> ./data/temp.json                                 > 'format the input to json'

#head -n -1 ./data/temp.json > ./data/pages.json        > 'remove the last line'
