let pyodideReadyPromise = loadPyodide();

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
  } finally {
    // Reset button state
    btnText.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
  }
});