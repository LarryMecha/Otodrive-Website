// Booking system functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking system
    initializeBookingSystem();
});

function initializeBookingSystem() {
    // Load available time slots for today by default (optional)
    const dateInput = document.getElementById('bookingDate');
    if (dateInput && dateInput.value) {
        const slots = generateTimeSlots(dateInput.value);
        displayTimeSlots(slots);
    }
    setupBookingForm();
}

function generateTimeSlots(dateStr) {
    const slots = [];
    if (!dateStr) return slots;
    const date = new Date(dateStr);
    const day = date.getDay(); // 0=Sun, 6=Sat

    let startTime = 8;
    let endTime = 17;
    if (day === 6) { // Saturday
        endTime = 12;
    } else if (day === 0) { // Sunday
        return slots; // No slots on Sunday
    }

    const interval = 30; // 30 minutes
    for (let hour = startTime; hour < endTime; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push({
                time: time,
                available: true
            });
        }
    }
    return slots;
}

function displayTimeSlots(slots) {
    const container = document.getElementById('timeSlotsContainer');
    if (!container) return;
    container.innerHTML = '';
    slots.forEach(slot => {
        const slotElement = document.createElement('div');
        slotElement.className = `time-slot ${slot.available ? 'available' : 'unavailable'}`;
        slotElement.textContent = slot.time;
        slotElement.onclick = () => {
            if (slot.available) {
                document.getElementById('bookingTime').value = slot.time;
            }
        };
        container.appendChild(slotElement);
    });
}

function isTimeSlotAvailable(date, time) {
    const slots = generateTimeSlots(date);
    return slots.some(slot => slot.time === time && slot.available);
}

document.getElementById('bookingDate').addEventListener('change', function() {
    const slots = generateTimeSlots(this.value);
    displayTimeSlots(slots);
});

function setupBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;
        if (!isTimeSlotAvailable(date, time)) {
            alert('The company is closed at the selected time slot.');
            return;
        }
        const data = {
            name: document.getElementById('bookingName').value,
            phone: document.getElementById('bookingPhone').value,
            vehicle: document.getElementById('bookingVehicle').value,
            date: date,
            time: time,
            service: document.getElementById('bookingService').value,
        };
        const res = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        const calendarLinkDiv = document.getElementById('calendarLink');
        if (result.success) {
            alert('Booking successful! Check your calendar for confirmation.');
            if (calendarLinkDiv) {
                calendarLinkDiv.innerHTML = `<a href="${result.calendarUrl}" target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>`;
            }
        } else {
            alert('Booking failed: ' + result.error);
            if (calendarLinkDiv) {
                calendarLinkDiv.innerHTML = '';
            }
        }
    });
}

function showBookingSuccess() {
    const successMessage = document.getElementById('bookingSuccess');
    if (successMessage) {
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
}

function showBookingError(message) {
    const errorMessage = document.getElementById('bookingError');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}