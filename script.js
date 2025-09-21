
// Global variables
let scene, camera, renderer, consciousnessOrb;
let particles = [];
let animationPhase = 'initial'; // 'initial', 'emergence', 'burst', 'universe'
let isTransitioning = false;
let currentNodeId = null;
let contentData = null;

// Initialize the application based on URL hash
function init() {
    const hash = window.location.hash.substring(1);

    if (hash === 'config') {
        showConfig();
    } else {
        showSplashScreen();
        loadDataFromFile();
    }
}

// Show splash screen with animation
function showSplashScreen() {
    const splashText = document.getElementById('splash-text');

    setTimeout(() => {
        splashText.style.opacity = '1';
        splashText.style.transform = 'translateY(0)';
    }, 500);

    // Hide splash after animation
    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 1000);
    }, 4000);
}

// Load data from external JSON file
async function loadDataFromFile() {
    showLoading(true);

    try {
        const response = await fetch('data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        contentData = await response.json();

        // Validate the loaded data
        if (!validateJSONStructure(contentData)) {
            throw new Error('Invalid JSON structure in data.json');
        }

        currentNodeId = contentData.startNode;

        showLoading(false);

        // Start the 3D experience after data is loaded
        setTimeout(() => {
            setupThreeJS();
            startAnimation();
        }, 1000);

    } catch (error) {
        showLoading(false);
        showDataLoadError(error.message);
    }
}

// Show/hide loading screen
function showLoading(show) {
    const loadingScreen = document.getElementById('loading-screen');
    if (show) {
        loadingScreen.style.opacity = '1';
        loadingScreen.style.pointerEvents = 'all';
    } else {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.pointerEvents = 'none';
    }
}

// Show error when data.json cannot be loaded
function showDataLoadError(errorMessage) {
    const splashScreen = document.getElementById('splash-screen');
    const splashText = document.getElementById('splash-text');

    splashScreen.style.display = 'flex';
    splashScreen.style.opacity = '1';
    splashText.innerHTML = `
                <div class="text-center">
                    <h1 class="text-2xl md:text-4xl font-light text-red-400 mb-4">
                        Unable to Load Cosmic Data
                    </h1>
                    <p class="text-lg text-gray-300 mb-8">
                        ${errorMessage}
                    </p>
                    <div class="space-y-4">
                        <p class="text-sm text-gray-400">
                            Please ensure 'data.json' exists in the same directory as this HTML file.
                        </p>
                        <div class="flex justify-center space-x-4">
                            <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300">
                                Retry Loading
                            </button>
                            <button onclick="window.location.hash='config'" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-300">
                                Go to Config
                            </button>
                        </div>
                    </div>
                </div>
            `;
}

// Setup Three.js scene
function setupThreeJS() {
    // Scene setup
    scene = new THREE.Scene();

    // Add realistic starfield background
    createStarfield();

    // Add nebula-like background
    createNebulaBackground();

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000008); // Very dark blue instead of pure black

    // Clear any existing canvas
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Create consciousness orb (initially invisible)
    const orbGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const orbMaterial = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0
    });
    consciousnessOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(consciousnessOrb);

    // Add click handler to consciousness orb
    renderer.domElement.addEventListener('click', onCanvasClick);
}

// Create realistic starfield background
function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        // Random positions in a large sphere
        const radius = 100 + Math.random() * 400;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // Star colors - mix of white, blue, and yellow stars
        const temp = Math.random();
        if (temp < 0.7) {
            // White stars
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
        } else if (temp < 0.85) {
            // Blue stars
            colors[i * 3] = 0.7;
            colors[i * 3 + 1] = 0.8;
            colors[i * 3 + 2] = 1;
        } else {
            // Yellow/orange stars
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 0.8;
            colors[i * 3 + 2] = 0.6;
        }

        sizes[i] = Math.random() * 2 + 0.5;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// Create nebula-like background with multiple layers
