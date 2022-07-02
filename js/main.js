window.history.scrollRestoration = "manual";

const ARTICLE_KEY = "article-scroll-y";

const pageContent = document.querySelector("#page-content");
const leftCol = document.querySelector("#page-content-left-column");
const article = document.querySelector("#page-content-center-column");
const tocList = document.querySelector(".toc-container");
const navbar = document.querySelector(".navbar-list");

const isMobile = window.matchMedia("(any-hover: none)").matches;
let isMinUI = window.innerWidth <= 740;

const createdNodes = [];

// Manage scrolling
article.addEventListener("scroll", (evt) => {
    window.sessionStorage.setItem(ARTICLE_KEY, evt.target.scrollTop);
});

window.addEventListener("load", () => {
    const articleScrollY = sessionStorage.getItem(ARTICLE_KEY) || 0;

    article.scrollTo(0, articleScrollY);
});

// Manage resize (isMinUI)
window.addEventListener("resize", () => {
    isMinUI = window.innerWidth <= 740;
});

// Load menu (json)
function doesNodeExist(nodeName)
{
    for (let i = 0; i < createdNodes.length; i++)
    {
        if (createdNodes[i] === nodeName)
        {
            return true;
        }
    }

    return false;
}

function getFolderMaxDeep(treeNodes, absoluteFolderTokens, currentSearch=0)
{
    if (currentSearch < absoluteFolderTokens.length)
    {
        const folder = treeNodes.querySelector("." + absoluteFolderTokens[currentSearch]);
        if (folder === null)
        {
            return treeNodes.querySelector("." + absoluteFolderTokens[currentSearch - 1]);
        }

        return getFolderMaxDeep(treeNodes, absoluteFolderTokens, currentSearch + 1);
    }

    return treeNodes.querySelector("." + absoluteFolderTokens[currentSearch - 1]);
}

function createFolderRecursive(treeNodes, absoluteFolderTokens, currentSearch=0)
{
    if (currentSearch < absoluteFolderTokens.length)
    {
        const folder = treeNodes.querySelector("." + absoluteFolderTokens[currentSearch]);
        if (folder === null)
        {
            const treeNode = document.createElement("li");
            treeNode.classList.add("tree-node");
            treeNode.classList.add(absoluteFolderTokens[currentSearch]);
            treeNode.innerHTML = `
                <span class="caret">${absoluteFolderTokens[currentSearch]}</span>
                <ol class="nested">
                </ol>
            `;

            treeNodes.querySelector("ol").appendChild(treeNode);
            treeNode.querySelector(".caret").addEventListener("click", (evt) => {
                evt.target.parentElement.querySelector(".nested").classList.toggle("active");
                evt.target.classList.toggle("caret-down");
            });

            createdNodes.push(absoluteFolderTokens.join('/'));

            createFolderRecursive(treeNode, absoluteFolderTokens, currentSearch + 1);
        }
        else
        {
            createFolderRecursive(folder, absoluteFolderTokens, currentSearch + 1);
        }
    }
}

window.addEventListener("load", async () => {
    const res = await fetch("/data/pages.json");
    const states = await res.json();

    const treePages = leftCol.querySelector("#extend-pages");

    states.forEach((value) => {
        if (value.folder)
        {
            const tokens = value.folder.split('/');
            const folder = tokens[tokens.length - 1];
            const absoluteFolder = value.folder;

            createFolderRecursive(treePages, tokens);

            const node = getFolderMaxDeep(treePages, tokens);
            const treeItem = document.createElement("li");
            treeItem.classList.add("tree-item");
            treeItem.innerHTML = `
                <a href="#/pages/${value.folder}/${value.title}">${value.title}</a>
            `;

            node.querySelector("ol").appendChild(treeItem);
        }
        else
        {
            const treeItem = document.createElement("li");
            treeItem.classList.add("tree-item");
            treeItem.innerHTML = `
                <a href="#/pages/${value.title}">${value.title}</a>
            `;

            treePages.querySelector("ol").appendChild(treeItem);
        }
    });
});

// Searching
//window.addEventListener("click", () => {
    //searchResult.hidden = true;
//});

