// Attention-grabbing features
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // User has left the page
        setTimeout(function() {
            if (document.hidden) {
                // Show notification after 10 seconds
                showAttentionNotification();
            }
        }, 10000);
    }
});

function showAttentionNotification() {
    // Get random attention-grabbing action
    const actions = [
        {
            title: "Fuel Savings Alert",
            message: "Save up to 40% on fuel costs with LPG conversion!",
            icon: "⛽"
        },
        {
            title: "Free Diagnosis",
            message: "Book a free vehicle diagnosis today!",
            icon: "🔧"
        },
        {
            title: "LPG Conversion",
            message: "Transform your vehicle with our expert LPG conversion service!",
            icon: "⚡"
        },
        {
            title: "Maintenance Reminder",
            message: "Time for your LPG system check-up?",
            icon: "🔍"
        }
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    // Check if browser supports notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }

    // Request permission if needed
    if (Notification.permission === "granted") {
        showNotification(randomAction);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                showNotification(randomAction);
            }
        });
    }
}

function showNotification(action) {
    const notification = new Notification(action.title, {
        body: action.message,
        icon: "images/website Logo.png",
        badge: "images/website Logo.png"
    });

    // Add click handler to focus the window
    notification.onclick = function() {
        window.focus();
        this.close();
    };
}

// Add favicon
function updateFavicon() {
    const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
    favicon.type = 'image/x-icon';
    favicon.rel = 'shortcut icon';
    favicon.href = 'images/website Logo.png';
    document.getElementsByTagName('head')[0].appendChild(favicon);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateFavicon();
}); 