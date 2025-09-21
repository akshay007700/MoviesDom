// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

menuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuBtn.innerHTML = nav.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Hero background slider
const hero = document.querySelector('.hero');
const images = [
    'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80")',
    'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1600&q=80")',
    'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1489599102910-59206b8ca314?auto=format&fit=crop&w=1600&q=80")'
];

let currentImage = 0;

function changeBackground() {
    currentImage = (currentImage + 1) % images.length;
    hero.style.backgroundImage = images[currentImage];
    hero.style.transition = 'background-image 1s ease-in-out';
}

// Change background every 5 seconds
setInterval(changeBackground, 5000);
