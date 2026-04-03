/**
 * Secure CMS User Dashboard - Frontend Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- AUTHENTICATION PAGE LOGIC ---
    const btnRequestOtp = document.getElementById("btn-request-otp");
    const btnVerifyOtp = document.getElementById("btn-verify-otp");
    const btnBack = document.getElementById("btn-back");
    const btnResend = document.getElementById("btn-resend");
    
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const identifierInput = document.getElementById("identifier");
    const displayIdentifier = document.getElementById("display-identifier");
    const rateLimitAlert = document.getElementById("alert-rate-limit");
    
    // Request OTP Flow
    if (btnRequestOtp) {
        let requestCount = 0;
        
        btnRequestOtp.addEventListener("click", () => {
            const value = identifierInput.value.trim();
            if (!value) {
                alert("Please enter a valid mobile number or email.");
                return;
            }
            
            requestCount++;
            
            // Dummy Rate Limiting Simulation
            if (requestCount > 2) {
                rateLimitAlert.classList.remove("hidden");
                btnRequestOtp.disabled = true;
                return;
            }
            
            // Simulate API Call / Loading
            btnRequestOtp.innerHTML = '<span style="opacity:0.7">Sending...</span>';
            btnRequestOtp.disabled = true;
            
            setTimeout(() => {
                displayIdentifier.textContent = value;
                step1.classList.add("hidden");
                step2.classList.remove("hidden");
                
                // Reset Button
                btnRequestOtp.innerHTML = 'Send OTP';
                btnRequestOtp.disabled = false;
                
                // Focus first OTP field
                const firstOtpInput = document.querySelector(".otp-input");
                if (firstOtpInput) firstOtpInput.focus();
                
                startResendTimer();
            }, 800);
        });
    }
    
    // OTP Input Field Management
    const otpInputs = document.querySelectorAll(".otp-input");
    if (otpInputs.length > 0) {
        otpInputs.forEach((input, index) => {
            input.addEventListener("input", (e) => {
                // If a number is entered, move to the next field
                if (e.target.value && e.target.value.match(/[0-9]/) && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });
            
            input.addEventListener("keydown", (e) => {
                // Handle backspace properly
                if (e.key === "Backspace" && !e.target.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });
    }
    
    // Verify OTP & Login
    if (btnVerifyOtp) {
        btnVerifyOtp.addEventListener("click", () => {
            // Check if OTP is fully entered
            let otpVal = Array.from(otpInputs).map(input => input.value).join('');
            if (otpVal.length < 4) {
                alert("Please enter valid 4-digit OTP.");
                return;
            }
            
            btnVerifyOtp.innerHTML = 'Verifying...';
            btnVerifyOtp.disabled = true;
            
            // Redirect to Dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        });
    }
    
    // Back Button
    if (btnBack) {
        btnBack.addEventListener("click", (e) => {
            e.preventDefault();
            step2.classList.add("hidden");
            step1.classList.remove("hidden");
            
            // Clear OTP fields
            otpInputs.forEach(input => input.value = '');
        });
    }
    
    // Simulate Resend Timer
    function startResendTimer() {
        if (!btnResend) return;
        let timeLeft = 30;
        btnResend.disabled = true;
        
        let timerId = setInterval(() => {
            timeLeft--;
            btnResend.textContent = `Resend Code (${timeLeft}s)`;
            
            if (timeLeft <= 0) {
                clearInterval(timerId);
                btnResend.disabled = false;
                btnResend.textContent = "Resend Code";
            }
        }, 1000);
    }
    
    
    // --- DASHBOARD PAGE LOGIC ---
    
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('btn-menu-toggle');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Mobile Sidebar Toggle
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            
            // Optional: Close sidebar when clicking outside on mobile
            if (sidebar.classList.contains('open')) {
                const closeSidebar = (e) => {
                   if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                       sidebar.classList.remove('open');
                       document.removeEventListener('click', closeSidebar);
                   }
                };
                // Slight delay to prevent immediate trigger
                setTimeout(() => document.addEventListener('click', closeSidebar), 10);
            }
        });
    }
    
    // Dummy active state assignment for nav
    if (navItems) {
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Ignore if it's logout
                if (this.textContent.includes('Logout')) return;
                
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Hide sidebar on mobile after clicking a link
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.remove('open');
                }
            });
        });
    }
    
    // --- CONSENT DETAILS PAGE LOGIC ---
    const btnModify = document.getElementById('btn-modify');
    const btnWithdraw = document.getElementById('btn-withdraw');
    const confirmModal = document.getElementById('confirm-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const btnConfirmModal = document.getElementById('btn-confirm-modal');
    const toastMessage = document.getElementById('toast-message');
    
    // Open Modal
    if (btnModify && confirmModal) {
        btnModify.addEventListener('click', () => {
            document.getElementById('modal-desc').textContent = "Are you sure you want to update your consent preferences?";
            confirmModal.classList.remove('hidden');
        });
    }
    
    if (btnWithdraw && confirmModal) {
        btnWithdraw.addEventListener('click', () => {
            document.getElementById('modal-desc').textContent = "Are you sure you want to completely withdraw this consent? This action might limit app functionality.";
            confirmModal.classList.remove('hidden');
        });
    }
    
    // Close Modal
    if (btnCancelModal && confirmModal) {
        btnCancelModal.addEventListener('click', () => {
            confirmModal.classList.add('hidden');
        });
    }
    
    // Confirm Action
    if (btnConfirmModal && confirmModal && toastMessage) {
        btnConfirmModal.addEventListener('click', () => {
            btnConfirmModal.innerHTML = 'Processing...';
            btnConfirmModal.disabled = true;
            
            setTimeout(() => {
                // Hide Modal
                confirmModal.classList.add('hidden');
                
                // Reset styling
                btnConfirmModal.innerHTML = 'Confirm Update';
                btnConfirmModal.disabled = false;
                
                // Show Toast
                toastMessage.classList.remove('hidden');
                
                // Auto hide toast after 4 seconds
                setTimeout(() => {
                    toastMessage.classList.add('hidden');
                }, 4000);
            }, 600);
        });
    }
});

// Global Logout function
window.logout = function() {
    if(confirm("Are you sure you want to securely logout?")) {
        window.location.href = "index.html";
    }
};