//searchBar.addEventListener("input", () => {
    //const allPages = menu.querySelectorAll(".page-name-item");
    //const lstPages = [...allPages].map(e=>e.innerHTML);

    //if (searchBar.value.length > 0)
    //{
        //searchResult.hidden = false;
        //const rect = searchBar.getBoundingClientRect();
        //const posX = rect.x + 20;
        //const posY = rect.y + 20;
        //searchResult.style.left = `${posX}px`;
        //searchResult.style.top = `${posY}px`;

        //let matches = lstPages.filter((state) => {
            //const regex = new RegExp(searchBar.value, "gi");
            //return state.match(regex);
        //});

        //if (matches.length > 0)
        //{
            //const html = matches.map(match => `
                //<p><a href=${match}.html>${match}</a></p>
            //`).join('');

            //searchResult.innerHTML = html;
        //}
        //else
        //{
            //searchResult.innerHTML = "<p>No result...</p>";
        //}
    //}
    //else
    //{
        //searchResult.hidden = true;
        //searchResult.innerHTML = '';
    //}
//});

// Mouse
const mouse = new Mouse();

// Preview
const sleep = ms => new Promise(res => setTimeout(res, ms));
const eventEmitter = new EventEmitter();

async function loadPageHTML(pageContainer, fileName)
{
    const res = await fetch(fileName + ".html");

    if (res.status !== 404)
    {
        await res.text().then((html) => {
            pageContainer.innerHTML = html;
        });
    }
    else
    {
        pageContainer.innerHTML = `
            <p>Erreur 404, la page ${fileName}.html n'existe pas :'(</p>
        `;
    }
}

function removePreviews()
{
    const allPreviews = pageContent.querySelectorAll(".page-preview");
    [...allPreviews].map((e) => {
        e.parentNode.removeChild(e);
    });
}

function destroyPreviews()
{
    const allArticleLinks = pageContent.querySelectorAll(".page-link");
    [...allArticleLinks].map((e) => {
        e.parentNode.removeChild(e);
        e.mouseIn = false;
    });
}

async function popupPreview(evt)
{
    if (evt.target.previewPending)
    {
        return false;
    }

    evt.target.previewPending = true;

    await sleep(300);

    if (!evt.target.mouseIn)
    {
        evt.target.previewPending = false;
        return false;
    }

    const link = evt.target;
    const linkBox = link.getBoundingClientRect();
    const previewContainer = document.createElement("div");
    previewContainer.classList.add("page-preview");
    previewContainer.classList.add("page-container");
    previewContainer.style = `
        position: absolute;
        top: ${linkBox.bottom}px;
        left: ${mouse.x - 10}px;
        width: 400px;
        height: 500px;
        background-color: silver;
    `;

    pageContent.appendChild(previewContainer);

    previewContainer.mouseIn = false;
    previewContainer.addEventListener("mousemove", (evt) => {
        previewContainer.mouseIn = true;
        mouse.x = evt.clientX;
        mouse.y = evt.clientY;
    });

    previewContainer.addEventListener("mouseleave", async (evt) => {
        previewContainer.mouseIn = false;

        await sleep(300);

        const currentPreview = evt.target;

        if (currentPreview.mouseIn)
        {
            return false;
        }

        const previewBox = currentPreview.getBoundingClientRect();

        if (evt.clientX >= previewBox.x && evt.clientX < previewBox.x + previewBox.width
            && evt.clientY >= previewBox.y && evt.clientY < previewBox.y + previewBox.height)
        {
        }
        else
        {
            currentPreview.parentNode.removeChild(currentPreview);
            const allPreviews = pageContent.querySelectorAll(".page-preview");
            const previewArray = [...allPreviews];

            if (previewArray.length === 0)
            {
                return false;
            }

            const fallbackPreview = previewArray[previewArray.length - 1];
            const fallbackPreviewBox = fallbackPreview.getBoundingClientRect();

            if (mouse.x >= fallbackPreviewBox.x && mouse.x < fallbackPreviewBox.x + fallbackPreviewBox.width
                && mouse.y >= fallbackPreviewBox.y && mouse.y < fallbackPreviewBox.y + fallbackPreviewBox.height)
            {
            }
            else
            {
                removePreviews();
            }
        }
    });

    const fileName = link.hash.slice(2);
    await loadPageHTML(previewContainer, fileName);
    addEventOnPageLinks(previewContainer);
    
    evt.target.previewPending = false;
}