function createNebulaBackground() {
    // Create multiple nebula clouds
    for (let i = 0; i < 3; i++) {
        const nebulaGeometry = new THREE.SphereGeometry(50 + i * 20, 32, 32);

        // Different nebula colors
        const nebulaColors = [
            { r: 0.2, g: 0.1, b: 0.4 }, // Purple
            { r: 0.1, g: 0.2, b: 0.4 }, // Blue
            { r: 0.3, g: 0.1, b: 0.2 }  // Magenta
        ];

        const color = nebulaColors[i];
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color.r, color.g, color.b),
            transparent: true,
            opacity: 0.03 + i * 0.01,
            side: THREE.BackSide
        });

        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);

        // Position nebulae randomly
        nebula.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100 - 50
        );

        scene.add(nebula);
    }

    // Add cosmic dust effect
    createCosmicDust();
}

// Create cosmic dust particles
function createCosmicDust() {
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 500;

    const positions = new Float32Array(dustCount * 3);
    const colors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
        // Random positions in space
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

        // Subtle dust colors
        const brightness = 0.1 + Math.random() * 0.2;
        colors[i * 3] = brightness * 0.8;
        colors[i * 3 + 1] = brightness * 0.9;
        colors[i * 3 + 2] = brightness;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const dustMaterial = new THREE.PointsMaterial({
        size: 0.5,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.3
    });

    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);
}

// Animation sequence
function startAnimation() {
    setTimeout(() => {
        animationPhase = 'emergence';
        emergenceAnimation();
    }, 1000);
}

function emergenceAnimation() {
    const startTime = Date.now();
    const duration = 2000;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Fade in the consciousness orb
        consciousnessOrb.material.opacity = progress;
        consciousnessOrb.scale.setScalar(progress);

        // Show label
        if (progress > 0.5) {
            const label = document.getElementById('consciousness-label');
            label.style.opacity = (progress - 0.5) * 2;
            updateLabelPosition();
        }

        renderer.render(scene, camera);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animationPhase = 'waiting';
            startMainLoop();
        }
    }

    animate();
}

function burstAnimation() {
    const startTime = Date.now();
    const duration = 1500;

    // Create burst effect
    const burstGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const burstMaterial = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 1
    });
    const burst = new THREE.Mesh(burstGeometry, burstMaterial);
    scene.add(burst);

    // Create particles
    createParticles();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Expand and fade burst
        const scale = 1 + progress * 50;
        burst.scale.setScalar(scale);
        burst.material.opacity = 1 - progress;

        // Animate particles
        particles.forEach(particle => {
            particle.position.add(particle.velocity);
            particle.velocity.multiplyScalar(0.99);
        });

        renderer.render(scene, camera);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            scene.remove(burst);
            transformParticles();
            animationPhase = 'universe';
        }
    }

    animate();
}

function createParticles() {
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.8, 0.6)
        });

        const particle = new THREE.Mesh(geometry, material);

        // Random direction from center
        const direction = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();

        particle.position.set(0, 0, 0);
        particle.velocity = direction.multiplyScalar(0.1 + Math.random() * 0.1);

        particles.push(particle);
        scene.add(particle);
    }
}

function transformParticles() {
    particles.forEach((particle, index) => {
        setTimeout(() => {
            // Randomly decide if this becomes a star or planet
            if (Math.random() > 0.7) {
                // Transform to planet
                particle.scale.setScalar(2 + Math.random() * 2);
                particle.material.color.setHSL(Math.random(), 0.6, 0.5);
            } else {
                // Transform to star (glowing point)
                particle.scale.setScalar(0.5);
                particle.material.color.setHex(0xffffff);

                // Add glow effect
                const glowGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.3
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                particle.add(glow);
            }
        }, index * 50);
    });
}

