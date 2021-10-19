function categories() {
    $.getJSON("snippets/categories.json", function(json) {
        console.log(json);
    });
}