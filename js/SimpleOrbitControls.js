/**
 * Simple Orbit Controls for Three.js
 * Handles mouse drag to rotate and scroll to zoom
 */
function SimpleOrbitControls(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    this.target = new THREE.Vector3(0, 0, 0);
    this.radius = 5;
    this.theta = 0; // horizontal angle
    this.phi = Math.PI / 2; // vertical angle
    
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    const scope = this;
    
    // Mouse down
    domElement.addEventListener('mousedown', function(e) {
        scope.isDragging = true;
        scope.lastMouseX = e.clientX;
        scope.lastMouseY = e.clientY;
        domElement.style.cursor = 'grabbing';
    });
    
    // Mouse move
    document.addEventListener('mousemove', function(e) {
        if (!scope.isDragging) return;
        
        const deltaX = e.clientX - scope.lastMouseX;
        const deltaY = e.clientY - scope.lastMouseY;
        
        scope.theta -= deltaX * 0.01;
        scope.phi += deltaY * 0.01;
        
        // Limit vertical rotation
        scope.phi = Math.max(0.1, Math.min(Math.PI - 0.1, scope.phi));
        
        scope.lastMouseX = e.clientX;
        scope.lastMouseY = e.clientY;
        
        scope.update();
    });
    
    // Mouse up
    document.addEventListener('mouseup', function() {
        scope.isDragging = false;
        domElement.style.cursor = 'grab';
    });
    
    // Mouse wheel (zoom)
    domElement.addEventListener('wheel', function(e) {
        e.preventDefault();
        scope.radius += e.deltaY * 0.01;
        scope.radius = Math.max(1, Math.min(20, scope.radius));
        scope.update();
    });
    
    // Touch support
    let touchStartDistance = 0;
    let touchStartTheta = 0;
    let touchStartPhi = 0;
    
    domElement.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            scope.isDragging = true;
            scope.lastMouseX = e.touches[0].clientX;
            scope.lastMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDistance = Math.sqrt(dx * dx + dy * dy);
            touchStartTheta = scope.theta;
            touchStartPhi = scope.phi;
        }
    });
    
    domElement.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (e.touches.length === 1 && scope.isDragging) {
            const deltaX = e.touches[0].clientX - scope.lastMouseX;
            const deltaY = e.touches[0].clientY - scope.lastMouseY;
            
            scope.theta -= deltaX * 0.01;
            scope.phi += deltaY * 0.01;
            scope.phi = Math.max(0.1, Math.min(Math.PI - 0.1, scope.phi));
            
            scope.lastMouseX = e.touches[0].clientX;
            scope.lastMouseY = e.touches[0].clientY;
            scope.update();
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const scale = distance / touchStartDistance;
            scope.radius /= scale;
            scope.radius = Math.max(1, Math.min(20, scope.radius));
            scope.update();
        }
    });
    
    domElement.addEventListener('touchend', function() {
        scope.isDragging = false;
    });
    
    this.update = function() {
        // Calculate camera position
        const x = scope.radius * Math.sin(scope.phi) * Math.cos(scope.theta);
        const y = scope.radius * Math.cos(scope.phi);
        const z = scope.radius * Math.sin(scope.phi) * Math.sin(scope.theta);
        
        scope.camera.position.set(
            scope.target.x + x,
            scope.target.y + y,
            scope.target.z + z
        );
        scope.camera.lookAt(scope.target);
    };
    
    this.reset = function() {
        scope.radius = 5;
        scope.theta = 0;
        scope.phi = Math.PI / 2;
        scope.target.set(0, 0, 0);
        scope.update();
    };
    
    // Set initial cursor
    domElement.style.cursor = 'grab';
    
    // Initial update
    this.update();
}
