
// Radio Name on TAB
const RADIO_NAME = 'WRCJ Radio';

// SELECT ARTWORK PROVIDER, ITUNES, DEEZER & SPOTIFY  eg : spotify 
var API_SERVICE = 'deezer';

// Change Stream URL Here, Supports, ICECAST, ZENO, SHOUTCAST, RADIOJAR ETC.... DOES NOT SUPPORT HLS
const URL_STREAMING = 'https://wrcj.streamguys1.com/live.aac';

//NOW PLAYING API.
const API_URL = 'https://wrcj.streamguys1.com/status-json.xsl';

// Visit https://api.vagalume.com.br/docs/ to get your API key
const API_KEY = "18fe07917957c289983464588aabddfb";

window.onload = function () {
    var page = new Page;
    page.changeTitlePage();
    page.setVolume();
    window.addEventListener("load", showDeezerCoverArt); //Loads the javascript cover art overlay, Does not replace cover.jpg
    showDeezerCoverArt(); // Calls Function

    var player = new Player();
    player.play();

    getStreamingData();
    // Interval to get streaming data in miliseconds
    setInterval(function () {
        showDeezerCoverArt(); // Refresh Cover art
        getStreamingData();
    }, 10000);

    var coverArt = document.getElementsByClassName('cover-album')[0];

    coverArt.style.height = coverArt.offsetWidth + 'px';
}