function startMainLoop() {
    function animate() {
        if (animationPhase === 'waiting') {
            // Gentle pulsing of consciousness orb
            const time = Date.now() * 0.001;
            consciousnessOrb.scale.setScalar(1 + Math.sin(time * 2) * 0.1);

            updateLabelPosition();
        }

        if (animationPhase === 'universe') {
            // Gentle floating motion for particles
            particles.forEach((particle, index) => {
                const time = Date.now() * 0.0005 + index * 0.1;
                particle.position.y += Math.sin(time) * 0.0001;
                particle.rotation.y += 0.001;
            });

            // Keep consciousness orb pulsing gently
            const time = Date.now() * 0.001;
            consciousnessOrb.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
        }

        // Subtle rotation of the entire scene for cosmic movement
        if (scene) {
            scene.rotation.y += 0.0001;
        }

        renderer.render(scene, camera);

        if (!isTransitioning) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

function updateLabelPosition() {
    // Project 3D position to 2D screen coordinates
    const vector = consciousnessOrb.position.clone();
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

    const label = document.getElementById('consciousness-label');
    label.style.left = (x + 20) + 'px';
    label.style.top = (y - 30) + 'px';
}

function onCanvasClick(event) {
    if (animationPhase !== 'waiting' && animationPhase !== 'universe') return;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([consciousnessOrb]);

    if (intersects.length > 0) {
        startJourney();
    }
}

function startJourney() {
    if (isTransitioning) return;

    isTransitioning = true;

    if (animationPhase === 'waiting') {
        // Trigger burst animation first
        animationPhase = 'burst';
        burstAnimation();

        setTimeout(() => {
            transitionToContent();
        }, 2000);
    } else {
        transitionToContent();
    }
}

function transitionToContent() {
    // Hide label
    document.getElementById('consciousness-label').style.opacity = '0';

    // Fade out canvas
    const canvas = document.getElementById('canvas-container');
    canvas.style.transition = 'opacity 1s ease-in-out';
    canvas.style.opacity = '0';

    // Fade in content
    setTimeout(() => {
        document.body.style.overflow = 'auto';
        loadNode(currentNodeId);
        document.getElementById('content-container').classList.add('active');
    }, 1000);
}

function loadNode(nodeId) {
    const node = contentData.nodes[nodeId];
    if (!node) return;

    currentNodeId = nodeId;

    // Update content
    document.getElementById('question-title').textContent = node.question;

    // Process answer content with media support
    const answerContainer = document.getElementById('answer-content');
    answerContainer.innerHTML = processAnswerContent(node.answer, node.media);

    // Update follow-ups
    const followUpsContainer = document.getElementById('follow-ups-container');
    followUpsContainer.innerHTML = '';

    node.followUps.forEach(followUp => {
        const button = document.createElement('button');
        button.className = 'follow-up-button';
        button.textContent = followUp.prompt;
        button.onclick = () => navigateToNode(followUp.nextNodeId);
        followUpsContainer.appendChild(button);
    });

    // Initialize any embedded content
    setTimeout(() => {
        initializeEmbeddedContent();
    }, 100);
}

function processAnswerContent(answer, media) {
    let processedContent = answer;

    // If media exists, add it to the content
    if (media && Array.isArray(media)) {
        let mediaHTML = '';

        media.forEach((item, index) => {
            switch (item.type) {
                case 'video':
                    mediaHTML += createVideoEmbed(item);
                    break;
                case 'link':
                    mediaHTML += createLinkPreview(item);
                    break;
                case 'image':
                    mediaHTML += createImageEmbed(item);
                    break;
                case 'audio':
                    mediaHTML += createAudioEmbed(item);
                    break;
            }
        });

        // Add media after the text content
        processedContent += '<div class="media-container mt-8">' + mediaHTML + '</div>';
    }

    return processedContent;
}

function createVideoEmbed(videoItem) {
    const { url, title = 'Video', description = '', autoplay = false, width = '100%', height = '315' } = videoItem;

    // Handle different video platforms
    let embedHTML = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = extractYouTubeID(url);
        const autoplayParam = autoplay ? '&autoplay=1' : '';
        embedHTML = `
                    <div class="video-embed mb-6">
                        <div class="relative w-full" style="padding-bottom: 56.25%; height: 0;">
                            <iframe 
                                class="absolute top-0 left-0 w-full h-full rounded-lg"
                                src="https://www.youtube.com/embed/${videoId}?rel=0${autoplayParam}"
                                title="${title}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                        </div>
                        ${title ? `<h4 class="text-white font-semibold mt-3">${title}</h4>` : ''}
                        ${description ? `<p class="text-gray-300 text-sm mt-2">${description}</p>` : ''}
                    </div>
                `;
    } else if (url.includes('vimeo.com')) {
        const videoId = extractVimeoID(url);
        const autoplayParam = autoplay ? '&autoplay=1' : '';
        embedHTML = `
                    <div class="video-embed mb-6">
                        <div class="relative w-full" style="padding-bottom: 56.25%; height: 0;">
                            <iframe 
                                class="absolute top-0 left-0 w-full h-full rounded-lg"
                                src="https://player.vimeo.com/video/${videoId}?color=60a5fa${autoplayParam}"
                                title="${title}"
                                frameborder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                        </div>
                        ${title ? `<h4 class="text-white font-semibold mt-3">${title}</h4>` : ''}
                        ${description ? `<p class="text-gray-300 text-sm mt-2">${description}</p>` : ''}
                    </div>
                `;
    } else {
        // Generic video embed
        embedHTML = `
                    <div class="video-embed mb-6">
                        <video 
                            class="w-full rounded-lg"
                            width="${width}" 
                            height="${height}"
                            controls
                            ${autoplay ? 'autoplay' : ''}
                            preload="metadata">
                            <source src="${url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        ${title ? `<h4 class="text-white font-semibold mt-3">${title}</h4>` : ''}
                        ${description ? `<p class="text-gray-300 text-sm mt-2">${description}</p>` : ''}
                    </div>
                `;
    }

    return embedHTML;
}

function createLinkPreview(linkItem) {
    const { url, title, description, image, favicon, domain } = linkItem;

    return `
                <div class="link-preview mb-6 bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600 hover:border-blue-400 transition-colors duration-300">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="block">
                        <div class="flex items-start space-x-4">
                            ${image ? `
                                <div class="flex-shrink-0">
                                    <img src="${image}" alt="${title || 'Link preview'}" class="w-20 h-20 object-cover rounded-lg">
                                </div>
                            ` : ''}
                            <div class="flex-grow min-w-0">
                                <div class="flex items-center space-x-2 mb-2">
                                    ${favicon ? `<img src="${favicon}" alt="" class="w-4 h-4">` : ''}
                                    <span class="text-blue-400 text-sm font-medium">${domain || new URL(url).hostname}</span>
                                </div>
                                <h4 class="text-white font-semibold line-clamp-2 hover:text-blue-300 transition-colors duration-200">
                                    ${title || url}
                                </h4>
                                ${description ? `
                                    <p class="text-gray-300 text-sm mt-2 line-clamp-3">${description}</p>
                                ` : ''}
                                <div class="flex items-center mt-3">
                                    <svg class="w-4 h-4 text-blue-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                    <span class="text-blue-400 text-sm">Open Link</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            `;
}

function createImageEmbed(imageItem) {
    const { url, title, description, width = '100%', height = 'auto' } = imageItem;

    return `
                <div class="image-embed mb-6">
                    <div class="relative group">
                        <img 
                            src="${url}" 
                            alt="${title || 'Image'}"
                            class="w-full rounded-lg shadow-lg cursor-pointer transition-transform duration-300 group-hover:scale-105"
                            style="max-width: ${width}; height: ${height};"
                            onclick="openImageModal('${url}', '${title || 'Image'}')"
                            loading="lazy"
                        >
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                            </svg>
                        </div>
                    </div>
                    ${title ? `<h4 class="text-white font-semibold mt-3">${title}</h4>` : ''}
                    ${description ? `<p class="text-gray-300 text-sm mt-2">${description}</p>` : ''}
                </div>
            `;
}

function createAudioEmbed(audioItem) {
    const { url, title, description, autoplay = false } = audioItem;

    return `
                <div class="audio-embed mb-6 bg-gray-800 bg-opacity-50 rounded-lg p-4">
                    <audio 
                        class="w-full"
                        controls
                        ${autoplay ? 'autoplay' : ''}
                        preload="metadata">
                        <source src="${url}" type="audio/mpeg">
                        <source src="${url}" type="audio/wav">
                        <source src="${url}" type="audio/ogg">
                        Your browser does not support the audio element.
                    </audio>
                    ${title ? `<h4 class="text-white font-semibold mt-3">${title}</h4>` : ''}
                    ${description ? `<p class="text-gray-300 text-sm mt-2">${description}</p>` : ''}
                </div>
            `;
}

// Helper functions
function extractYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function extractVimeoID(url) {
    const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/)|(staff\/picks\/)|(video\/))?([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[7] : null;
}

function initializeEmbeddedContent() {
    // Initialize any special embedded content that needs JavaScript
    // This could include lazy loading, analytics, etc.
}

function openImageModal(imageUrl, title) {
    // Create and show image modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90';
    modal.innerHTML = `
                <div class="relative max-w-4xl max-h-full p-4">
                    <button onclick="this.parentElement.parentElement.remove()" 
                            class="absolute -top-2 -right-2 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white z-10">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <img src="${imageUrl}" alt="${title}" class="max-w-full max-h-full rounded-lg">
                    ${title !== 'Image' ? `<p class="text-center text-white mt-4 text-lg">${title}</p>` : ''}
                </div>
            `;

    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    };

    document.body.appendChild(modal);
}

