// Speech API class
window.speechRecognition = window.speechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.webkitSpeechRecognition;
// Speech script
var finalTranscript = '';
// Speech service flag
var recognizing = false;

// Start Speech Search
function speechSearch() {
    if (recognizing == true) {
        recognition.stop();
        return;
    }
    finalTranscript = '';
    recognition.start();
}

/*
var lat = 0;
var log = 0;
// if Naigation API is supported
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function(p) {
            lat = p.coords.latitude;
            log = p.coords.longitude;
        },
        function(err) {
        }
    );
} 
*/

// If Speech API supported by browser
if (window.speechRecognition == undefined) {
    $('.search-speech').hide();
} else {
    var recognition = new speechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    //recognition.maxAlternatives = 5;
    recognition.interimResults = true;

    recognition.onstart = function() {
        console.log('starting...');
        recognizing = true;
        $('.speech-box .speech-text').text('Initializing...');
    };
    recognition.onaudiostart = function() {
        console.log('starting audio...');
        $('.speech-box .speech-icon').addClass('pulse');
        $('.speech-box .speech-text').text('Speak now...');
    };
    recognition.onsoundstart = function() {
        console.log('starting sound...');
    };
    recognition.onspeechstart = function() {
        console.log('starting speech...');
    };
    recognition.onspeechend = function() {
        console.log('ending speech...');
    };
    recognition.onsoundend = function() {
        console.log('ending sound...');
    };
    recognition.onaudioend = function() {
        console.log('ending audio...');
    };

    recognition.onerror = function(e) {
        console.log('error: ', e.error);
    };

    recognition.onend = function() {
        console.log('end..');
        recognizing = false;
        $('.speech-box .speech-icon').removeClass('pulse');
        if (!finalTranscript.trim().length) {
            $('.speech-box .speech-text').html('Didn\'t recognize,<br><a class="speech-try-again" href="javascript:void(0)">Try again...</a>');
        } else {
            $('.speech-box .speech-text').text(finalTranscript);
            $('.speech-search-wrapper').hide();
            $('.search-box').find('input[name=tts]').val(finalTranscript);
            callSaaSWithQuery(finalTranscript);
        }

    };

    recognition.onresult = function(e) {
        var interimTranscript = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
                finalTranscript += e.results[i][0].transcript;
            } else {
                interimTranscript += e.results[i][0].transcript;
            }
        }
        console.log(finalTranscript);
    };
}

function callSaaSWithQuery(tts, xhr, cb) {
    if (!xhr) {
        //$('form[name=f]').find('input[name=lat]').val(lat);
        //$('form[name=f]').find('input[name=log]').val(log);
        $('form[name=f]')[0].submit();
        return;
    }
    var d = $('form[name=f]').serialize() + '&xhr=1';
    var reqObj = {
        url: '/search',
        data: d
    };
    if (cb) {
        reqObj.success = cb;
    }
    $.ajax(reqObj);
}

(function attachEvents() {
    $('form[name=f]').on('submit', function(e) {
        e.preventDefault();
        //this.submit();
    });
    $('.search-box')
    .on('focus', '.search-input input[name=tts]', function(e) {
        e.stopPropagation();
        $(this)
        .closest('.search-box')
        .addClass('focus');
        this.selectionStart = this.selectionEnd = this.value.length;
    })
    .on('blur', '.search-input input[name=tts]', function(e) {
        e.stopPropagation();
        $(this)
        .closest('.search-box')
        .removeClass('focus');
    })
    .find('input[name=tts]')
    .focus();

    $('.search-box')
    .on('keypress', 'input[name=tts]', function(e) {
        var tts = $(this).val().trim();
        if (e.keyCode == 13 && tts.length) {
            callSaaSWithQuery(tts);
        }
    })
    .on('click', '.search-btn', function(e) {
        var tts = $('.search-box input[name=tts]').val().trim();
        if (tts.length) {
            callSaaSWithQuery(tts);
        }
    })
    .on('click', '.search-speech', function(e) {
        if (!'webkitSpeechRecognition' in window) {
            alert('Speech not supported, please update you browser');
            return;
        }
        if ($('.speech-search-wrapper').css('display') == 'none') { 
            $('.speech-search-wrapper').show();
        }
        speechSearch();
    });

    $('.speech-search-wrapper')
    .on('click', 'span.close', function(e) {
        recognition.stop();
        $(this).closest('.speech-search-wrapper').hide();
    })
    .on('click', '.speech-try-again', function(e) {
        speechSearch();
    });
})();

