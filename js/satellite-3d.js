// 3D Satellite Model using Three.js with Mouse Controls
(function() {
    const container = document.getElementById('satellite-container');
    const canvas = document.getElementById('satellite-canvas');
    const loadingSpinner = document.getElementById('loadingSpinner');
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
            alpha: false  // Changed to false for better visibility
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x0a0a0a, 1); // Ensure background is visible

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
        // Initialize controls after a short delay to ensure script is loaded
        setTimeout(() => {
            if (typeof SimpleOrbitControls !== 'undefined') {
                controls = new SimpleOrbitControls(camera, canvas);
                console.log('✓ Orbit controls initialized');
            } else {
                console.warn('SimpleOrbitControls not found - mouse controls disabled');
                console.log('Check that js/SimpleOrbitControls.js is loaded before satellite-3d.js');
            }
        }, 50);

        // Load initial model
        loadModel(currentFormat);

        // Handle window resize
        window.addEventListener('resize', onWindowResize);

        // Format switcher removed - only STL supported

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
        }
    }

    function loadSTLModel() {
        let attempts = 0;
        const maxAttempts = 20;
        let loadTimeout;
        
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
            console.log('Make sure you are using a web server (not file://)');
            
            // Set timeout fallback (60 seconds for large files)
            loadTimeout = setTimeout(() => {
                console.warn('⚠ STL load timeout after 60 seconds');
                console.warn('Check Network tab (F12) to see if file is loading');
                if (loadingSpinner && loadingSpinner.style.display !== 'none') {
                    loadingSpinner.querySelector('p').textContent = 'Loading timeout. Check console.';
                    setTimeout(() => {
                        console.log('Creating placeholder due to timeout');
                        createPlaceholderModel();
                    }, 2000);
                }
            }, 60000);
            
            const loader = new THREE.STLLoader();
            console.log('STLLoader created, starting load...');
            
            loader.load(
                'models/satellite.stl',
                function(geometry) {
                    clearTimeout(loadTimeout);
                    console.log('✓ STL model loaded successfully!');
                    console.log('Vertices:', geometry.attributes.position.count);
                    
                    // Check if geometry is valid
                    if (!geometry || !geometry.attributes || !geometry.attributes.position) {
                        console.error('Invalid geometry loaded');
                        createPlaceholderModel();
                        return;
                    }
                    
                    // Check if STL has color information
                    const hasColors = geometry.attributes.color !== undefined;
                    console.log('STL has colors:', hasColors);
                    
                    let material;
                    if (hasColors) {
                        // Use vertex colors from STL file
                        material = new THREE.MeshPhongMaterial({
                            vertexColors: true,
                            shininess: 100,
                            specular: 0x222222,
                            side: THREE.DoubleSide
                        });
                        console.log('Using vertex colors from STL file');
                    } else {
                        // Apply multi-color material based on position or use gradient
                        material = createMultiColorMaterial(geometry);
                        console.log('Applied multi-color material to STL');
                    }

                    satellite = new THREE.Mesh(geometry, material);
                    satellite.visible = true;
                    console.log('Mesh created, vertices:', geometry.attributes.position.count);
                    setupModel(geometry);
                },
                function(progress) {
                    if (progress.lengthComputable) {
                        const percentComplete = (progress.loaded / progress.total) * 100;
                        if (loadingSpinner) {
                            loadingSpinner.querySelector('p').textContent = 
                                'Loading STL... ' + Math.round(percentComplete) + '%';
                        }
                    } else if (progress.loaded) {
                        console.log('Loading...', (progress.loaded / 1024).toFixed(1), 'KB');
                    }
                },
                function(error) {
                    clearTimeout(loadTimeout);
                    console.error('✗ Error loading STL:', error);
                    console.error('Error type:', error?.type || 'unknown');
                    console.error('Error message:', error?.message || error);
                    console.log('Troubleshooting:');
                    console.log('1. Check browser Network tab (F12) for 404 errors');
                    console.log('2. Verify models/satellite.stl exists');
                    console.log('3. Make sure you are using a web server (not file://)');
                    console.log('4. Check file permissions');
                    console.log('5. Verify the STL file is not corrupted');
                    
                    // Don't create placeholder immediately - let user see the error
                    if (loadingSpinner) {
                        loadingSpinner.querySelector('p').textContent = 'Error loading STL. Check console.';
                        setTimeout(() => {
                            createPlaceholderModel();
                        }, 3000);
                    } else {
                        createPlaceholderModel();
                    }
                }
            );
        }
        
        tryLoad();
    }

    // PRT support removed - use STL with multi-color instead
    function loadPTRModel_DISABLED() {
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

            console.log('Loading PRT model from models/satellite.prt...');
            console.log('⚠️ Note: PRT files must be exported from SolidWorks as PLY format');
            console.log('See models/EXPORT_INSTRUCTIONS.md for export instructions');
            
            let loadTimeout = setTimeout(() => {
                console.warn('PRT load timeout - file might be very large or wrong format');
                if (loadingSpinner && loadingSpinner.style.display !== 'none') {
                    loadingSpinner.querySelector('p').textContent = 'PRT load timeout. Check console.';
                    setTimeout(() => {
                        console.log('Trying STL as fallback...');
                        loadSTLModel();
                    }, 2000);
                }
            }, 60000);
            
            const loader = new THREE.PLYLoader();
            
            loader.load(
                'models/satellite.prt',
                function(geometry) {
                    clearTimeout(loadTimeout);
                    console.log('✓ PRT model loaded successfully!');
                    console.log('Vertices:', geometry.attributes.position ? geometry.attributes.position.count : 0);
                    
                    // Check if geometry is valid
                    if (!geometry || !geometry.attributes || !geometry.attributes.position) {
                        console.error('Invalid PRT geometry loaded');
                        console.log('Trying STL as fallback...');
                        loadSTLModel();
                        return;
                    }
                    
                    // Check if geometry has colors
                    const hasColors = geometry.attributes.color !== undefined;
                    console.log('PRT has colors:', hasColors);
                    
                    let material;
                    if (hasColors) {
                        material = new THREE.MeshPhongMaterial({
                            vertexColors: true,
                            shininess: 100,
                            specular: 0x222222,
                            side: THREE.DoubleSide
                        });
                        console.log('Using vertex colors from PRT file');
                    } else {
                        // Apply multi-color if no colors in file
                        material = createMultiColorMaterial(geometry);
                        console.log('Applied multi-color material to PRT');
                    }

                    satellite = new THREE.Mesh(geometry, material);
                    satellite.visible = true;
                    setupModel(geometry);
                },
                function(progress) {
                    if (progress.lengthComputable) {
                        const percentComplete = (progress.loaded / progress.total) * 100;
                        if (loadingSpinner) {
                            loadingSpinner.querySelector('p').textContent = 
                                'Loading PRT... ' + Math.round(percentComplete) + '%';
                        }
                    } else if (progress.loaded) {
                        console.log('Loading PRT...', (progress.loaded / 1024).toFixed(1), 'KB');
                    }
                },
                function(error) {
                    clearTimeout(loadTimeout);
                    console.error('✗ Error loading PRT:', error);
                    console.error('Error details:', error?.message || error);
                    console.log('');
                    console.log('⚠️ IMPORTANT: Your PRT file is a SolidWorks format that browsers cannot read.');
                    console.log('You need to export it from SolidWorks to PLY format with colors preserved.');
                    console.log('');
                    console.log('📖 See: models/EXPORT_INSTRUCTIONS.md for step-by-step instructions');
                    console.log('');
                    console.log('Quick solution:');
                    console.log('1. Open your model in SolidWorks');
                    console.log('2. File > Save As > PLY format');
                    console.log('3. Enable "Export Colors" or "Vertex Colors"');
                    console.log('4. Save as satellite.prt (or satellite.ply)');
                    console.log('5. Replace the file in models/ folder');
                    console.log('');
                    console.log('Trying STL as fallback...');
                    loadSTLModel();
                }
            );
        }
        
        tryLoad();
    }


    function setupModel(geometry) {
        try {
            // Center and scale the model
            geometry.computeBoundingBox();
            
            if (!geometry.boundingBox) {
                console.error('Bounding box computation failed');
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                return;
            }
            
            const center = geometry.boundingBox.getCenter(new THREE.Vector3());
            console.log('Model center:', center);
            
            geometry.translate(-center.x, -center.y, -center.z);
            
            const modelSize = geometry.boundingBox.getSize(new THREE.Vector3());
            console.log('Model size:', modelSize);
            
            const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
            console.log('Max dimension:', maxDim);
            
            if (maxDim === 0 || !isFinite(maxDim)) {
                console.error('Invalid model dimensions, using default scale');
                satellite.scale.set(1, 1, 1);
            } else {
                const scale = 2 / maxDim;
                console.log('Scale factor:', scale);
                satellite.scale.set(scale, scale, scale);
            }

            // Ensure satellite is added to scene
            if (!scene.children.includes(satellite)) {
                scene.add(satellite);
                console.log('Satellite added to scene');
            }
            
            // Calculate optimal camera distance based on model size
            const cameraDistance = maxDim > 0 ? maxDim * 2.5 : 5;
            
            // Reset camera position
            if (controls) {
                controls.target.set(0, 0, 0);
                controls.radius = cameraDistance;
                controls.update(); // This will update camera position based on new radius
                console.log('Camera controls updated, distance:', cameraDistance);
            } else {
                camera.position.set(0, 0, cameraDistance);
                camera.lookAt(0, 0, 0);
                camera.updateProjectionMatrix();
                console.log('Camera position set to:', camera.position);
            }
            
            // Ensure satellite is visible
            satellite.visible = true;
            satellite.matrixWorldNeedsUpdate = true;
            
            // Force render
            renderer.render(scene, camera);
            
            // Log scene state
            console.log('Scene has', scene.children.length, 'objects');
            scene.children.forEach((child, i) => {
                console.log(`  Object ${i}:`, child.type, 'visible:', child.visible);
            });
            
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            console.log('✓ 3D model displayed successfully');
            console.log('Scene children count:', scene.children.length);
            console.log('Satellite visible:', satellite.visible);
            console.log('Satellite position:', satellite.position);
            console.log('Satellite scale:', satellite.scale);
        } catch (error) {
            console.error('Error in setupModel:', error);
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    function createMultiColorMaterial(geometry) {
        // Create vibrant vertex colors based on position
        const positions = geometry.attributes.position;
        const colors = [];
        
        // Get bounding box for color mapping
        geometry.computeBoundingBox();
        const min = geometry.boundingBox.min;
        const max = geometry.boundingBox.max;
        const range = new THREE.Vector3().subVectors(max, min);
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Create smooth technical color gradient - aerospace/tech theme
            const nx = (x - min.x) / range.x; // Normalized 0-1
            const ny = (y - min.y) / range.y;
            const nz = (z - min.z) / range.z;
            
            // Smooth color interpolation using smoothstep for transitions
            function smoothstep(edge0, edge1, x) {
                const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
                return t * t * (3 - 2 * t);
            }
            
            // Technical color scheme: Deep blue → Cyan → Silver/Gray → Tech blue
            // Bottom zone (0-0.35): Deep space blue
            const bottomBlend = smoothstep(0.35, 0.0, ny);
            const bottomR = 0.1 + nx * 0.15;  // Deep blue with slight variation
            const bottomG = 0.2 + nx * 0.2;
            const bottomB = 0.4 + nz * 0.3;
            
            // Lower-middle zone (0.25-0.55): Tech blue to cyan
            const lowerMidBlend = smoothstep(0.25, 0.4, ny) * smoothstep(0.55, 0.4, ny);
            const lowerMidR = 0.15 + nz * 0.2;
            const lowerMidG = 0.35 + nx * 0.35;
            const lowerMidB = 0.5 + nz * 0.4;
            
            // Upper-middle zone (0.45-0.75): Cyan to silver/gray
            const upperMidBlend = smoothstep(0.45, 0.6, ny) * smoothstep(0.75, 0.6, ny);
            const upperMidR = 0.4 + nx * 0.25;
            const upperMidG = 0.5 + nz * 0.25;
            const upperMidB = 0.6 + nx * 0.25;
            
            // Top zone (0.65-1.0): Silver to tech blue
            const topBlend = smoothstep(0.65, 1.0, ny);
            const topR = 0.5 + nx * 0.2;
            const topG = 0.55 + nz * 0.2;
            const topB = 0.7 + nx * 0.25;
            
            // Blend all zones smoothly
            const totalBlend = bottomBlend + lowerMidBlend + upperMidBlend + topBlend;
            let r = (bottomR * bottomBlend + lowerMidR * lowerMidBlend + 
                     upperMidR * upperMidBlend + topR * topBlend) / totalBlend;
            let g = (bottomG * bottomBlend + lowerMidG * lowerMidBlend + 
                     upperMidG * upperMidBlend + topG * topBlend) / totalBlend;
            let b = (bottomB * bottomBlend + lowerMidB * lowerMidBlend + 
                     upperMidB * upperMidBlend + topB * topBlend) / totalBlend;
            
            // Add subtle metallic variation for technical feel
            const metallic = Math.sin(nx * Math.PI * 4) * Math.cos(nz * Math.PI * 4) * 0.05;
            r += metallic;
            g += metallic;
            b += metallic;
            
            // Ensure colors are in valid range
            r = Math.max(0.1, Math.min(1.0, r));
            g = Math.max(0.15, Math.min(1.0, g));
            b = Math.max(0.3, Math.min(1.0, b));
            
            colors.push(r, g, b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        return new THREE.MeshPhongMaterial({
            vertexColors: true,
            shininess: 100,
            specular: 0x222222,
            side: THREE.DoubleSide
        });
    }

    function createPlaceholderModel() {
        console.log('Creating placeholder model (STL file not loaded)');
        
        // Remove existing satellite if any
        if (satellite) {
            scene.remove(satellite);
        }
        
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
        scene.add(satellite);
        
        // Reset camera
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.radius = 5;
            controls.update();
        } else {
            camera.position.set(0, 0, 5);
            camera.lookAt(0, 0, 0);
        }
        
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        console.log('Placeholder model created');
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        // Controls update themselves, no need to call here
        // Fallback auto-rotation only if no controls
        if (!controls && satellite) {
            satellite.rotation.y += 0.005;
            satellite.rotation.x += 0.002;
        }
        
        // Always render
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
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
