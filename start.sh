#!/bin/sh

live-server&

watchexec -w markdown --exts md '
find ./markdown -name "$WATCHEXEC_WRITTEN_PATH" | 
xargs -I {} echo {} | rev | cut -f 2- -d '.' | rev |
xargs -I {} pandoc {}.md -o ./pages/"$(basename "$WATCHEXEC_WRITTEN_PATH" ".md")".html --lua-filter ./markdown/filters/filter.lua
'