function navigateToNode(nodeId) {
    // Fade out current content
    const container = document.getElementById('content-container');
    container.style.opacity = '0';

    setTimeout(() => {
        loadNode(nodeId);
        container.style.opacity = '1';
    }, 300);
}

function returnToUniverse() {
    // Hide content container
    const contentContainer = document.getElementById('content-container');
    contentContainer.classList.remove('active');
    document.body.style.overflow = 'hidden';

    // Reset to initial state - destroy current scene and restart
    isTransitioning = true;

    // Clear the scene
    if (scene) {
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
    }

    // Clear particles array
    particles = [];

    // Reset animation phase
    animationPhase = 'initial';

    setTimeout(() => {
        const canvas = document.getElementById('canvas-container');
        canvas.style.opacity = '1';

        // Restart the entire 3D experience from the beginning
        setupThreeJS();
        startAnimation();

        isTransitioning = false;
    }, 1000);
}

function showConfig() {
    document.getElementById('config-container').classList.add('active');
    loadCurrentJSON();
}

// File upload handling
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showStatusMessage('Please select a valid JSON file.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const jsonText = e.target.result;
            const parsedData = JSON.parse(jsonText);

            // Validate structure
            if (validateJSONStructure(parsedData)) {
                document.getElementById('json-editor').value = JSON.stringify(parsedData, null, 2);
                updateStats();
                showStatusMessage('JSON file loaded successfully!', 'success');
                updateJSONStatus('Valid', 'success');
            } else {
                showStatusMessage('Invalid JSON structure. Please check the format.', 'error');
                updateJSONStatus('Invalid', 'error');
            }
        } catch (error) {
            showStatusMessage('Error parsing JSON file: ' + error.message, 'error');
            updateJSONStatus('Error', 'error');
        }
    };

    reader.onerror = function () {
        showStatusMessage('Error reading file.', 'error');
    };

    reader.readAsText(file);
}