// DOM control
function Page() {
    this.changeTitlePage = function (title = RADIO_NAME) {
        document.title = title;
    };

    this.refreshCurrentSong = function (song, artist) {
        var currentSong = document.getElementById('currentSong');
        var currentArtist = document.getElementById('currentArtist');

        if (song !== currentSong.innerHTML) {
            // Animate transition
            currentSong.className = 'animated flipInY text-uppercase';
            currentSong.innerHTML = song;

            currentArtist.className = 'animated flipInY text-capitalize';
            currentArtist.innerHTML = artist;

            // Refresh modal title
             document.getElementById('lyricsSong').innerHTML = song + ' - ' + artist;

            // Remove animation classes
            setTimeout(function () {
                currentSong.className = 'text-uppercase';
                currentArtist.className = 'text-capitalize';
            }, 2000);
        }
    }

    this.refreshHistoric = function (info, n) {
        var $historicDiv = document.querySelectorAll('#historicSong article');
        var $songName = document.querySelectorAll('#historicSong article .music-info .song');
        var $artistName = document.querySelectorAll('#historicSong article .music-info .artist');

        // Default cover art
        var urlCoverArt = 'img/cover.png';

        // Get cover art for song history - Updated to handle .xsl
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var data = JSON.parse(this.responseText);
                var artwork = data.results.artwork;
                 var artworkXL = artwork.large;

                document.querySelectorAll('#historicSong article .cover-historic')[n].style.backgroundImage = 'url(' + artworkXL + ')';
            }
            // Formating characters to UTF-8
            var music = info.song.replace(/&apos;/g, '\'');
            var songHist = music.replace(/&amp;/g, '&');

            var artist = info.artist.replace(/&apos;/g, '\'');
            var artistHist = artist.replace(/&amp;/g, '&');

            $songName[n].innerHTML = songHist;
            $artistName[n].innerHTML = artistHist;

            // Add class for animation
            $historicDiv[n].classList.add('animated');
            $historicDiv[n].classList.add('slideInRight');
        }
        xhttp.open('GET', 'https://wrcj.streamguys1.com/status-json.xsl' + info.artist + ' ' + info.song);
        xhttp.send();

        setTimeout(function () {
            for (var j = 0; j < 2; j++) {
                $historicDiv[j].classList.remove('animated');
                $historicDiv[j].classList.remove('slideInRight');
            }
        }, 2000);
    }

    this.refreshCover = function (song = '', artist) {
        // Default cover art
        var urlCoverArt = 'img/cover.png';

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            var coverArt = document.getElementById('currentCoverArt');
            var coverBackground = document.getElementById('bgCover');

            // Get cover art URL on iTunes API - NOT USED
            if (this.readyState === 4 && this.status === 200) {
                var data = JSON.parse(this.responseText);
                var artworkUrl100 = data.results;
                var urlCoverArt = artworkUrl100.artwork.medium;

                coverArt.style.backgroundImage = 'url(' + urlCoverArt + ')';
                coverArt.className = 'animated bounceInLeft';

                coverBackground.style.backgroundImage = 'url(' + urlCoverArt + ')';

                setTimeout(function () {
                    coverArt.className = '';
                }, 2000);

                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: song,
                        artist: artist,
                        artwork: [{
                                src: urlCoverArt,
                                sizes: '96x96',
                                type: 'image/png'
                            },
                            {
                                src: urlCoverArt,
                                sizes: '128x128',
                                type: 'image/png'
                            },
                            {
                                src: urlCoverArt,
                                sizes: '192x192',
                                type: 'image/png'
                            },
                            {
                                src: urlCoverArt,
                                sizes: '256x256',
                                type: 'image/png'
                            },
                            {
                                src: urlCoverArt,
                                sizes: '384x384',
                                type: 'image/png'
                            },
                            {
                                src: urlCoverArt,
                                sizes: '512x512',
                                type: 'image/png'
                            }
                        ]
                    });
                }
            }
        }
        xhttp.open('GET', 'https://prod-api.radioapi.me/1ceb9727-3e36-4e64-99e7-f776b50c7f4f/musicsearch?query=' + artist + ' ' + song); // NOT USED
        xhttp.send();
    }

    this.changeVolumeIndicator = function (volume) {
        document.getElementById('volIndicator').innerHTML = volume;

        if (typeof (Storage) !== 'undefined') {
            localStorage.setItem('volume', volume);
        }
    }

    this.setVolume = function () {
        if (typeof (Storage) !== 'undefined') {
            var volumeLocalStorage = (!localStorage.getItem('volume')) ? 80 : localStorage.getItem('volume');
            document.getElementById('volume').value = volumeLocalStorage;
            document.getElementById('volIndicator').innerHTML = volumeLocalStorage;
        }
    }
    //Unused Funtion
    this.refreshLyric = function (currentSong, currentArtist) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var data = JSON.parse(this.responseText);

                var openLyric = document.getElementsByClassName('lyrics')[0];

                if (data.type === 'exact' || data.type === 'aprox') {
                    var lyric = data.mus[0].text;

                    document.getElementById('lyric').innerHTML = lyric.replace(/\n/g, '<br />');
                    openLyric.style.opacity = "1";
                    openLyric.setAttribute('data-toggle', 'modal');
                } else {
                    openLyric.style.opacity = "0.3";
                    openLyric.removeAttribute('data-toggle');

                    var modalLyric = document.getElementById('modalLyrics');
                    modalLyric.style.display = "none";
                    modalLyric.setAttribute('aria-hidden', 'true');
                    (document.getElementsByClassName('modal-backdrop')[0]) ? document.getElementsByClassName('modal-backdrop')[0].remove(): '';
                }
            } else {
                document.getElementsByClassName('lyrics')[0].style.opacity = "0.3";
                document.getElementsByClassName('lyrics')[0].removeAttribute('data-toggle');
            }
        }
        xhttp.open('GET', 'https://api.vagalume.com.br/search.php?apikey=' + API_KEY + '&art=' + currentArtist + '&mus=' + currentSong.toLowerCase(), true);
        xhttp.send()
    }
}

var audio = new Audio(URL_STREAMING);

