$(document).ready(function () {
    $('#patch-bank-controller').children(".patch").on('click', function() {
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
        globalParameters.color = $(this).css("background-color");
        $('#gradient-background').css('left', `-${$(this).index() * 200}%`);
    });

    $('header #navbar-trigger').on('click', function () {
        $('#navbar-side-panel').css('left', '0px');
    });

    $('header #mute-button-trigger').toggle(function () {
        $(this).html('volume_mute');
    }, function () {
        $(this).html('volume_up');
    });

    $('#fullscreen-toggle').on('click', function() {
        if ($(this).is(':checked')) {
            openFullscreen();
        } else {
            closeFullscreen();
        }
    });

    $('#hide-controls-toggle').on('click', function () {
        $('#controller-container').toggleClass('invisible');
    });

    $('#show-info-toggle').on('click', function () {
        $('#info-container').toggleClass('invisible');
    });

    $('#octave-mode-toggle').on('click', function () {
        $('#note-octave-info').toggleClass('hidden');
        $('#note-full-info').toggleClass('hidden');
    });

    $('#navbar-side-panel #close-button').on('click', function () {
        $('#navbar-side-panel').css('left', '-350px');
    });

    $('#navbar-side-panel #octave-picker .plus').on('click', function() {
        handleNumberBoxEvent(this, 7, value => value + 1);
    });

    $('#navbar-side-panel #octave-picker .minus').on('click', function() {
        handleNumberBoxEvent(this, 1, value => value - 1);
    });

    $('#navbar-side-panel #speed-picker .plus').on('click', function() {
        handleNumberBoxEvent(this, 10, value => value + 1);
    });

    $('#navbar-side-panel #speed-picker .minus').on('click', function() {
        handleNumberBoxEvent(this, 1, value => value - 1);
    });

});

function handleNumberBoxEvent(element, valueToCap, operator) {
    let octaveValue = Number.parseInt($(element).siblings('.num-box').html());
    if (octaveValue !== valueToCap) {
        let numberBoxId = $(element).parent().attr('id');
        if (numberBoxId.includes("octave")) {
            globalParameters.currentOctave = operator(octaveValue);
        } else if (numberBoxId.includes("speed")) {
            globalParameters.speed = operator(octaveValue);
        }
        $(element).siblings('.num-box').html(operator(octaveValue));
        $('#octave-info-id').html(operator(octaveValue));
    }
}


function openFullscreen() {
    let e = document.documentElement;
    let requestMethod = e.requestFullscreen || e.mozRequestFullScreen || e.webkitRequestFullscreen || e.msRequestFullscreen;
    if (requestMethod) {
        requestMethod.call(e);
    } else {
        console.error("Fullscreen request failed.");
    }
}

function closeFullscreen() {
    let e = document.documentElement;
    let requestMethod = e.exitFullscreen || e.mozCancelFullScreen || e.webkitExitFullscreen || e.msExitFullscreen;
    if (requestMethod) {
        requestMethod.call(e);
    } else {
        console.error("Exit fullscreen failed.");
    }
}