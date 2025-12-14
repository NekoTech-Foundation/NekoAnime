
// RPC Activity Logic
let currentPath = "";
let rpcInterval = null;

function updateRPC() {
    const path = window.location.pathname;
    let activity = null;

    if (path === '/') {
        activity = {
            details: "Browsing Home",
            state: "Looking for something to watch",
            assets: {
                large_image: "neko_logo", 
                large_text: "NekoAnime"
            }
        };
    } else if (path.includes('/watch/')) {
        // Scrape details from page
        // Tries to find common metadata selectors. Refine based on actual DOM.
        const titleElement = document.querySelector('h1') || document.querySelector('.anime-title') || document.title;
        const episodeElement = document.querySelector('.current-episode') || document.querySelector('.episode-number');
        
        let title = titleElement ? (titleElement.innerText || titleElement.textContent).replace('Watch ', '').trim() : "Unknown Anime";
        // Clean up title if it contains "Episode"
        if (title.indexOf('Episode') > 0) {
            title = title.substring(0, title.indexOf('Episode')).trim();
        }

        let state = "Watching Anime";
        
        // Check video state
        const video = document.querySelector('video');
        if (video) {
            if (!video.paused) {
                 const timeLeft = (video.duration - video.currentTime) * 1000;
                 if (!isNaN(timeLeft) && timeLeft > 0) {
                     activity = {
                        details: `Watching ${title}`,
                        state: "Playing",
                        timestamps: {
                            end: Date.now() + timeLeft
                        },
                        assets: {
                            large_image: "neko_logo",
                            large_text: "NekoAnime",
                            small_image: "play_icon",
                            small_text: "Playing"
                        }
                     };
                 }
            } else {
                 state = "Paused";
            }
        }
        
        if (!activity) {
            activity = {
                details: `Watching ${title}`,
                state: state,
                assets: {
                    large_image: "neko_logo",
                    large_text: "NekoAnime"
                }
            };
        }
    } else if (path.includes('/anime/')) {
        const title = document.title.replace('NekoAnime - ', '').trim();
         activity = {
            details: "Viewing details",
            state: title,
            assets: {
                large_image: "neko_logo",
                large_text: "NekoAnime"
            }
        };
    } else {
         activity = {
            details: "Browsing NekoAnime",
            state: "Exploring",
            assets: {
                large_image: "neko_logo",
                large_text: "NekoAnime"
            }
        };
    }

    if (activity) {
        chrome.runtime.sendMessage({
            type: "NEKO_RPC_UPDATE",
            payload: activity
        });
    }
}

// Start Monitoring
setInterval(updateRPC, 5000); // Poll every 5 seconds
updateRPC();
