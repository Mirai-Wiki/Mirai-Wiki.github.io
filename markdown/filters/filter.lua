function Link(el)
    el.target = "#/pages/" .. el.target
    el.attributes.class = "page-link"
    return el
end

function Image(img)
    img.src = "./images/" .. img.src
    return img 
end
