// Countdown Timer
const launchDate = new Date("2025-01-01T00:00:00Z").getTime(); // Ensure UTC format
const timerElement = document.getElementById("countdown-timer");

function updateCountdown() {
    const now = new Date().getTime(); // Get current time in milliseconds
    const timeLeft = launchDate - now; // Calculate the time difference

    if (timeLeft <= 0) {
        // If the timer has reached zero
        timerElement.textContent = "We are live!";
        clearInterval(timerInterval); // Stop the timer
        return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Update the countdown timer display
    timerElement.textContent = `Launching in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Update the timer every second
const timerInterval = setInterval(updateCountdown, 1000);

// Initialize countdown immediately
updateCountdown();
