// Authentication functionality
class AuthManager {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.initializeEventListeners();
    this.initializeAnimations();
  }

  initializeEventListeners() {
    // Form switching
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchToRegister();
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchToLogin();
    });

    // Form submissions
    document.querySelector('#loginForm form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.querySelector('#registerForm form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    // Social auth buttons
    document.querySelector('.google-btn').addEventListener('click', () => {
      this.handleSocialAuth('google');
    });

    document.querySelector('.github-btn').addEventListener('click', () => {
      this.handleSocialAuth('github');
    });

    // Input animations
    this.setupInputAnimations();
  }

  initializeAnimations() {
    // Stagger animation for form elements
    const animateElements = document.querySelectorAll('.input-group, .form-options, .auth-btn, .social-auth');
    animateElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupInputAnimations() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('focused');
        }
      });

      // Check if input has value on load
      if (input.value) {
        input.parentElement.classList.add('focused');
      }
    });
  }

  switchToRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.style.animation = 'slideOutLeft 0.3s ease-in forwards';
    
    setTimeout(() => {
      loginForm.classList.remove('active');
      registerForm.classList.add('active');
      registerForm.style.animation = 'slideInRight 0.3s ease-out forwards';
    }, 300);

    this.addSlideAnimations();
  }

  switchToLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    registerForm.style.animation = 'slideOutRight 0.3s ease-in forwards';
    
    setTimeout(() => {
      registerForm.classList.remove('active');
      loginForm.classList.add('active');
      loginForm.style.animation = 'slideInLeft 0.3s ease-out forwards';
    }, 300);

    this.addSlideAnimations();
  }

  addSlideAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideOutLeft {
        to { transform: translateX(-100%); opacity: 0; }
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        to { transform: translateX(100%); opacity: 0; }
      }
      @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Show loading state
    const btn = document.querySelector('.login-btn');
    const btnText = btn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    btnText.textContent = 'Signing In...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Simulate API call
    await this.delay(1500);

    try {
      // Check if user exists
      const user = this.users.find(u => u.email === email && u.password === password);
      
      if (user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        if (rememberMe) {
          localStorage.setItem('rememberUser', 'true');
        }

        this.showSuccess('Welcome back! Redirecting to wellness checker...');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        this.showError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      this.showError('Login failed. Please try again.');
    } finally {
      btnText.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }

  async handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Validation
    if (!this.validateRegistration(name, email, password, confirmPassword, agreeTerms)) {
      return;
    }

    // Show loading state
    const btn = document.querySelector('.register-btn');
    const btnText = btn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    btnText.textContent = 'Creating Account...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Simulate API call
    await this.delay(2000);

    try {
      // Check if user already exists
      if (this.users.find(u => u.email === email)) {
        this.showError('An account with this email already exists.');
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
        wellnessHistory: []
      };

      this.users.push(newUser);
      localStorage.setItem('users', JSON.stringify(this.users));
      
      this.currentUser = newUser;
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      this.showSuccess('Account created successfully! Redirecting to wellness checker...');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } catch (error) {
      this.showError('Registration failed. Please try again.');
    } finally {
      btnText.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }

  validateRegistration(name, email, password, confirmPassword, agreeTerms) {
    if (!name.trim()) {
      this.showError('Please enter your full name.');
      return false;
    }

    if (!this.isValidEmail(email)) {
      this.showError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match.');
      return false;
    }

    if (!agreeTerms) {
      this.showError('Please agree to the Terms & Privacy Policy.');
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  handleSocialAuth(provider) {
    this.showInfo(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication would be implemented here.`);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showInfo(message) {
    this.showNotification(message, 'info');
  }

  showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        backdrop-filter: blur(20px);
        border: 1px solid;
        z-index: 1000;
        animation: slideInNotification 0.3s ease-out;
        max-width: 350px;
      }
      
      .notification.success {
        background: rgba(0, 255, 128, 0.1);
        border-color: rgba(0, 255, 128, 0.3);
        color: #00ff80;
      }
      
      .notification.error {
        background: rgba(255, 0, 128, 0.1);
        border-color: rgba(255, 0, 128, 0.3);
        color: #ff0080;
      }
      
      .notification.info {
        background: rgba(0, 255, 255, 0.1);
        border-color: rgba(0, 255, 255, 0.3);
        color: #00ffff;
      }
      
      .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-family: 'Orbitron', sans-serif;
      }
      
      .notification-icon {
        font-size: 16px;
      }
      
      @keyframes slideInNotification {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideInNotification 0.3s ease-in reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }

  getNotificationIcon(type) {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
  
  // Add particle effects
  createParticleEffect();
});

function createParticleEffect() {
  const particleContainer = document.createElement('div');
  particleContainer.className = 'particle-container';
  particleContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  `;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(0, 255, 255, 0.6);
      border-radius: 50%;
      animation: floatParticle ${5 + Math.random() * 10}s linear infinite;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 5}s;
    `;
    particleContainer.appendChild(particle);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatParticle {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(particleContainer);
}