function loadCurrentJSON() {
    // Create default data structure for the config editor
    const defaultData = {
        "startNode": "node1",
        "nodes": {
            "node1": {
                "question": "What is Consciousness?",
                "answer": "Consciousness is the fundamental awareness that underlies all existence. It is the ground of being from which all phenomena arise and into which they dissolve. Rather than being produced by the brain, consciousness is the very fabric of reality itself - the aware presence in which all experiences occur. This primordial awareness is not personal or limited, but is the universal field of knowing that pervades everything.",
                "followUps": [
                    {
                        "prompt": "If everything is Consciousness, then what is God?",
                        "nextNodeId": "node2"
                    },
                    {
                        "prompt": "How does individual awareness emerge from universal consciousness?",
                        "nextNodeId": "node4"
                    }
                ]
            },
            "node2": {
                "question": "What is God?",
                "answer": "God is not a separate being or entity, but the very essence of Consciousness itself. God is the infinite, eternal awareness that is both the source and substance of all existence. When we speak of God, we are pointing to that which is most intimate and immediate - the 'I AM' presence that you are right now. God is not somewhere else; God is the very consciousness through which you are reading these words. The divine is not transcendent in the sense of being apart from creation, but is the very being of creation itself.",
                "followUps": [
                    {
                        "prompt": "What is the purpose of creation?",
                        "nextNodeId": "node3"
                    },
                    {
                        "prompt": "Why does the infinite appear as the finite?",
                        "nextNodeId": "node5"
                    }
                ]
            },
            "node3": {
                "question": "What is the purpose of creation?",
                "answer": "Creation exists for the sheer joy of being and knowing itself. Like an artist who creates not from necessity but from love, Consciousness manifests the universe as an expression of its infinite creative potential. There is no external purpose or goal - the purpose is the very expression itself. Each moment, each being, each experience is Consciousness exploring and celebrating its own infinite nature. The purpose of creation is play, love, and the endless celebration of being.",
                "followUps": [
                    {
                        "prompt": "How do we recognize our true nature?",
                        "nextNodeId": "node6"
                    }
                ]
            },
            "node4": {
                "question": "How does individual awareness emerge?",
                "answer": "Individual awareness is like a wave on the ocean - it appears to be separate but is never actually apart from the whole. The universal consciousness, through a divine play of forgetting and remembering, seems to localize itself into countless points of individual experience. Yet this apparent separation is only a play of appearances. The wave is always ocean, and individual awareness is always the one universal consciousness experiencing itself from a particular perspective.",
                "followUps": [
                    {
                        "prompt": "What is the purpose of creation?",
                        "nextNodeId": "node3"
                    }
                ]
            },
            "node5": {
                "question": "Why does the infinite appear as the finite?",
                "answer": "The infinite appears as the finite not because it becomes limited, but because it is so unlimited that it can even appear to limit itself. This is the supreme freedom of consciousness - the ability to play all roles, to experience all possibilities. The infinite doesn't become finite; rather, the finite is how the infinite appears to itself. It's like an actor who is so skilled they can completely embody any character while never ceasing to be themselves.",
                "followUps": [
                    {
                        "prompt": "How do we recognize our true nature?",
                        "nextNodeId": "node6"
                    }
                ]
            },
            "node6": {
                "question": "How do we recognize our true nature?",
                "answer": "Recognition of our true nature doesn't require acquiring something new, but rather the falling away of what we are not. Simply notice the awareness that is present right now - the knowing presence in which thoughts, feelings, and perceptions appear. This awareness is not personal; it is the same consciousness that knows itself in all beings. The recognition is immediate and intimate: 'I AM' - not 'I am something' but simply the pure fact of being aware. This is your true face, the consciousness you have always been.",
                "followUps": []
            }
        }
    };

    // Add example with media to show the new capabilities
    const exampleWithMedia = {
        "startNode": "node1",
        "nodes": {
            "node1": {
                "question": "What is Consciousness?",
                "answer": "Consciousness is the fundamental awareness that underlies all existence...",
                "media": [
                    {
                        "type": "video",
                        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        "title": "Understanding Consciousness",
                        "description": "A deep dive into the nature of awareness"
                    },
                    {
                        "type": "link",
                        "url": "https://example.com/consciousness-article",
                        "title": "Scientific Studies on Consciousness",
                        "description": "Latest research and findings in consciousness studies",
                        "image": "https://example.com/preview.jpg",
                        "domain": "example.com"
                    },
                    {
                        "type": "image",
                        "url": "https://example.com/brain-image.jpg",
                        "title": "The Conscious Brain",
                        "description": "Neural pathways of awareness"
                    },
                    {
                        "type": "audio",
                        "url": "https://example.com/meditation.mp3",
                        "title": "Guided Consciousness Meditation",
                        "description": "10-minute awareness practice"
                    }
                ],
                "followUps": [
                    {
                        "prompt": "If everything is Consciousness, then what is God?",
                        "nextNodeId": "node2"
                    }
                ]
            }
        }
    };

    // Use loaded data if available, otherwise use default with media example
    const dataToShow = contentData || exampleWithMedia;
    document.getElementById('json-editor').value = JSON.stringify(dataToShow, null, 2);
    updateStats();
    showStatusMessage('Data loaded into editor!', 'success');
    updateJSONStatus('Valid', 'success');
}

