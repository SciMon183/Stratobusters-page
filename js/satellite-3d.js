// 3D Satellite Model using Three.js
(function() {
    const container = document.getElementById('satellite-container');
    const canvas = document.getElementById('satellite-canvas');
    const loadingSpinner = document.getElementById('loadingSpinner');

    if (!container || !canvas) return;

    let scene, camera, renderer, satellite;
    let animationId;

    function init() {
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);

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

        // Try to load STL model
        loadSTLModel();

        // If no STL, create a placeholder model
        setTimeout(() => {
            if (!satellite) {
                createPlaceholderModel();
            }
        }, 2000);

        // Handle window resize
        window.addEventListener('resize', onWindowResize);

        // Start animation
        animate();
    }

    function loadSTLModel() {
        // Check if STLLoader is available
        if (typeof THREE.STLLoader === 'undefined') {
            console.log('STLLoader not available. Using placeholder model.');
            createPlaceholderModel();
            return;
        }

        // Try to load STL file
        const loader = new THREE.STLLoader();
        
        loader.load(
            'models/satellite.stl',
            function(geometry) {
                const material = new THREE.MeshPhongMaterial({
                    color: 0x0066ff,
                    shininess: 100,
                    specular: 0x222222
                });

                satellite = new THREE.Mesh(geometry, material);
                
                // Center and scale the model
                geometry.computeBoundingBox();
                const center = geometry.boundingBox.getCenter(new THREE.Vector3());
                geometry.translate(-center.x, -center.y, -center.z);
                
                const size = geometry.boundingBox.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;
                satellite.scale.set(scale, scale, scale);

                scene.add(satellite);
                if (loadingSpinner) loadingSpinner.style.display = 'none';
            },
            function(progress) {
                // Loading progress
                if (progress.lengthComputable) {
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    console.log('Loading STL model...', percentComplete + '%');
                }
            },
            function(error) {
                console.log('STL model not found. Using placeholder model.');
                createPlaceholderModel();
            }
        );
    }

    function createPlaceholderModel() {
        // Create a simple satellite-like model
        const group = new THREE.Group();

        // Main body (cube)
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
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        if (satellite) {
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
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