// Player control
function Player() {
    this.play = function () {
        audio.play();

        var defaultVolume = document.getElementById('volume').value;

        if (typeof (Storage) !== 'undefined') {
            if (localStorage.getItem('volume') !== null) {
                audio.volume = intToDecimal(localStorage.getItem('volume'));
            } else {
                audio.volume = intToDecimal(defaultVolume);
            }
        } else {
            audio.volume = intToDecimal(defaultVolume);
        }
        document.getElementById('volIndicator').innerHTML = defaultVolume;
    };

    this.pause = function () {
        audio.pause();
    };
}

// On play, change the button to pause
audio.onplay = function () {
    var botao = document.getElementById('playerButton');
    var bplay = document.getElementById('buttonPlay');
    if (botao.className === 'fa fa-play') {
        botao.className = 'fa fa-pause';
        bplay.firstChild.data = 'PAUSE';
    }
}

// On pause, change the button to play
audio.onpause = function () {
    var botao = document.getElementById('playerButton');
    var bplay = document.getElementById('buttonPlay');
    if (botao.className === 'fa fa-pause') {
        botao.className = 'fa fa-play';
        bplay.firstChild.data = 'PLAY';
    }
}

// Unmute when volume changed
audio.onvolumechange = function () {
    if (audio.volume > 0) {
        audio.muted = false;
    }
}

audio.onerror = function () {
    var confirmacao = confirm('Stream Down / Network Error. \nClick OK to try again.');

    if (confirmacao) {
        window.location.reload();
    }
}

document.getElementById('volume').oninput = function () {
    audio.volume = intToDecimal(this.value);

    var page = new Page();
    page.changeVolumeIndicator(this.value);
}

function togglePlay() {
    if (!audio.paused) {
        audio.pause();
    } else {
        audio.load();
        audio.play();
    }
}

function volumeUp() {
    var vol = audio.volume;
    if(audio) {
        if(audio.volume >= 0 && audio.volume < 1) {
            audio.volume = (vol + .01).toFixed(2);
        }
    }
}

function volumeDown() {
    var vol = audio.volume;
    if(audio) {
        if(audio.volume >= 0.01 && audio.volume <= 1) {
            audio.volume = (vol - .01).toFixed(2);
        }
    }
}

function mute() {
    if (!audio.muted) {
        document.getElementById('volIndicator').innerHTML = 0;
        document.getElementById('volume').value = 0;
        audio.volume = 0;
        audio.muted = true;
    } else {
        var localVolume = localStorage.getItem('volume');
        document.getElementById('volIndicator').innerHTML = localVolume;
        document.getElementById('volume').value = localVolume;
        audio.volume = intToDecimal(localVolume);
        audio.muted = false;
    }
}
// Changing this much breaks the entire app
function getStreamingData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            if (this.response.length === 0) {
                console.log('%cdebug', 'font-size: 22px');
            }

            var data = JSON.parse(this.responseText);
            console.log('Received data:', data); // Add this line for debugging

            var page = new Page();

            // Formating characters to UTF-8
            let song = data.song ? data.song.replace(/&apos;/g, '\'') : '';
            let artist = data.artist ? data.artist.replace(/&apos;/g, '\'') : '';

            // Change the title
            document.title = song + ' - ' + artist + ' | ' + RADIO_NAME;
            
                var currentSongElement = document.getElementById('currentSong');
                if (currentSongElement && currentSongElement.innerHTML !== song) {
                page.refreshCover(song, artist);
               page.refreshCurrentSong(song, artist);
                //Unused: page.refreshLyric(song, artist);

                for (var i = 0; i < 2; i++) {
                    page.refreshHistoric(data.history[i], i);
                }
            }
        }
    };

    var d = new Date();

    // Requisition with timestamp to prevent cache on mobile devices
    xhttp.open('GET', API_URL);
    xhttp.send();
}