function saveJSON() {
    const jsonText = document.getElementById('json-editor').value;
    try {
        const parsedData = JSON.parse(jsonText);

        if (!validateJSONStructure(parsedData)) {
            showStatusMessage('Invalid JSON structure. Please validate before downloading.', 'error');
            return;
        }

        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();

        URL.revokeObjectURL(url);

        showStatusMessage('JSON file downloaded successfully!', 'success');
        updateJSONStatus('Downloaded', 'success');
    } catch (error) {
        showStatusMessage('Invalid JSON format: ' + error.message, 'error');
        updateJSONStatus('Error', 'error');
    }
}

function validateJSON() {
    const jsonText = document.getElementById('json-editor').value;
    try {
        const parsedData = JSON.parse(jsonText);

        if (validateJSONStructure(parsedData)) {
            showStatusMessage('JSON is valid and properly structured!', 'success');
            updateJSONStatus('Valid', 'success');
        } else {
            showStatusMessage('JSON syntax is valid but structure is incorrect.', 'warning');
            updateJSONStatus('Warning', 'warning');
        }
    } catch (error) {
        showStatusMessage('JSON syntax error: ' + error.message, 'error');
        updateJSONStatus('Invalid', 'error');
    }
}

function validateJSONStructure(data) {
    if (!data.startNode || !data.nodes) return false;

    const startNodeExists = data.nodes[data.startNode];
    if (!startNodeExists) return false;

    for (const nodeId in data.nodes) {
        const node = data.nodes[nodeId];
        if (!node.question || !node.answer || !Array.isArray(node.followUps)) {
            return false;
        }

        for (const followUp of node.followUps) {
            if (!followUp.prompt || !followUp.nextNodeId) return false;
        }
    }

    return true;
}

