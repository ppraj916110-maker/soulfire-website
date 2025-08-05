document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  const darkToggle = document.getElementById('dark-toggle');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    darkToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  });

  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
  });
});
