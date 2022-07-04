#!/bin/sh

ln ./images/*.png ./markdown/Excalidraw

live-server&

watchexec -w ./markdown/pages/ --exts md '
find ./markdown -name "$WATCHEXEC_WRITTEN_PATH" | 
xargs -I {} echo {} | rev | cut -f 2- -d '.' | rev |
cut -d '/' -f3- | rev | cut -f 2- -d '.' | rev |
xargs -I {} pandoc ./markdown/{}.md -o ./{}.html --lua-filter ./markdown/filters/filter.lua
'&

#0. $WATCHEXEC_WRITTEN_PATH = file.ext
#1. find... = ./full/path/file.ext
#2. ./full/path/file
#3. path/file = ex: chimie/test

watchexec -w markdown/Excalidraw --exts png '
find ./markdown -name "$WATCHEXEC_WRITTEN_PATH" | 
xargs -I {} ln {} ./images
'

## for json
#echo '$meta-json$' > /tmp/metadata.pandoc-tpl
#pandoc test.md --template=/tmp/metadata.pandoc-tpl | jq