function addEventOnPageLinks(pageContainer)
{
    const allArticleLinks = pageContainer.querySelectorAll(".page-link");
    [...allArticleLinks].map((e) => {
        e.mouseIn = false;
        e.previewPending = false;

        e.addEventListener("mousemove", (evt) => {
            evt.target.mouseIn = true;
            mouse.x = evt.clientX;
            mouse.y = evt.clientY;
        });

        e.addEventListener("mouseover", popupPreview);

        e.addEventListener("mouseleave", async (evt) => {
            evt.target.mouseIn = false;

            await sleep(300);

            const allPreviews = pageContent.querySelectorAll(".page-preview");
            const previewArray = [...allPreviews];

            if (previewArray.length === 0)
            {
                return false;
            }

            const currentPreview = previewArray[previewArray.length - 1];

            if (evt.target.mouseIn || currentPreview.mouseIn)
            {
                return false;
            }

            const previewBox = currentPreview.getBoundingClientRect();

            if (evt.clientX >= previewBox.x && evt.clientX < previewBox.x + previewBox.width
                && evt.clientY >= previewBox.y && evt.clientY < previewBox.y + previewBox.height)
            {

            }
            else
            {
                currentPreview.parentNode.removeChild(currentPreview);
            }
        });
    });
}

// Table of content
function updateTOC()
{
    tocList.querySelector("ul").innerHTML = '';

    const allTitles = article.querySelectorAll("h1, h2, h3, h4, h5, h6");
    [...allTitles].map((e) => {
        const item = document.createElement("li");
        item.classList.add("toc-item-" + e.localName.toLowerCase());
        item.innerHTML = e.innerHTML;

        tocList.querySelector("ul").appendChild(item);
    });
}

// Navbar events
window.addEventListener("load", () => {
    navbar.querySelector("#nav-homepage").addEventListener("click", () => {
        window.location.href = "#/pages/homepage";
    });

    navbar.querySelector("#nav-pages").addEventListener("click", () => {
        const extend = leftCol.querySelector("#extend-pages");
        extend.classList.toggle("menu-active");
    });

    if (isMobile)
    {
        window.addEventListener("touchstart", (evt) => {
            if (isMinUI)
            {
                const touch = evt.touches[0];
                mouse.x = touch.clientX;
                mouse.y = touch.clientY;
            }
        });

        window.addEventListener("touchend", (evt) => {
            if (isMinUI)
            {
                if (mouse.x > window.innerWidth * 0.7)
                {
                    const extend = leftCol.querySelector("#extend-pages");
                    extend.classList.remove("menu-active");
                }
            }
        });
    }
    else
    {
        window.addEventListener("mouseup", (evt) => {
            if (isMinUI)
            {
                if (evt.clientX > window.innerWidth * 0.7)
                {
                    const extend = leftCol.querySelector("#extend-pages");
                    extend.classList.remove("menu-active");
                }
            }
        });
    }
});

// Rooter
window.addEventListener("load", async () => {
    if (!isMobile)
    {
        destroyPreviews();
        removePreviews();
    }

    const fileName = window.location.hash.slice(2) || 'pages/homepage';
    
    await loadPageHTML(article, fileName);

    if (!isMobile)
    {
        addEventOnPageLinks(article);
    }

    updateTOC();
});

window.addEventListener("hashchange", async () => {
    if (!isMobile)
    {
        destroyPreviews();
        removePreviews();
    }

    const fileName = window.location.hash.slice(2) || 'pages/homepage';
    
    await loadPageHTML(article, fileName);

    if (!isMobile)
    {
        addEventOnPageLinks(article);
    }

    updateTOC();
});

// PWA service worker
if ("serviceWorker" in navigator)
{
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then((res) => console.log("serviceWorker ok"))
            .catch((err) => console.log("serviceWorker not ok"));
    });
}

// PWA mobile scroll fix
window.addEventListener("touchend", () => {
    window.scrollTo(0,0)
});
