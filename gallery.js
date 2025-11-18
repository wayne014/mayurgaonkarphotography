class PhotoGallery {
    constructor() {
        this.current = 0;
        this.allImages = [];
        this.visibleImages = [];
        this.currentFilter = 'all';
        this.imagesPerLoad = 16;
        this.currentlyShown = 0;
        this.init();
    }

    init() {
        this.setupGallery();
        this.setupFilters();
        this.setupViewMore();
        this.setupLightbox();
        this.setupMobileNav();
        this.scrollEffects();
        this.smoothScroll();
        this.showInitialImages();
    }

    setupGallery() {
        this.allImages = [...document.querySelectorAll('.gallery img')];
        this.allImages.forEach((img, i) => {
            img.addEventListener('click', () => {
                const visibleIndex = this.visibleImages.indexOf(img);
                if (visibleIndex !== -1) {
                    this.openLightbox(visibleIndex);
                }
            });
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        });
    }

    setupFilters() {
        const filterInputs = document.querySelectorAll('input[name="Photos"]');
        filterInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.applyFilter(e.target.id);
                }
            });
        });
    }

    setupViewMore() {
        const viewMoreBtn = document.getElementById('viewMoreBtn');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', () => {
                this.loadMoreImages();
            });
        }
    }

    setupMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const navList = document.getElementById('navList');
        
        if (navToggle && navList) {
            // ensure accessible state
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-controls', 'navList');

            navToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent document click closing immediately
                const isOpen = navList.classList.toggle('active');
                navToggle.classList.toggle('active', isOpen);
                document.body.classList.toggle('menu-open', isOpen);
                navToggle.setAttribute('aria-expanded', String(isOpen));
            });

            // Prevent clicks inside the menu from closing it
            navList.addEventListener('click', (e) => e.stopPropagation());

            // Close mobile nav when clicking on a link (and restore scrolling)
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navList.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });

            // Close mobile nav when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
                    navToggle.classList.remove('active');
                    navList.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navList.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navList.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Ensure menu is closed when resizing to desktop widths
            window.addEventListener('resize', () => {
                if (window.innerWidth > 900 && navList.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navList.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    showInitialImages() {
        // Hide all images first
        this.allImages.forEach(img => {
            img.classList.add('hidden-image');
        });

        // Show first 16 images
        this.currentlyShown = Math.min(this.imagesPerLoad, this.allImages.length);
        for (let i = 0; i < this.currentlyShown; i++) {
            this.allImages[i].classList.remove('hidden-image');
            this.allImages[i].classList.add('show');
        }

        this.updateVisibleImages();
        this.updateViewMoreButton();
    }

    applyFilter(filterId) {
        let filterClass = '';
        
        switch(filterId) {
            case 'check01':
                filterClass = 'all';
                break;
            case 'check02':
                filterClass = 'weddings';
                break;
            case 'check03':
                filterClass = 'pre-weddings';
                break;
            case 'check04':
                filterClass = 'maternity';
                break;
            case 'check05':
                filterClass = 'haldi';
                break;
            case 'check06':
                filterClass = 'more';
                break;
        }

        this.currentFilter = filterClass;
        this.currentlyShown = this.imagesPerLoad; // Reset to initial load
        this.filterImages(filterClass);
    }

    filterImages(category) {
        // Get all images for the selected category
        const categoryImages = this.getVisibleImagesForCategory(category);
        
        // Hide all images first
        this.allImages.forEach(img => {
            img.classList.add('hidden-image');
            img.classList.remove('show');
        });

        // Show only the first 'currentlyShown' images from the selected category
        for (let i = 0; i < Math.min(this.currentlyShown, categoryImages.length); i++) {
            const img = categoryImages[i];
            img.classList.remove('hidden-image');
            img.classList.add('show');
            
            // Stagger the animation
            setTimeout(() => {
                img.style.animation = `fadeIn 0.6s ease forwards`;
            }, i * 50);
        }

        this.updateVisibleImages();
        this.updateViewMoreButton();
    }

    getVisibleImagesForCategory(category) {
        if (category === 'all') {
            return this.allImages;
        }
        return this.allImages.filter(img => img.classList.contains(category));
    }

    loadMoreImages() {
        const categoryImages = this.getVisibleImagesForCategory(this.currentFilter);
        const oldCount = this.currentlyShown;
        this.currentlyShown += this.imagesPerLoad;
        
        // Show additional images
        for (let i = oldCount; i < Math.min(this.currentlyShown, categoryImages.length); i++) {
            const img = categoryImages[i];
            img.classList.remove('hidden-image');
            img.classList.add('show');
            
            // Stagger the animation
            setTimeout(() => {
                img.style.animation = `fadeIn 0.6s ease forwards`;
            }, (i - oldCount) * 50);
        }

        this.updateVisibleImages();
        this.updateViewMoreButton();
        
        // Smooth scroll to the new images
        setTimeout(() => {
            if (categoryImages[oldCount]) {
                categoryImages[oldCount].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }, 300);
    }

    updateVisibleImages() {
        this.visibleImages = this.allImages.filter(img => 
            !img.classList.contains('hidden-image')
        );
    }

    updateViewMoreButton() {
        const viewMoreBtn = document.getElementById('viewMoreBtn');
        const categoryImages = this.getVisibleImagesForCategory(this.currentFilter);
        
        if (this.currentlyShown >= categoryImages.length) {
            viewMoreBtn.classList.add('hidden');
        } else {
            viewMoreBtn.classList.remove('hidden');
            const remaining = categoryImages.length - this.currentlyShown;
            const btnText = viewMoreBtn.querySelector('.btn-text');
            btnText.textContent = `View More (${remaining} remaining)`;
        }
    }

    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');

        if (lightboxClose) {
            lightboxClose.onclick = () => this.closeLightbox();
        }
        
        if (lightboxPrev) {
            lightboxPrev.onclick = () => this.prevImage();
        }
        
        if (lightboxNext) {
            lightboxNext.onclick = () => this.nextImage();
        }

        if (lightbox) {
            lightbox.onclick = (e) => { 
                if (e.target === lightbox) this.closeLightbox(); 
            };
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox || !lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
            }
        });

        // Touch events for mobile swipe navigation
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        if (lightbox) {
            lightbox.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, { passive: true });
            
            lightbox.addEventListener('touchmove', (e) => {
                endX = e.touches[0].clientX;
                endY = e.touches[0].clientY;
            }, { passive: true });
            
            lightbox.addEventListener('touchend', (e) => {
                const dx = startX - endX;
                const dy = startY - endY;
                
                // Only trigger if horizontal swipe is more significant than vertical
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                    if (dx > 0) {
                        this.nextImage();
                    } else {
                        this.prevImage();
                    }
                }
            }, { passive: true });
        }
    }

    openLightbox(index) {
        if (this.visibleImages.length === 0) return;
        
        this.current = index;
        this.updateLightbox();
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add fade-in animation
        setTimeout(() => {
            const lightboxImage = document.getElementById('lightbox-image');
            if (lightboxImage) {
                lightboxImage.style.transform = 'scale(1)';
            }
        }, 50);
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        
        if (lightboxImage) {
            lightboxImage.style.transform = 'scale(0.9)';
        }
        
        setTimeout(() => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }, 150);
    }

    nextImage() {
        this.current = (this.current + 1) % this.visibleImages.length;
        this.updateLightbox();
    }

    prevImage() {
        this.current = (this.current - 1 + this.visibleImages.length) % this.visibleImages.length;
        this.updateLightbox();
    }

    updateLightbox() {
        const img = document.getElementById('lightbox-image');
        const cap = document.getElementById('lightbox-caption');
        const currentImg = this.visibleImages[this.current];
        
        if (currentImg && img && cap) {
            // Add fade effect during image change
            img.style.opacity = '0';
            
            setTimeout(() => {
                img.src = currentImg.src;
                img.alt = currentImg.alt;
                cap.textContent = currentImg.alt;
                img.style.opacity = '1';
            }, 150);
        }
    }

    scrollEffects() {
        const header = document.querySelector('.header');
        let ticking = false;
        
        const updateHeader = () => {
            const y = window.scrollY;
            if (header) {
                if (y > 100) {
                    header.style.background = 'rgba(255,255,255,0.98)';
                    header.style.boxShadow = '0 2px 30px rgba(0,0,0,0.15)';
                } else {
                    header.style.background = 'rgba(255,255,255,0.95)';
                    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
                }
            }
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });

        // Intersection Observer for section animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { 
            threshold: 0.1, 
            rootMargin: '0px 0px -50px 0px' 
        });

        document.querySelectorAll('section:not(.hero)').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(section);
        });
    }

    smoothScroll() {
        document.querySelectorAll('.nav-link, .cta-button').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.getAttribute('href');
                if (!id || !id.startsWith('#')) return;
                
                const target = document.querySelector(id);
                if (!target) return;
                
                const header = document.querySelector('.header');
                const offset = header ? header.offsetHeight : 0;
                
                window.scrollTo({ 
                    top: target.offsetTop - offset, 
                    behavior: 'smooth' 
                });
            });
        });
    }
}

// Initialize the gallery when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoGallery();
    
    // Add performance optimization for image loading
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('.gallery img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Preload images for better performance
window.addEventListener('load', () => {
    const preloadImages = document.querySelectorAll('.gallery img');
    preloadImages.forEach(img => {
        if (img.complete && img.naturalHeight !== 0) {
            return;
        }
        
        const preload = new Image();
        preload.onload = () => {
            img.style.opacity = '1';
        };
        preload.src = img.src;
    });
});

// Add error handling for images
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.gallery img').forEach(img => {
        img.addEventListener('error', (e) => {
            e.target.style.display = 'none';
            console.warn('Failed to load image:', e.target.src);
        });
    });
});