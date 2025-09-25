// Advanced About Page Functionality
class AboutPage {
    constructor() {
        this.teamMembers = [];
        this.currentTeamFilter = 'all';
        
        this.init();
    }

    async init() {
        this.initializeAnimations();
        this.initializeParticles();
        this.loadTeamMembers();
        this.setupEventListeners();
        this.animateStats();
        this.setupFAQ();
    }

    initializeAnimations() {
        // Initialize AOS (Animate On Scroll)
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }

    initializeParticles() {
        // Initialize particles.js for hero background
        if (typeof particlesJS !== 'undefined') {
            particlesJS('heroParticles', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: "#a8e6cf" },
                    shape: { type: "circle" },
                    opacity: { value: 0.5, random: true },
                    size: { value: 3, random: true },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: "#a8e6cf",
                        opacity: 0.2,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 2,
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "repulse" },
                        onclick: { enable: true, mode: "push" },
                        resize: true
                    }
                },
                retina_detect: true
            });
        }
    }

    loadTeamMembers() {
        // Sample team data - in real app, this would come from an API
        this.teamMembers = [
            {
                id: 1,
                name: "Sarah Chen",
                role: "CEO & Founder",
                department: "leadership",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
                bio: "Film enthusiast with 10+ years in tech industry. Passionate about bringing movie lovers together.",
                social: {
                    twitter: "#",
                    linkedin: "#",
                    github: "#"
                }
            },
            {
                id: 2,
                name: "Marcus Rodriguez",
                role: "CTO",
                department: "leadership",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                bio: "Full-stack developer specializing in scalable web applications and AI integration.",
                social: {
                    twitter: "#",
                    linkedin: "#",
                    github: "#"
                }
            },
            {
                id: 3,
                name: "Emily Watson",
                role: "Lead Designer",
                department: "design",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
                bio: "UI/UX designer with a passion for creating intuitive user experiences for movie platforms.",
                social: {
                    twitter: "#",
                    linkedin: "#",
                    dribbble: "#"
                }
            },
            {
                id: 4,
                name: "Alex Thompson",
                role: "Senior Developer",
                department: "development",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
                bio: "JavaScript expert focused on frontend development and performance optimization.",
                social: {
                    twitter: "#",
                    linkedin: "#",
                    github: "#"
                }
            },
            {
                id: 5,
                name: "Jessica Lee",
                role: "Content Manager",
                department: "content",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
                bio: "Former film critic now managing our content team and ensuring data accuracy.",
                social: {
                    twitter: "#",
                    linkedin: "#",
                    instagram: "#"
                }
            },
            {
                id: 6,
                name: "David Kim",
                role: "DevOps Engineer",
                department: "development",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
                bio: "Cloud infrastructure specialist ensuring MoviesDom runs smoothly 24/7.",
                social: {
                    twitter: "#",
                    linkedin: "#",
                    github: "#"
                }
            }
        ];

        this.renderTeamMembers();
    }

    renderTeamMembers() {
        const container = document.querySelector('.team-grid');
        const filteredMembers = this.currentTeamFilter === 'all' 
            ? this.teamMembers 
            : this.teamMembers.filter(member => member.department === this.currentTeamFilter);

        container.innerHTML = filteredMembers.map(member => `
            <div class="team-member" data-aos="fade-up">
                <img src="${member.image}" alt="${member.name}" class="member-image" onerror="this.src='images/avatar-placeholder.jpg'">
                <div class="member-info">
                    <h3 class="member-name">${member.name}</h3>
                    <div class="member-role">${member.role}</div>
                    <p class="member-bio">${member.bio}</p>
                    <div class="member-social">
                        ${member.social.twitter ? `<a href="${member.social.twitter}" class="social-link" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                        ${member.social.linkedin ? `<a href="${member.social.linkedin}" class="social-link" target="_blank"><i class="fab fa-linkedin"></i></a>` : ''}
                        ${member.social.github ? `<a href="${member.social.github}" class="social-link" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                        ${member.social.dribbble ? `<a href="${member.social.dribbble}" class="social-link" target="_blank"><i class="fab fa-dribbble"></i></a>` : ''}
                        ${member.social.instagram ? `<a href="${member.social.instagram}" class="social-link" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Team filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterTeam(e.target.dataset.filter);
            });
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Scroll indicator click
        document.querySelector('.scroll-indicator').addEventListener('click', () => {
            document.querySelector('.mission-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    setupFAQ() {
        // FAQ toggle functionality
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const isActive = item.classList.contains('active');
                
                // Close all other items
                document.querySelectorAll('.faq-item').forEach(faqItem => {
                    faqItem.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    filterTeam(department) {
        this.currentTeamFilter = department;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${department}"]`).classList.add('active');
        
        // Re-render team members
        this.renderTeamMembers();
        
        // Refresh AOS for new elements
        AOS.refresh();
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Format number with commas
                stat.textContent = Math.floor(current).toLocaleString();
            }, 16);
        });
    }

    // Additional interactive features can be added here
    setupInteractiveTimeline() {
        // Add intersection observer for timeline animations
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }
            });
        }, { threshold: 0.3 });

        timelineItems.forEach(item => {
            item.style.opacity = '0';
            if (item.classList.contains('timeline-item:nth-child(odd)')) {
                item.style.transform = 'translateX(-50px)';
            } else {
                item.style.transform = 'translateX(50px)';
            }
            observer.observe(item);
        });
    }

    // Initialize scroll-based animations
    setupScrollAnimations() {
        let scrollPos = 0;
        
        window.addEventListener('scroll', () => {
            // Add parallax effect to hero section
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.hero-background');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
            
            // Update active navigation based on scroll position
            this.updateActiveNav();
        });
    }

    updateActiveNav() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }

    // Add newsletter subscription functionality
    setupNewsletter() {
        const form = document.querySelector('.newsletter-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;
                this.subscribeToNewsletter(email);
            });
        }
    }

    subscribeToNewsletter(email) {
        // Simulate API call
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        
        // Reset form
        const form = document.querySelector('.newsletter-form');
        form.reset();
        
        // In real app, you would send this to your backend
        console.log('Newsletter subscription:', email);
    }

    // Social share functionality
    setupSocialShare() {
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.sharePage();
            });
        });
    }

    sharePage() {
        if (navigator.share) {
            navigator.share({
                title: 'MoviesDom - About Us',
                text: 'Check out MoviesDom, the ultimate movie database!',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            showNotification('Page link copied to clipboard!', 'success');
        }
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const aboutPage = new AboutPage();
    
    // Make it globally accessible for any inline event handlers
    window.aboutPage = aboutPage;
    
    // Additional initialization that requires the page to be fully loaded
    setTimeout(() => {
        aboutPage.setupInteractiveTimeline();
        aboutPage.setupScrollAnimations();
        aboutPage.setupNewsletter();
        aboutPage.setupSocialShare();
    }, 100);
});

// Utility function for any global interactions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AboutPage;
}