document.getElementById("contactForm").addEventListener("submit", sendMail);

function sendMail(event) {
    event.preventDefault();

    // Select form elements
    const fullName = document.getElementById("fullName");
    const phoneNumber = document.getElementById("number");
    const emailId = document.getElementById("email_id");
    const message = document.getElementById("message");
    const thankYouMessage = document.getElementById("thankYouMessage");

    // Clear previous error messages
    clearErrors();

    // Validation Flags
    let isValid = true;

    // Validate Full Name
    if (!fullName.value.trim()) {
        showError(fullName, "Full Name is required.");
        isValid = false;
    }

    // Validate Phone Number
    const phoneRegex = /^[0-9]{10}$/; // Example for 10-digit phone numbers
    if (!phoneRegex.test(phoneNumber.value.trim())) {
        showError(phoneNumber, "Phone Number must be 10 digits.");
        isValid = false;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailId.value.trim())) {
        showError(emailId, "Invalid Email Address.");
        isValid = false;
    }

    // Validate Message
    if (!message.value.trim()) {
        showError(message, "Message cannot be empty.");
        isValid = false;
    }

    // Stop submission if invalid
    if (!isValid) return;

    // Parameters for EmailJS
    var params = {
        from_name: fullName.value.trim(),
        phone_number: phoneNumber.value.trim(),
        email_id: emailId.value.trim(),
        message: message.value.trim(),
    };

    // Send email via EmailJS
    emailjs
        .send("service_bmmrwfq", "template_dwe32rn", params)
        .then(function (res) {
            console.log("Email sent successfully:", res.status);

            // Show the thank-you message
            thankYouMessage.style.display = "block";

            // Hide the message after 3 seconds
            setTimeout(function () {
                thankYouMessage.style.display = "none";
            }, 3000);
        })
        .catch(function (error) {
            console.error("Failed to send email:", error);
        });
}

// Function to show error message
function showError(inputElement, message) {
    // Create an error message span
    const errorSpan = document.createElement("span");
    errorSpan.className = "error-message";
    errorSpan.innerText = message;

    // Insert error message after the input field
    inputElement.parentElement.appendChild(errorSpan);
}

// Function to clear all error messages
function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach((error) => error.remove());
}