function formatJSON() {
    const jsonText = document.getElementById('json-editor').value;
    try {
        const parsedData = JSON.parse(jsonText);
        document.getElementById('json-editor').value = JSON.stringify(parsedData, null, 2);
        updateStats();
        showStatusMessage('JSON formatted successfully!', 'success');
        updateJSONStatus('Formatted', 'success');
    } catch (error) {
        showStatusMessage('Cannot format invalid JSON: ' + error.message, 'error');
        updateJSONStatus('Error', 'error');
    }
}

function previewChanges() {
    const jsonText = document.getElementById('json-editor').value;
    try {
        const parsedData = JSON.parse(jsonText);

        if (!validateJSONStructure(parsedData)) {
            showStatusMessage('Cannot preview: Invalid JSON structure.', 'error');
            return;
        }

        // Temporarily update the content data
        const originalData = { ...contentData };
        Object.assign(contentData, parsedData);

        // Show preview message
        showStatusMessage('Preview mode activated! Changes are temporary until downloaded.', 'info');

        // Return to main experience to see changes
        setTimeout(() => {
            window.location.hash = '';
            location.reload();
        }, 2000);

    } catch (error) {
        showStatusMessage('Cannot preview invalid JSON: ' + error.message, 'error');
    }
}

function copyToClipboard() {
    const jsonText = document.getElementById('json-editor').value;
    navigator.clipboard.writeText(jsonText).then(() => {
        showStatusMessage('JSON copied to clipboard!', 'success');
    }).catch(() => {
        showStatusMessage('Failed to copy to clipboard.', 'error');
    });
}

