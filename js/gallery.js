// Gallery Management - Auto-loads images from gallery folder
(function() {
    const galleryGrid = document.getElementById('galleryGrid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentImages = [];
    let currentImageIndex = 0;

    // Load images from gallery folder
    async function loadGallery() {
        try {
            // Try to load from a manifest file first (for server environments)
            const response = await fetch('gallery/manifest.json');
            if (response.ok) {
                const manifest = await response.json();
                currentImages = manifest.images || [];
            } else {
                // Fallback: try to detect images (this works if server lists directory)
                // For local development, you'll need to add images manually to manifest.json
                currentImages = [];
            }
        } catch (error) {
            console.log('Using default gallery images. Add images to gallery/ folder and update manifest.json');
            // Default placeholder images
            currentImages = [
                { src: 'gallery/placeholder1.jpg', caption: 'Project Development' },
                { src: 'gallery/placeholder2.jpg', caption: 'Team Working' },
                { src: 'gallery/placeholder3.jpg', caption: 'CanSat Assembly' }
            ];
        }

        renderGallery();
    }

    function renderGallery() {
        if (!galleryGrid) return;

        if (currentImages.length === 0) {
            galleryGrid.innerHTML = '<div class="loading">No images found. Add images to the gallery/ folder.</div>';
            return;
        }

        galleryGrid.innerHTML = currentImages.map((image, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="${image.src}" alt="${image.caption || 'Gallery image'}" loading="lazy">
                ${image.caption ? `<div class="image-caption">${image.caption}</div>` : ''}
            </div>
        `).join('');

        // Add click handlers
        const items = galleryGrid.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));
        });
    }

    function openLightbox(index) {
        currentImageIndex = index;
        lightboxImage.src = currentImages[index].src;
        lightboxImage.alt = currentImages[index].caption || 'Gallery image';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        lightboxImage.src = currentImages[currentImageIndex].src;
        lightboxImage.alt = currentImages[currentImageIndex].caption || 'Gallery image';
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        lightboxImage.src = currentImages[currentImageIndex].src;
        lightboxImage.alt = currentImages[currentImageIndex].caption || 'Gallery image';
    }

    // Event listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrevImage);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        }
    });

    // Load gallery on page load
    if (galleryGrid) {
        loadGallery();
    }
})();