// Player control by keys
document.addEventListener('keydown', function (k) {
    var k = k || window.event;
    var key = k.keyCode || k.which;
    
    var slideVolume = document.getElementById('volume');

    var page = new Page();

    switch (key) {
        // Arrow up
        case 38:
            volumeUp();
            slideVolume.value = decimalToInt(audio.volume);
            page.changeVolumeIndicator(decimalToInt(audio.volume));
            break;
        // Arrow down
        case 40:
            volumeDown();
            slideVolume.value = decimalToInt(audio.volume);
            page.changeVolumeIndicator(decimalToInt(audio.volume));
            break;
        // Spacebar
        case 32:
            togglePlay();
            break;
        // P
        case 80:
            togglePlay();
            break;
        // M
        case 77:
            mute();
            break;
        // 0
        case 48:
            audio.volume = 0;
            slideVolume.value = 0;
            page.changeVolumeIndicator(0);
            break;
        // 0 numeric keyboard
        case 96:
            audio.volume = 0;
            slideVolume.value = 0;
            page.changeVolumeIndicator(0);
            break;
        // 1
        case 49:
            audio.volume = .1;
            slideVolume.value = 10;
            page.changeVolumeIndicator(10);
            break;
        // 1 numeric key
        case 97:
            audio.volume = .1;
            slideVolume.value = 10;
            page.changeVolumeIndicator(10);
            break;
        // 2
        case 50:
            audio.volume = .2;
            slideVolume.value = 20;
            page.changeVolumeIndicator(20);
            break;
        // 2 numeric key
        case 98:
            audio.volume = .2;
            slideVolume.value = 20;
            page.changeVolumeIndicator(20);
            break;
        // 3
        case 51:
            audio.volume = .3;
            slideVolume.value = 30;
            page.changeVolumeIndicator(30);
            break;
        // 3 numeric key
        case 99:
            audio.volume = .3;
            slideVolume.value = 30;
            page.changeVolumeIndicator(30);
            break;
        // 4
        case 52:
            audio.volume = .4;
            slideVolume.value = 40;
            page.changeVolumeIndicator(40);
            break;
        // 4 numeric key
        case 100:
            audio.volume = .4;
            slideVolume.value = 40;
            page.changeVolumeIndicator(40);
            break;
        // 5
        case 53:
            audio.volume = .5;
            slideVolume.value = 50;
            page.changeVolumeIndicator(50);
            break;
        // 5 numeric key
        case 101:
            audio.volume = .5;
            slideVolume.value = 50;
            page.changeVolumeIndicator(50);
            break;
        // 6 
        case 54:
            audio.volume = .6;
            slideVolume.value = 60;
            page.changeVolumeIndicator(60);
            break;
        // 6 numeric key
        case 102:
            audio.volume = .6;
            slideVolume.value = 60;
            page.changeVolumeIndicator(60);
            break;
        // 7
        case 55:
            audio.volume = .7;
            slideVolume.value = 70;
            page.changeVolumeIndicator(70);
            break;
        // 7 numeric key
        case 103:
            audio.volume = .7;
            slideVolume.value = 70;
            page.changeVolumeIndicator(70);
            break;
        // 8
        case 56:
            audio.volume = .8;
            slideVolume.value = 80;
            page.changeVolumeIndicator(80);
            break;
        // 8 numeric key
        case 104:
            audio.volume = .8;
            slideVolume.value = 80;
            page.changeVolumeIndicator(80);
            break;
        // 9
        case 57:
            audio.volume = .9;
            slideVolume.value = 90;
            page.changeVolumeIndicator(90);
            break;
        // 9 numeric key
        case 105:
            audio.volume = .9;
            slideVolume.value = 90;
            page.changeVolumeIndicator(90);
            break;
    }
});

function intToDecimal(vol) {
    return vol / 100;
}

function decimalToInt(vol) {
    return vol * 100;
}
//Script to Record and save recent tracks - Image is not saved. 
let recentTracks = [];

function loadRecentTracks() {
    const stored = localStorage.getItem("recentTracks");
    if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        // Filter out tracks older than 7 days
        recentTracks = parsed.filter(item => now - item.timestamp < 7 * 24 * 60 * 60 * 1000);
        updateRecentTracksUI();
    }
}