function clearEditor() {
    if (confirm('Are you sure you want to clear the editor? This cannot be undone.')) {
        document.getElementById('json-editor').value = '';
        updateStats();
        showStatusMessage('Editor cleared.', 'info');
        updateJSONStatus('Empty', 'warning');
    }
}

function updateStats() {
    const jsonText = document.getElementById('json-editor').value;
    const lines = jsonText.split('\n').length;
    const chars = jsonText.length;

    document.getElementById('line-count').textContent = lines;
    document.getElementById('char-count').textContent = chars;

    try {
        const data = JSON.parse(jsonText);
        const nodeCount = data.nodes ? Object.keys(data.nodes).length : 0;
        document.getElementById('node-count').textContent = nodeCount;
    } catch {
        document.getElementById('node-count').textContent = '?';
    }
}

function updateJSONStatus(status, type) {
    const statusElement = document.getElementById('json-status');
    statusElement.textContent = status;

    // Reset classes
    statusElement.className = 'ml-auto text-sm px-2 py-1 rounded-full';

    switch (type) {
        case 'success':
            statusElement.classList.add('bg-green-700', 'text-green-200');
            break;
        case 'error':
            statusElement.classList.add('bg-red-700', 'text-red-200');
            break;
        case 'warning':
            statusElement.classList.add('bg-amber-700', 'text-amber-200');
            break;
        case 'info':
            statusElement.classList.add('bg-blue-700', 'text-blue-200');
            break;
        default:
            statusElement.classList.add('bg-gray-700', 'text-gray-300');
    }
}

function showStatusMessage(message, type) {
    const messageElement = document.getElementById('status-message');
    const textElement = document.getElementById('status-text');

    textElement.textContent = message;
    messageElement.className = 'mb-6 p-4 rounded-lg border';

    switch (type) {
        case 'success':
            messageElement.classList.add('bg-green-900', 'border-green-500', 'text-green-200');
            break;
        case 'error':
            messageElement.classList.add('bg-red-900', 'border-red-500', 'text-red-200');
            break;
        case 'warning':
            messageElement.classList.add('bg-amber-900', 'border-amber-500', 'text-amber-200');
            break;
        case 'info':
            messageElement.classList.add('bg-blue-900', 'border-blue-500', 'text-blue-200');
            break;
        default:
            messageElement.classList.add('bg-gray-900', 'border-gray-500', 'text-gray-200');
    }

    messageElement.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);
}

function handleEditorKeydown(event) {
    // Add tab support for better JSON editing
    if (event.key === 'Tab') {
        event.preventDefault();
        const textarea = event.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateStats();
    }
}

function returnToMain() {
    window.location.hash = '';
    location.reload();
}

function onWindowResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle URL hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash === 'config') {
        showConfig();
    } else if (hash === '') {
        // Returning to main experience
        document.getElementById('config-container').classList.remove('active');
        if (!contentData) {
            loadDataFromFile();
        }
    }
});

// Initialize the application
init();
