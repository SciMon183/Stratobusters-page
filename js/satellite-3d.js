// 3D Satellite Model using Three.js with Mouse Controls
(function() {
    const container = document.getElementById('satellite-container');
    const canvas = document.getElementById('satellite-canvas');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const modelFormatSelect = document.getElementById('modelFormat');
    const resetViewBtn = document.getElementById('resetView');

    if (!container || !canvas) return;

    let scene, camera, renderer, satellite, controls;
    let animationId;
    let currentFormat = 'stl';

    function init() {
        // Scene setup
        scene = new THREE.Scene();
        const theme = document.documentElement.getAttribute('data-theme');
        scene.background = new THREE.Color(theme === 'dark' ? 0x0a0a0a : 0xf5f5f5);

        // Camera setup
        camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 5);

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(5, 5, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, -5, -5);
        scene.add(directionalLight2);

        // Add simple orbit controls for mouse interaction
        if (typeof SimpleOrbitControls !== 'undefined') {
            controls = new SimpleOrbitControls(camera, canvas);
        }

        // Load initial model
        loadModel(currentFormat);

        // Handle window resize
        window.addEventListener('resize', onWindowResize);

        // Format switcher
        if (modelFormatSelect) {
            modelFormatSelect.addEventListener('change', (e) => {
                currentFormat = e.target.value;
                loadModel(currentFormat);
            });
        }

        // Reset view button
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                if (controls) {
                    controls.reset();
                } else {
                    camera.position.set(0, 0, 5);
                    camera.lookAt(0, 0, 0);
                }
            });
        }
        
        // Update scene background when theme changes
        const themeObserver = new MutationObserver(() => {
            const theme = document.documentElement.getAttribute('data-theme');
            scene.background = new THREE.Color(theme === 'dark' ? 0x0a0a0a : 0xf5f5f5);
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Start animation
        animate();
    }

    function loadModel(format) {
        // Remove existing model
        if (satellite) {
            scene.remove(satellite);
            satellite = null;
        }

        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
            loadingSpinner.querySelector('p').textContent = 'Loading 3D Model...';
        }

        if (format === 'stl') {
            loadSTLModel();
        } else if (format === 'ptr') {
            loadPTRModel();
        } else if (format === 'stp') {
            loadSTPModel();
        }
    }

    function loadSTLModel() {
        let attempts = 0;
        const maxAttempts = 20;
        
        function tryLoad() {
            attempts++;
            
            if (typeof THREE === 'undefined') {
                if (attempts < maxAttempts) {
                    setTimeout(tryLoad, 100);
                    return;
                } else {
                    console.error('Three.js not loaded.');
                    createPlaceholderModel();
                    return;
                }
            }
            
            if (typeof THREE.STLLoader === 'undefined') {
                if (attempts < maxAttempts) {
                    setTimeout(tryLoad, 100);
                    return;
                } else {
                    console.error('STLLoader not available.');
                    createPlaceholderModel();
                    return;
                }
            }

            console.log('Loading STL model from models/satellite.stl...');
            const loader = new THREE.STLLoader();
            
            loader.load(
                'models/satellite.stl',
                function(geometry) {
                    console.log('✓ STL model loaded successfully!');
                    
                    const material = new THREE.MeshPhongMaterial({
                        color: 0x0066ff,
                        shininess: 100,
                        specular: 0x222222,
                        side: THREE.DoubleSide
                    });

                    satellite = new THREE.Mesh(geometry, material);
                    setupModel(geometry);
                },
                function(progress) {
                    if (progress.lengthComputable) {
                        const percentComplete = (progress.loaded / progress.total) * 100;
                        if (loadingSpinner) {
                            loadingSpinner.querySelector('p').textContent = 
                                'Loading STL... ' + Math.round(percentComplete) + '%';
                        }
                    }
                },
                function(error) {
                    console.error('Error loading STL:', error);
                    createPlaceholderModel();
                }
            );
        }
        
        tryLoad();
    }

    function loadPTRModel() {
        let attempts = 0;
        const maxAttempts = 20;
        
        function tryLoad() {
            attempts++;
            
            if (typeof THREE === 'undefined') {
                if (attempts < maxAttempts) {
                    setTimeout(tryLoad, 100);
                    return;
                } else {
                    console.error('Three.js not loaded.');
                    createPlaceholderModel();
                    return;
                }
            }
            
            if (typeof THREE.PLYLoader === 'undefined') {
                if (attempts < maxAttempts) {
                    setTimeout(tryLoad, 100);
                    return;
                } else {
                    console.error('PLYLoader not available for PTR files.');
                    createPlaceholderModel();
                    return;
                }
            }

            console.log('Loading PTR model from models/satellite.ptr...');
            const loader = new THREE.PLYLoader();
            
            loader.load(
                'models/satellite.ptr',
                function(geometry) {
                    console.log('✓ PTR model loaded successfully!');
                    
                    // Check if geometry has colors
                    const hasColors = geometry.attributes.color !== undefined;
                    
                    let material;
                    if (hasColors) {
                        material = new THREE.MeshPhongMaterial({
                            vertexColors: true,
                            shininess: 100,
                            side: THREE.DoubleSide
                        });
                        console.log('Using vertex colors from PTR file');
                    } else {
                        material = new THREE.MeshPhongMaterial({
                            color: 0x0066ff,
                            shininess: 100,
                            side: THREE.DoubleSide
                        });
                    }

                    satellite = new THREE.Mesh(geometry, material);
                    setupModel(geometry);
                },
                function(progress) {
                    if (progress.lengthComputable) {
                        const percentComplete = (progress.loaded / progress.total) * 100;
                        if (loadingSpinner) {
                            loadingSpinner.querySelector('p').textContent = 
                                'Loading PTR... ' + Math.round(percentComplete) + '%';
                        }
                    }
                },
                function(error) {
                    console.error('Error loading PTR:', error);
                    console.log('Trying STL as fallback...');
                    loadSTLModel();
                }
            );
        }
        
        tryLoad();
    }

    function loadSTPModel() {
        console.log('STP format requires server-side conversion.');
        console.log('Please convert STP to STL or PTR format, or use a conversion service.');
        if (loadingSpinner) {
            loadingSpinner.querySelector('p').textContent = 'STP requires conversion. Use STL or PTR.';
        }
        setTimeout(() => {
            createPlaceholderModel();
        }, 2000);
    }

    function setupModel(geometry) {
        // Center and scale the model
        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        geometry.translate(-center.x, -center.y, -center.z);
        
        const size = geometry.boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        satellite.scale.set(scale, scale, scale);

        scene.add(satellite);
        
        // Reset camera position
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        } else {
            camera.position.set(0, 0, 5);
            camera.lookAt(0, 0, 0);
        }
        
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        console.log('✓ 3D model displayed successfully');
    }

    function createPlaceholderModel() {
        const group = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(1, 1, 0.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066ff,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);

        // Solar panels
        const panelGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.8);
        const panelMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            shininess: 50
        });
        
        const panel1 = new THREE.Mesh(panelGeometry, panelMaterial);
        panel1.position.set(0, 0, 0.5);
        group.add(panel1);

        const panel2 = new THREE.Mesh(panelGeometry, panelMaterial);
        panel2.position.set(0, 0, -0.5);
        group.add(panel2);

        // Antenna
        const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0, 0.6, 0);
        group.add(antenna);

        satellite = group;
        setupModel(new THREE.BoxGeometry(1, 1, 1)); // Dummy geometry for setup
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        // Controls update themselves, no need to call here
        // Fallback auto-rotation only if no controls
        if (!controls && satellite) {
            satellite.rotation.y += 0.005;
            satellite.rotation.x += 0.002;
        }

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        if (!container || !camera || !renderer) return;

        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        
        // Controls handle their own updates
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
