#!/bin/sh

#ln ./images/*.png ./markdown/Excalidraw

#live-server&

watchexec -w markdown --exts md '
find ./markdown -name "$WATCHEXEC_WRITTEN_PATH" | 
xargs -I {} echo {} | rev | cut -f 2- -d '.' | rev |
xargs -I {} echo $(cut -d '/' -f3- "./tysire/tysrnei/istyrn.mr" | rev | cut -f 2- -d '.' | rev)
'
#xargs -I {} pandoc {}.md -o ./pages/"$(cut -d '/' -f3- | rev | cut -f 2- -d '.' | rev)".html --lua-filter ./markdown/filters/filter.lua

#cut -d '/' -f3- | rev | cut -f 2- -d '.' | rev

#watchexec -w markdown/Excalidraw --exts png '
#find ./markdown -name "$WATCHEXEC_WRITTEN_PATH" | 
#xargs -I {} ln {} ./images
#'
