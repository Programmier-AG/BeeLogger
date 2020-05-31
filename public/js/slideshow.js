slide = 0
setInterval(() => {
    if(slide < 3) {
        slide++;
    } else {
        slide = 1
    }
    
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#slide-" + slide).offset().top
    }, 2000);
}, 5000);