/*
// Get the modal
var container = document.querySelector(".container");

// Get the button that opens the modal
var btn = document.getElementsByClassName("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close");

container.addEventListener("click", function(e) {
    console.log(e)
})

( function() {
    var main = document.querySelector("#main");

    window.addEventListener("resize", function() {
        console.log("i have been resized");
        var height = ( window.innerHeight - 248 );
        height = height + "px";
        console.log(height)
        main.style.height  = height;
    })
    
    var height = ( window.innerHeight - 248 );
    height = height + "px";
    console.log(height)
    
    var right = document.querySelector(".groups");
    
    
    // width = (0.1*(width)) + "px";
    
    
    main.style.height  = height;
    // main.style.width  = height;
    //changeWidth(80, main);
    
    function changeWidth(cent, object) {
        var width = window.innerWidth;
        width = (((width*(cent)/100)) + "px");
        console.log(width);
        object.style.width = width;
    }
    
    window.addEventListener("resize " ,function() {
        console.log("log");
        //changeWidth(80, main);
    })
})();

*/
$(function () {
    var socket = io.connect();
    $("form.mesForm button").on('click', function (e) {
        e.preventDefault();
        var value = $("form.mesForm input[name= \"message\"] ").val();
        var len = value.length;
        if (len > 0) {
            console.log(value)
            socket.emit('send message', 'lol')
        }
    })
    socket.on('new message', function (data) {
        console.log(data)
    })
})