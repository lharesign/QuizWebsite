function darkMode () {

    var darkSwitch = $("#toggle-switch").is(":checked")
    
    if(darkSwitch === true) {
        $("link[rel=stylesheet]").attr({href : "dark-style.css"});
    } else {
        $("link[rel=stylesheet]").attr({href : "light-style.css"});
    }
    
    console.log(darkSwitch)
}