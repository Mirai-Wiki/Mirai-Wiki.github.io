window.history.scrollRestoration = "manual";

const ARTICLE_KEY = "article-scroll-y";
const MENU_KEY = "menu-scroll-y";

const pageContent = document.querySelector("#page-content");
const leftCol = document.querySelector("#page-content-left-column");
const article = document.querySelector("#page-content-center-column");
const menu = document.querySelector(".page-name-container");
const searchBar = document.querySelector(".search-bar");
const searchResult = document.querySelector(".search-result-container");
const tocList = document.querySelector(".toc-container");

const isMobile = window.matchMedia("(any-hover: none)").matches;

// Position menu
leftCol.style = `left: ${article.offsetLeft - leftCol.offsetWidth}px;`;
window.addEventListener("resize", () => {
    leftCol.style = `left: ${article.offsetLeft - leftCol.offsetWidth}px;`;
});

// Manage scrolling
article.addEventListener("scroll", (evt) => {
    window.sessionStorage.setItem(ARTICLE_KEY, evt.target.scrollTop);
});

menu.addEventListener("scroll", (evt) => {
    window.sessionStorage.setItem(MENU_KEY, evt.target.scrollTop);
});

window.addEventListener("load", () => {
    const articleScrollY = sessionStorage.getItem(ARTICLE_KEY) || 0;
    const menuScrollY = sessionStorage.getItem(MENU_KEY) || 0;

    article.scrollTo(0, articleScrollY);
    menu.scrollTo(0, menuScrollY);
});

// Load menu (json)
window.addEventListener("load", async () => {
    const res = await fetch("data.json");
    const states = await res.json();

    states.forEach((value) => {
        const element = document.createElement("li");
        element.classList.add("page-name-item");
        element.innerHTML = value.name.french;

        menu.querySelector("ol").appendChild(element);
    });
});

// Searching
window.addEventListener("click", () => {
    searchResult.hidden = true;
});

searchBar.addEventListener("input", () => {
    const allPages = menu.querySelectorAll(".page-name-item");
    const lstPages = [...allPages].map(e=>e.innerHTML);

    if (searchBar.value.length > 0)
    {
        searchResult.hidden = false;
        const rect = searchBar.getBoundingClientRect();
        const posX = rect.x + 20;
        const posY = rect.y + 20;
        searchResult.style.left = `${posX}px`;
        searchResult.style.top = `${posY}px`;

        let matches = lstPages.filter((state) => {
            const regex = new RegExp(searchBar.value, "gi");
            return state.match(regex);
        });

        if (matches.length > 0)
        {
            const html = matches.map(match => `
                <p><a href=${match}.html>${match}</a></p>
            `).join('');

            searchResult.innerHTML = html;
        }
        else
        {
            searchResult.innerHTML = "<p>No result...</p>";
        }
    }
    else
    {
        searchResult.hidden = true;
        searchResult.innerHTML = '';
    }
});

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

// Rooter
window.addEventListener("load", async () => {
    destroyPreviews();
    removePreviews();
    const fileName = window.location.hash.slice(2) || 'homepage';
    
    await loadPageHTML(article, fileName);

    if (!isMobile)
    {
        addEventOnPageLinks(article);
    }

    updateTOC();
});
window.addEventListener("hashchange", async () => {
    destroyPreviews();
    removePreviews();
    const fileName = window.location.hash.slice(2) || 'homepage';
    
    await loadPageHTML(article, fileName);

    if (!isMobile)
    {
        addEventOnPageLinks(article);
    }

    updateTOC();
});