function saveRecentTracks() {
    localStorage.setItem("recentTracks", JSON.stringify(recentTracks));
}
//Main Function to update Title with yp_currently_playing from the .xsl
function updateNowPlaying() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            try {
                var data = JSON.parse(this.responseText);
                let source = data.icestats.source;
                let currentlyPlaying = Array.isArray(source)
                    ? source[0].yp_currently_playing
                    : source.yp_currently_playing;

                if (!currentlyPlaying) return;

                document.getElementById("customNowPlaying").innerText = currentlyPlaying;

                if (recentTracks.length === 0 || recentTracks[0].track !== currentlyPlaying) {
                    recentTracks.unshift({
                        track: currentlyPlaying,
                        timestamp: Date.now()
                    });
                    if (recentTracks.length > 5) recentTracks.pop();
                    saveRecentTracks();
                    updateRecentTracksUI();
                }
            } catch (e) {
                console.error("Error parsing JSON:", e);
                document.getElementById("customNowPlaying").innerText = "Error loading track info.";
            }
        }
    };
    xhttp.open("GET", "https://wrcj.streamguys1.com/status-json.xsl", true);
    xhttp.send();
}
function updateRecentTracksUI() {
    const list = document.getElementById("recentTracksList");
    list.innerHTML = "";

    recentTracks.slice(1).forEach(item => {
        const li = document.createElement("li");

        const timeAgo = getTimeAgo(item.timestamp);
        li.textContent = `${item.track} (${timeAgo})`;

        list.appendChild(li);
    });
}
//Timestamp for recent tracks
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `just now`;
}
// Function to overlay the Cover.png instead of replacing - When no image is found cover.png will be visiable. 
function showDeezerCoverArt() {
    const streamUrl = "https://wrcj.streamguys1.com/status-json.xsl";

    fetch(streamUrl)
        .then(response => response.json())
        .then(data => {
            let source = data.icestats.source;
            let currentlyPlaying = Array.isArray(source)
                ? source[0].yp_currently_playing
                : source.yp_currently_playing;

            if (!currentlyPlaying) return;

            const query = encodeURIComponent(currentlyPlaying);
            const deezerUrl = `https://api.deezer.com/search?q=${query}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(deezerUrl)}`;

            fetch(proxyUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.data && data.data.length > 0) {
                        const existingOverlay = document.getElementById('deezerOverlay');
                        if (existingOverlay) existingOverlay.remove();
                        const albumCover = data.data[0].album.cover_medium;
                        const target = document.getElementById("currentCoverArt");
                        if (!target) return;

                        const rect = target.getBoundingClientRect();
                        const img = document.createElement("img");
                        img.id = 'deezerOverlay';
                        img.src = albumCover;
                        img.style.position = "absolute";
                        img.style.top = `${rect.top + window.scrollY}px`;
                        img.style.left = `${rect.left + window.scrollX}px`;
                        img.style.width = `${rect.width}px`;
                        img.style.height = `${rect.height}px`;
                        img.style.border = "none";
                        img.style.borderRadius = "8px";
                        img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
                        //img.style.opacity = "0";
                        //img.style.transition = "opacity 0.5s ease-in-out";
                        img.style.zIndex = 9999;
                        img.style.pointerEvents = "none"; // so it doesn't block clicks

                        document.body.appendChild(img);
                        //requestAnimationFrame(() => { img.style.opacity = '1'; });
                    } else {
                        console.log("No album art found for:", currentlyPlaying);
                    }
                })
                .catch(error => {
                    console.error("Error fetching album art from Deezer:", error);
                });
        })
        .catch(error => {
            console.error("Error fetching stream metadata:", error);
        });
}

// Load from localStorage on page load
loadRecentTracks();
updateNowPlaying();
setInterval(updateNowPlaying, 30000);

