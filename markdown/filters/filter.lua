function Link(el)
    if string.sub(el.target, 1, 6) == "pages/" then
        el.target = "#/" .. el.target
    else
        el.target = "#/pages/" .. el.target
    end

    el.target = el.target:match("(.+)%..+$")

    el.attributes.class = "page-link"
    return el
end

function Image(img)
    img.src = "./images/" .. img.src
    return img 
end

function Div(el)
    if el.classes:includes("info") then
        local info = pandoc.Div("Info")
        info.attributes.class = "header"
        table.insert(el.content, 1, info)
    end

    return el
end
