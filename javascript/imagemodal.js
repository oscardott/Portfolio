    // --- JAVASCRIPT LOGIC FOR DYNAMIC MODAL WITH NAVIGATION & SWIPING ---
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeModalButton = document.getElementById('closeModalButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const modalImageArea = document.getElementById('modalImageArea'); // Reference for touch events
    const allImageItems = document.querySelectorAll('.portfolio-item');
    let currentImageIndex = -1;
    // Define the transition duration in milliseconds from the CSS variable
    const TRANSITION_DURATION_MS = 300; 

    /**
     * Updates the modal's image source and caption based on the current index.
     * Also controls the visibility of the Prev/Next navigation buttons.
     * @param {number} index The index in the allImageItems NodeList.
     */
    const updateModalContent = (index) => {
        if (index < 0 || index >= allImageItems.length) return;

        const item = allImageItems[index];
        const imgSrc = item.getAttribute('data-img-src');
        const captionText = item.getAttribute('data-caption');

        modalImage.src = imgSrc;
        modalCaption.textContent = captionText;

        currentImageIndex = index;
        
        // --- LOGIC FOR HIDING ARROWS AT ENDS ---
        const totalItems = allImageItems.length;

        // If we are at the beginning (0), disable Prev button
        if (currentImageIndex === 0) {
            prevButton.classList.add('disabled');
        } else {
            prevButton.classList.remove('disabled');
        }

        // If we are at the end (length - 1), disable Next button
        if (currentImageIndex === totalItems - 1) {
            nextButton.classList.add('disabled');
        } else {
            nextButton.classList.remove('disabled');
        }
    }

    /**
     * Function to open the modal and display the content at the given index.
     * @param {number} index The index of the item to show.
     */
    const openModal = (index) => {
        updateModalContent(index);

        // Safety check: ensure image and caption opacity is 1 before starting the open animation
        modalImage.style.opacity = '1';
        // Ensure caption is visible when opening
        modalCaption.style.opacity = '1';

        // Make the modal visible and accessible
        modal.classList.remove('modal-hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Focus the close button for accessibility when the modal opens.
        closeModalButton.focus(); 
    };

    /**
     * Function to close and reset the modal state with a fade-out effect for the image.
     */
    const closeModal = () => {
        // **CODE CHANGE START**
        // 1. Trigger all visual fade-outs simultaneously (t=0ms)
        
        // Hides the modal overlay (opacity: 0) and shrinks the content container (transform: scale(0.95))
        modal.classList.add('modal-hidden');
        


        // 2. Wait for the 300ms CSS transition to complete on ALL elements
        setTimeout(() => {
            // 3. Cleanup: Reset styles and state
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restore scrolling
            currentImageIndex = -1; // Reset index

            // Reset content styles for next open
            modalImage.src = ''; 
            modalImage.style.opacity = '1'; 
            modalCaption.style.opacity = '1';
        }, TRANSITION_DURATION_MS); // 300ms
        // **CODE CHANGE END**
    };

    /**
     * Navigates to the next or previous image (non-wrapping).
     * @param {number} direction - 1 for next, -1 for previous.
     */
    const navigate = (direction) => {
        if (currentImageIndex === -1) return; // Modal is not open

        let newIndex = currentImageIndex + direction;
        const totalItems = allImageItems.length;

        // Check boundaries (no wrap-around)
        if (newIndex >= 0 && newIndex < totalItems) {
            updateModalContent(newIndex);
        }
    };


    // 2. Attach click listeners to all portfolio items (to open modal)
    allImageItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openModal(index);
        });
    });

    // 3. Attach event listeners for closing and navigating the modal

    // Close button listener
    closeModalButton.addEventListener('click', closeModal);

    // Navigation button listeners
    prevButton.addEventListener('click', () => {
        navigate(-1);
        prevButton.blur(); // Remove focus after click
    });
    nextButton.addEventListener('click', () => {
        navigate(1);
        nextButton.blur(); // Remove focus after click
    });

    // Close when clicking outside the image (on the dark overlay)
    modal.addEventListener('click', (event) => {
        // Check if the click occurred directly on the modal container itself
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key, navigate on Arrow keys
    document.addEventListener('keydown', (event) => {
        // Only respond to key events if the modal is currently open
        if (!modal.classList.contains('modal-hidden')) {
            if (event.key === 'Escape') {
                closeModal();
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault(); // Prevent accidental page scrolling
                navigate(-1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault(); // Prevent accidental page scrolling
                navigate(1);
            }
        }
    });
    
    // --- TOUCH / SWIPE LOGIC ---
    let touchstartX = 0;
    let touchendX = 0;
    const swipeThreshold = 50; // Minimum pixel distance for a successful swipe

    function handleSwipe() {
        const swipeDistance = touchstartX - touchendX; 
        if (Math.abs(swipeDistance) < swipeThreshold) return; 

        if (swipeDistance > 0) {
            // Swiped left -> Go to Next Image
            navigate(1);
        } else {
            // Swiped right -> Go to Previous Image
            navigate(-1);
        }
    }

    // 1. Record the starting X position of the touch
    modalImageArea.addEventListener('touchstart', e => {
        if (currentImageIndex !== -1) {
            touchstartX = e.changedTouches[0].screenX;
        }
    }, { passive: true }); 

    // 2. Record the ending X position of the touch and trigger the navigation
    modalImageArea.addEventListener('touchend', e => {
        if (currentImageIndex !== -1) {
            touchendX = e.changedTouches[0].screenX;
            handleSwipe();
        }
    }, { passive: true });