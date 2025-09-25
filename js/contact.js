// Advanced Contact Page Functionality
class ContactPage {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.phoneInput = null;
        this.map = null;
        this.markers = [];
        this.liveChatOpen = false;
        
        this.init();
    }

    async init() {
        this.initializeAnimations();
        this.initializePhoneInput();
        this.initializeMap();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupFileUpload();
        this.setupFAQ();
        this.updateProgressBar();
    }

    initializeAnimations() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100
            });
        }
    }

    initializePhoneInput() {
        // Initialize international telephone input
        const phoneInput = document.getElementById('phone');
        if (phoneInput && typeof intlTelInput !== 'undefined') {
            this.phoneInput = intlTelInput(phoneInput, {
                initialCountry: "us",
                preferredCountries: ['us', 'gb', 'ca', 'au'],
                separateDialCode: true,
                utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
            });
        }
    }

    initializeMap() {
        // Initialize Leaflet map
        if (typeof L !== 'undefined') {
            this.map = L.map('interactiveMap').setView([34.0522, -118.2437], 2);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
            // Add office markers
            this.addOfficeMarker(34.0522, -118.2437, 'Headquarters', 'Los Angeles, CA');
            this.addOfficeMarker(51.5074, -0.1278, 'European Office', 'London, UK');
        }
    }

    addOfficeMarker(lat, lng, title, description) {
        const marker = L.marker([lat, lng]).addTo(this.map)
            .bindPopup(`
                <div class="map-popup">
                    <h4>${title}</h4>
                    <p>${description}</p>
                    <button onclick="getDirections(${lat}, ${lng})" class="btn-directions">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                </div>
            `);
        
        this.markers.push(marker);
    }

    setupEventListeners() {
        // Form input events
        this.setupFormInputEvents();
        
        // File upload events
        this.setupFileUploadEvents();
        
        // Chat events
        this.setupChatEvents();
        
        // Priority selector events
        this.setupPriorityEvents();
    }

    setupFormInputEvents() {
        // Real-time validation and character counting
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Character counting
            if (input.hasAttribute('maxlength')) {
                input.addEventListener('input', (e) => {
                    this.updateCharCount(e.target);
                    this.validateField(e.target);
                });
            }
            
            // Field validation on blur
            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
            
            // Auto-save form data
            input.addEventListener('change', (e) => {
                this.saveFormData();
            });
        });
        
        // Step navigation
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const step = parseInt(e.target.closest('.form-step').dataset.step);
                if (this.validateStep(step)) {
                    this.nextStep(step + 1);
                }
            });
        });
        
        document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const step = parseInt(e.target.closest('.form-step').dataset.step);
                this.prevStep(step - 1);
            });
        });
        
        // Form submission
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }

    setupFileUploadEvents() {
        const fileInput = document.getElementById('attachments');
        const uploadArea = document.getElementById('fileUploadArea');
        const fileList = document.getElementById('fileList');
        
        if (uploadArea && fileInput) {
            // Click to browse
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                this.handleFiles(files);
            });
            
            // File input change
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }
    }

    setupChatEvents() {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    setupPriorityEvents() {
        const priorityOptions = document.querySelectorAll('.priority-option input');
        priorityOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                this.updatePriorityDisplay(e.target.value);
            });
        });
    }

    setupFormValidation() {
        // Add custom validation rules
        this.setupCustomValidation();
    }

    setupCustomValidation() {
        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this.validateEmail(e.target);
            });
        }
        
        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.validatePhone(e.target);
            });
        }
    }

    setupFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                item.classList.toggle('active');
            });
        });
    }

    // Form Step Navigation
    nextStep(nextStep) {
        if (nextStep > this.totalSteps) return;
        
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        const nextStepElement = document.querySelector(`[data-step="${nextStep}"]`);
        
        if (currentStepElement && nextStepElement) {
            currentStepElement.classList.remove('active');
            nextStepElement.classList.add('active');
            
            // Update progress bar
            this.currentStep = nextStep;
            this.updateProgressBar();
            
            // Update review section if we're going to step 3
            if (nextStep === 3) {
                this.updateReviewSection();
            }
            
            // Scroll to top of form
            document.getElementById('contact-form').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    prevStep(prevStep) {
        if (prevStep < 1) return;
        
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        const prevStepElement = document.querySelector(`[data-step="${prevStep}"]`);
        
        if (currentStepElement && prevStepElement) {
            currentStepElement.classList.remove('active');
            prevStepElement.classList.add('active');
            
            this.currentStep = prevStep;
            this.updateProgressBar();
        }
    }

    updateProgressBar() {
        const progressFill = document.getElementById('formProgress');
        const progressPercentage = (this.currentStep / this.totalSteps) * 100;
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Form Validation
    validateStep(step) {
        let isValid = true;
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        
        if (stepElement) {
            const requiredFields = stepElement.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });
        }
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const errorElement = field.parentElement.querySelector('.error-message');
        
        // Clear previous error
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.showError(field, 'This field is required');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            if (!this.isValidEmail(value)) {
                this.showError(field, 'Please enter a valid email address');
                return false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            if (!this.isValidPhone(value)) {
                this.showError(field, 'Please enter a valid phone number');
                return false;
            }
        }
        
        // Max length validation
        if (field.hasAttribute('maxlength') && value.length > parseInt(field.getAttribute('maxlength'))) {
            this.showError(field, `Maximum ${field.getAttribute('maxlength')} characters allowed`);
            return false;
        }
        
        return true;
    }

    validateEmail(field) {
        const value = field.value.trim();
        if (!value) return true;
        
        const isValid = this.isValidEmail(value);
        if (!isValid) {
            this.showError(field, 'Please enter a valid email address');
        } else {
            this.clearError(field);
        }
        return isValid;
    }

    validatePhone(field) {
        const value = field.value.trim();
        if (!value) return true;
        
        const isValid = this.isValidPhone(value);
        if (!isValid) {
            this.showError(field, 'Please enter a valid phone number');
        } else {
            this.clearError(field);
        }
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Basic phone validation - in real app, use libphonenumber
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    showError(field, message) {
        field.classList.add('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // File Upload Handling
    handleFiles(files) {
        const fileList = document.getElementById('fileList');
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        Array.from(files).forEach(file => {
            if (file.size > maxSize) {
                showNotification(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
                return;
            }
            
            this.addFileToList(file);
        });
    }

    addFileToList(file) {
        const fileList = document.getElementById('fileList');
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${this.formatFileSize(file.size)}</span>
            <span class="file-remove" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </span>
        `;
        fileList.appendChild(fileItem);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Character Counting
    updateCharCount(field) {
        const charCount = field.parentElement.querySelector('.char-count');
        if (charCount) {
            const maxLength = field.getAttribute('maxlength');
            const currentLength = field.value.length;
            charCount.textContent = `${currentLength}/${maxLength}`;
            
            // Change color when approaching limit
            if (currentLength > maxLength * 0.8) {
                charCount.style.color = '#ff9800';
            } else if (currentLength > maxLength * 0.9) {
                charCount.style.color = '#f44336';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        }
    }

    // Form Data Management
    saveFormData() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        
        this.formData = {};
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('moviesdom_contact_form', JSON.stringify(this.formData));
    }

    loadFormData() {
        const savedData = localStorage.getItem('moviesdom_contact_form');
        if (savedData) {
            this.formData = JSON.parse(savedData);
            
            // Populate form fields
            Object.keys(this.formData).forEach(key => {
                const field = document.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = this.formData[key];
                    this.updateCharCount(field);
                }
            });
        }
    }

    updateReviewSection() {
        // Populate review section with form data
        const fields = {
            'reviewName': () => `${this.formData.firstName || ''} ${this.formData.lastName || ''}`.trim(),
            'reviewEmail': () => this.formData.email || '-',
            'reviewPhone': () => this.formData.phone || 'Not provided',
            'reviewCompany': () => this.formData.company || 'Not provided',
            'reviewDepartment': () => this.getDepartmentName(this.formData.department),
            'reviewPriority': () => this.formData.priority ? this.formData.priority.charAt(0).toUpperCase() + this.formData.priority.slice(1) : 'Medium',
            'reviewSubject': () => this.formData.subject || '-',
            'reviewMessage': () => this.formData.message || '-'
        };
        
        Object.keys(fields).forEach(reviewElementId => {
            const element = document.getElementById(reviewElementId);
            if (element) {
                element.textContent = fields[reviewElementId]();
            }
        });
    }

    getDepartmentName(value) {
        const departments = {
            'general': 'General Inquiry',
            'support': 'Technical Support',
            'partnership': 'Partnership Opportunities',
            'press': 'Press & Media',
            'careers': 'Careers',
            'feedback': 'Feedback & Suggestions',
            'other': 'Other'
        };
        return departments[value] || value || '-';
    }

    updatePriorityDisplay(priority) {
        // Update visual display of selected priority
        document.querySelectorAll('.priority-option').forEach(option => {
            option.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        const selectedOption = document.querySelector(`input[value="${priority}"]`).parentElement;
        if (selectedOption) {
            selectedOption.style.borderColor = '#667eea';
        }
    }

    // Form Submission
    async submitForm() {
        // Validate final step
        if (!this.validateStep(3)) {
            showNotification('Please fix the errors before submitting', 'error');
            return;
        }
        
        // Check consent
        const consent = document.getElementById('consent');
        if (!consent.checked) {
            this.showError(consent, 'You must agree to the terms to continue');
            showNotification('Please agree to the privacy policy and terms of service', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call - in real app, this would be a fetch request
            await this.sendFormData();
            
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            this.resetForm();
            
            // Redirect to thank you page or show confirmation
            setTimeout(() => {
                this.showConfirmation();
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async sendFormData() {
        // Simulate API request delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // In real app, you would send data to your backend
                console.log('Form data submitted:', this.formData);
                resolve();
            }, 2000);
        });
    }

    resetForm() {
        document.getElementById('contactForm').reset();
        localStorage.removeItem('moviesdom_contact_form');
        this.currentStep = 1;
        this.updateProgressBar();
        
        // Clear file list
        const fileList = document.getElementById('fileList');
        if (fileList) {
            fileList.innerHTML = '';
        }
        
        // Reset steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector('[data-step="1"]').classList.add('active');
        
        // Clear form data
        this.formData = {};
    }

    showConfirmation() {
        // Show confirmation message or redirect
        const formSection = document.querySelector('.contact-form-section');
        formSection.innerHTML = `
            <div class="confirmation-message" style="text-align: center; padding: 4rem;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #4CAF50; margin-bottom: 2rem;"></i>
                <h2>Thank You!</h2>
                <p>Your message has been sent successfully. We'll get back to you within 24 hours.</p>
                <div style="margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-envelope"></i> Send Another Message
                    </button>
                </div>
            </div>
        `;
    }

    // Live Chat Functionality
    toggleLiveChat() {
        const chatWidget = document.getElementById('liveChatWidget');
        const chatToggle = document.getElementById('chatToggle');
        
        this.liveChatOpen = !this.liveChatOpen;
        
        if (this.liveChatOpen) {
            chatWidget.classList.add('open');
            chatToggle.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            chatWidget.classList.remove('open');
            chatToggle.innerHTML = '<i class="fas fa-comments"></i><span class="chat-badge">1</span>';
        }
    }

    closeLiveChat() {
        this.liveChatOpen = false;
        document.getElementById('liveChatWidget').classList.remove('open');
        document.getElementById('chatToggle').innerHTML = '<i class="fas fa-comments"></i><span class="chat-badge">1</span>';
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addChatMessage(message, 'user');
        chatInput.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            this.addBotResponse(message);
        }, 1000);
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(message)}</div>
            <div class="message-time">${timeString}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addBotResponse(userMessage) {
        const responses = {
            'hello': 'Hello! How can I help you today?',
            'hi': 'Hi there! What can I assist you with?',
            'help': 'I\'m here to help! Please describe your issue.',
            'support': 'Our support team is available 24/7. How can we assist you?',
            'contact': 'You can reach us via email, phone, or this live chat. Which method do you prefer?'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        let response = 'Thank you for your message. Our support team will get back to you shortly.';
        
        // Find matching response
        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                response = value;
                break;
            }
        }
        
        this.addChatMessage(response, 'bot');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Map Functions
    zoomToOffice(location) {
        if (!this.map) return;
        
        const offices = {
            'la': { lat: 34.0522, lng: -118.2437, zoom: 12 },
            'london': { lat: 51.5074, lng: -0.1278, zoom: 12 }
        };
        
        const office = offices[location];
        if (office) {
            this.map.setView([office.lat, office.lng], office.zoom);
            
            // Open popup for the office
            this.markers.forEach(marker => {
                const latLng = marker.getLatLng();
                if (latLng.lat === office.lat && latLng.lng === office.lng) {
                    marker.openPopup();
                }
            });
        }
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    this.map.setView([lat, lng], 12);
                    
                    // Add user location marker
                    L.marker([lat, lng])
                        .addTo(this.map)
                        .bindPopup('Your Location')
                        .openPopup();
                },
                (error) => {
                    showNotification('Unable to get your location. Please enable location services.', 'error');
                }
            );
        } else {
            showNotification('Geolocation is not supported by your browser.', 'error');
        }
    }
}

// Global functions for HTML onclick attributes
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function nextStep(step) {
    if (window.contactPage) {
        window.contactPage.nextStep(step);
    }
}

function prevStep(step) {
    if (window.contactPage) {
        window.contactPage.prevStep(step);
    }
}

function initiateCall() {
    showNotification('Initiating call... (This would call +1-555-668-4377 in a real app)', 'info');
}

function openLiveChat() {
    if (window.contactPage) {
        window.contactPage.toggleLiveChat();
    }
}

function closeLiveChat() {
    if (window.contactPage) {
        window.contactPage.closeLiveChat();
    }
}

function sendChatMessage() {
    if (window.contactPage) {
        window.contactPage.sendChatMessage();
    }
}

function toggleLiveChat() {
    if (window.contactPage) {
        window.contactPage.toggleLiveChat();
    }
}

function zoomToOffice(location) {
    if (window.contactPage) {
        window.contactPage.zoomToOffice(location);
    }
}

function getUserLocation() {
    if (window.contactPage) {
        window.contactPage.getUserLocation();
    }
}

function getDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

function scheduleMeeting() {
    showNotification('Redirecting to meeting scheduler...', 'info');
    // In real app, this would open a calendar integration
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    window.contactPage = new ContactPage();
});