# Mirai-Wiki.github.io

This repo is nothing more than a website database. The site is build with Jekyll by GitHub.

More information about the purpose and the content of the website soon...

## Weird files

- All the bash scripts have nothing to do with the website, there are just scripts to help me improve my workflow.
- The `_config.yml` file is required to tell Jekyll how to build the website.
- All the files in the `markdown/pages/` folder are just the pages that are then converted to *.html* (using **pandoc**) by some bash scripts.

## Workflow

To use the bash scripts, some dependecies are involved :

- **pandoc**, to convert *.md* files to *.html* files and to convert yaml metadatas to json files
- **watchexec**, to look for changes in some folders to automate the convertion process and some handy stuff
- **jq**, to manage all json related things
- **live-server**, to see changes in realtime
- **tree**, to generate the folder architecture

## Markdown pages requirements

To generate the `data/pages.json` file, every `.md` files in the `markdown/pages` folder should contain a **yaml header** that have a `title: ...` field at least.
This field will be the name displayed to the user in the menu of the website.

## How to use?

Finally, to modify or create pages, execute the `start.sh` script and start modifying and adding new pages in the `markdown` folder.

## Last words

The project is in intense development and is intended to change a lot. Some information displayed in the `README.md` could become incorrect at any time.
