$(document).ready(function () {

    $('#patch-bank-controller').children(".patch").on('click', function() {
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
        globalParameters.currentPatch = $(this).index();
        globalParameters.color = $(this).css("background-color");
        $('#gradient-background').css('left', `-${$(this).index() * 200}%`);

        // Change patch specific controls
        let childIndex = $(this).index();
        let targetContainer = $(`.patch-specific-widget-container:nth-child(${childIndex + 1})`);
        targetContainer.siblings().addClass("hidden");
        targetContainer.removeClass("hidden");
        initializePatch();
    });

    $('.arpeggiator-button').on('click', function () {
        $(this).toggleClass("arpeggiator-button-active");
    });

    $('header #navbar-trigger').on('click', function() {
        $('#navbar-side-panel').css('left', '0px');
    });

    $('header #mute-button-trigger').on('click', function() {
        if ($(this).html().includes("up")) {
            $(this).html("volume_mute");
        } else {
            $(this).html("volume_up");
        }
    });

    $('#fullscreen-toggle').on('click', function() {
        $(this).is(':checked') ? openFullscreen() : closeFullscreen();
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

    $('#display-waveform-toggle').on('click', function () {
        globalParameters["displayWaveform"] = $(this).is(':checked');
    });

    $('#display-animation-toggle').on('click', function () {
        globalParameters["displayAnimation"] = $(this).is(':checked');
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

    $('#sub-controller-1').on('scroll', function () {
        let scrollIndex = Math.round($(this).scrollLeft() / width) + 1;
        let targetDot = $(`#sub-controller-1-dot-scroller div:nth-child(${scrollIndex})`);
        targetDot.siblings().removeClass("dot-selected");
        targetDot.addClass("dot-selected")
    });

    $('#sub-controller-2').on('scroll', function () {
        let scrollIndex = Math.round($(this).scrollLeft() / width) + 1;
        let targetDot = $(`#sub-controller-2-dot-scroller div:nth-child(${scrollIndex})`);
        targetDot.siblings().removeClass("dot-selected");
        targetDot.addClass("dot-selected")
    });

    $('#sampler-file-selector').change(function () {
        let fileReader = new FileReader();
        fileReader.onload = function (e) {
            createSampler(e.target.result);
        };
        let file = $(this).get(0).files[0];
        fileReader.readAsDataURL(file);
    })
});

function handleNumberBoxEvent(element, valueToCap, operator) {
    let octaveValue = Number.parseInt($(element).siblings('.num-box').html());
    if (octaveValue !== valueToCap) {
        let numberBoxId = $(element).parent().attr('id');
        $(element).siblings('.num-box').html(operator(octaveValue));
        if (numberBoxId.includes("octave")) {
            globalParameters.currentOctave = operator(octaveValue);
            $('#octave-info-id').html(operator(octaveValue));
        } else if (numberBoxId.includes("speed")) {
            globalParameters.speed = operator(octaveValue);
        }
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