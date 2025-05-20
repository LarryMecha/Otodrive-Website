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
    const dateInput = document.getElementById('bookingDate');
    const today = new Date();
    let selectedDate = null;
    if (dateInput && dateInput.value) {
        selectedDate = new Date(dateInput.value);
    }
    slots.forEach(slot => {
        const slotElement = document.createElement('div');
        let isPast = false;
        let isClosed = false;
        if (selectedDate) {
            const [hour, minute] = slot.time.split(':').map(Number);
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(hour, minute, 0, 0);
            // Only mark as past if today and time is before now
            if (selectedDate.toDateString() === today.toDateString() && slotDateTime < today) {
                isPast = true;
            } else if (selectedDate < today.setHours(0,0,0,0)) {
                isPast = true;
            }
            // Closed if Sunday or after 12pm on Saturday
            const day = selectedDate.getDay();
            if (day === 0) isClosed = true;
            if (day === 6 && hour >= 12) isClosed = true;
        }
        let classes = 'time-slot';
        if (!slot.available || isPast || isClosed) {
            classes += ' unavailable red-unavailable';
        } else {
            classes += ' available';
        }
        slotElement.className = classes;
        slotElement.textContent = slot.time;
        slotElement.onclick = () => {
            if (slot.available && !isPast && !isClosed) {
                document.getElementById('bookingTime').value = slot.time;
            }
        };
        // Tooltip/notification on hover
        slotElement.onmouseenter = () => {
            let msg = '';
            if (!slot.available || isPast || isClosed) {
                msg = 'This time is unavailable for booking.';
            } else {
                msg = 'This time is available for booking.';
            }
            showSlotTooltip(slotElement, msg);
        };
        slotElement.onmouseleave = () => {
            hideSlotTooltip();
        };
        container.appendChild(slotElement);
    });
}

// Tooltip helpers
function showSlotTooltip(element, message) {
    let tooltip = document.getElementById('slot-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'slot-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = 1000;
        tooltip.style.background = '#222';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '6px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '0.95em';
        tooltip.style.pointerEvents = 'none';
        document.body.appendChild(tooltip);
    }
    tooltip.textContent = message;
    const rect = element.getBoundingClientRect();
    tooltip.style.top = (window.scrollY + rect.top - tooltip.offsetHeight - 8) + 'px';
    tooltip.style.left = (window.scrollX + rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    tooltip.style.display = 'block';
}
function hideSlotTooltip() {
    const tooltip = document.getElementById('slot-tooltip');
    if (tooltip) tooltip.style.display = 'none';
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
                calendarLinkDiv.innerHTML = `<a href="${result.calendarUrl}" target="_blank" rel="noopener noreferrer" class="submit-btn calendar-btn"><i class="fa fa-calendar"></i> Add to Google Calendar</a>`;
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