// TechQuest - Application JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('TechQuest JS initialized!');
    
    // Smooth transition animations on page load
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('animate-fade-in');
    }
});
