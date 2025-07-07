let pyodideReadyPromise = loadPyodide();

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
    </div>
  `;

  // Add styles if not already added
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        backdrop-filter: blur(20px);
        border: 1px solid;
        z-index: 1001;
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
  }

  document.body.appendChild(notification);

  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideInNotification 0.3s ease-in reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 4000);
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'info': return 'ℹ️';
    default: return '📝';
  }
}

// Scroll indicator functionality
function updateScrollIndicator() {
  const scrollIndicator = document.getElementById('scrollIndicator');
  const scrollContainer = document.querySelector('.scroll-container');
  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;
  
  // Hide indicator when near bottom or when content fits in viewport
  if (scrollTop + clientHeight >= scrollHeight - 50 || scrollHeight <= clientHeight) {
    scrollIndicator.style.opacity = '0';
    scrollIndicator.style.pointerEvents = 'none';
  } else {
    scrollIndicator.style.opacity = '1';
    scrollIndicator.style.pointerEvents = 'auto';
  }
}

// Smooth scroll to next section
function scrollToNext() {
  const scrollContainer = document.querySelector('.scroll-container');
  const currentScroll = scrollContainer.scrollTop;
  const viewportHeight = scrollContainer.clientHeight;
  const nextPosition = currentScroll + viewportHeight * 0.8;
  
  scrollContainer.scrollTo({
    top: nextPosition,
    behavior: 'smooth'
  });
}

// Initialize scroll functionality
document.addEventListener('DOMContentLoaded', () => {
  const scrollContainer = document.querySelector('.scroll-container');
  const scrollIndicator = document.getElementById('scrollIndicator');
  
  // Update indicator on scroll
  scrollContainer.addEventListener('scroll', updateScrollIndicator);
  
  // Click handler for scroll indicator
  scrollIndicator.addEventListener('click', scrollToNext);
  
  // Initial check
  updateScrollIndicator();
  
  // Add loading animation to form elements
  const questionCards = document.querySelectorAll('.question-card');
  questionCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.animation = 'fadeInUp 0.6s ease-out forwards';
  });
});

// Add CSS for fade in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .question-card {
    opacity: 0;
  }
`;
document.head.appendChild(style);

// Form submission handler
document.getElementById("quizForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show loading state
  const submitBtn = document.querySelector('.submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const originalText = btnText.textContent;
  
  btnText.textContent = 'Analyzing...';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';

  try {
    const answers = {};
    for (let i = 1; i <= 10; i++) {
      answers[`q${i}`] = document.querySelector(`select[name='q${i}']`).value;
    }

    let pyodide = await pyodideReadyPromise;

    const response = await fetch("wellness_logic.py");
    const pythonCode = await response.text();
    await pyodide.runPythonAsync(pythonCode);

    for (let key in answers) {
      pyodide.globals.set(key, answers[key]);
    }

    const result = pyodide.runPython(`
calculate_wellness_score(q1, q2, q3, q4, q5, q6, q7, q8, q9, q10)
    `);

    // Display result with animation
    const resultContainer = document.getElementById("result");
    resultContainer.textContent = result;
    resultContainer.classList.add('show');
    
    // Show success notification
    showNotification('Wellness assessment completed successfully!', 'success');
    
    // Scroll to result
    setTimeout(() => {
      resultContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 300);

  } catch (error) {
    console.error('Error calculating wellness score:', error);
    const resultContainer = document.getElementById("result");
    resultContainer.textContent = 'Sorry, there was an error processing your responses. Please try again.';
    resultContainer.classList.add('show');
    showNotification('Error processing assessment. Please try again.', 'error');
  } finally {
    // Reset button state
    btnText.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
  }
});