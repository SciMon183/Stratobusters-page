/**
 * OrbitControls for Three.js
 * Simplified version for r128
 */
THREE.OrbitControls = function ( object, domElement ) {
	this.object = object;
	this.domElement = domElement !== undefined ? domElement : document;
	
	// Set to false to disable this control
	this.enabled = true;
	
	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();
	
	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;
	
	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;
	
	// How far you can orbit vertically, upper and lower limits.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians
	
	// How far you can orbit horizontally, upper and lower limits.
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians
	
	// Set to true to enable damping (inertia)
	this.enableDamping = false;
	this.dampingFactor = 0.05;
	
	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	this.enableZoom = true;
	this.zoomSpeed = 1.0;
	
	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;
	
	// Set to false to disable panning
	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = false;
	this.keyPanSpeed = 7.0;
	
	// Set to true to automatically rotate around the target
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0;
	
	// Set to false to disable use of the keys
	this.enableKeys = true;
	
	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
	
	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
	
	// Touch fingers
	this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
	
	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;
	
	// the target DOM element for key events
	this._domElementKeyEvents = null;
	
	//
	// public methods
	//
	
	this.getPolarAngle = function () {
		return spherical.phi;
	};
	
	this.getAzimuthalAngle = function () {
		return spherical.theta;
	};
	
	this.getDistance = function () {
		return this.object.position.distanceTo( this.target );
	};
	
	this.listenToKeyEvents = function ( domElement ) {
		domElement.addEventListener( 'keydown', onKeyDown );
		this._domElementKeyEvents = domElement;
	};
	
	this.saveState = function () {
		this.target0.copy( this.target );
		this.position0.copy( this.object.position );
		this.zoom0 = this.object.zoom;
	};
	
	this.reset = function () {
		this.target.copy( this.target0 );
		this.object.position.copy( this.position0 );
		this.object.zoom = this.zoom0;
		this.object.updateProjectionMatrix();
		this.dispatchEvent( { type: 'change' } );
		this.update();
	};
	
	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {
		const offset = new THREE.Vector3();
		const quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		const quatInverse = quat.clone().inverse();
		const lastPosition = new THREE.Vector3();
		const lastQuaternion = new THREE.Quaternion();
		
		const twoPI = 2 * Math.PI;
		
		return function update() {
			const position = this.object.position;
			offset.copy( position ).sub( this.target );
			offset.applyQuaternion( quatInverse );
			spherical.setFromVector3( offset );
			
			if ( this.autoRotate && state === STATE.NONE ) {
				rotateLeft( getAutoRotationAngle() );
			}
			
			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;
			
			spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, spherical.theta ) );
			spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, spherical.phi ) );
			spherical.makeSafe();
			spherical.radius *= scale;
			spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, spherical.radius ) );
			this.target.addScaledVector( panOffset, 1 );
			offset.setFromSpherical( spherical );
			offset.applyQuaternion( quat );
			position.copy( this.target ).add( offset );
			this.object.lookAt( this.target );
			
			if ( this.enableDamping === true ) {
				sphericalDelta.theta *= ( 1 - this.dampingFactor );
				sphericalDelta.phi *= ( 1 - this.dampingFactor );
				panOffset.multiplyScalar( 1 - this.dampingFactor );
			} else {
				sphericalDelta.set( 0, 0, 0 );
				panOffset.set( 0, 0, 0 );
			}
			
			scale = 1;
			
			if ( zoomChanged || lastPosition.distanceToSquared( this.object.position ) > EPS || lastQuaternion.distanceToSquared( this.object.quaternion ) > EPS ) {
				this.dispatchEvent( { type: 'change' } );
				lastPosition.copy( this.object.position );
				lastQuaternion.copy( this.object.quaternion );
				zoomChanged = false;
				return true;
			}
			
			return false;
		};
	}();
	
	this.dispose = function () {
		this.domElement.removeEventListener( 'contextmenu', onContextMenu );
		this.domElement.removeEventListener( 'mousedown', onMouseDown );
		this.domElement.removeEventListener( 'wheel', onMouseWheel );
		this.domElement.removeEventListener( 'touchstart', onTouchStart );
		this.domElement.removeEventListener( 'touchend', onTouchEnd );
		this.domElement.removeEventListener( 'touchmove', onTouchMove );
		document.removeEventListener( 'mousemove', onMouseMove );
		document.removeEventListener( 'mouseup', onMouseUp );
		if ( this._domElementKeyEvents !== null ) {
			this._domElementKeyEvents.removeEventListener( 'keydown', onKeyDown );
		}
	};
	
	//
	// internals
	//
	
	const scope = this;
	const STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_PAN: 4, TOUCH_DOLLY_PAN: 5, TOUCH_DOLLY_ROTATE: 6 };
	let state = STATE.NONE;
	const EPS = 0.000001;
	const spherical = new THREE.Spherical();
	const sphericalDelta = new THREE.Spherical();
	let scale = 1;
	const panOffset = new THREE.Vector3();
	let zoomChanged = false;
	const rotateStart = new THREE.Vector2();
	const rotateEnd = new THREE.Vector2();
	const rotateDelta = new THREE.Vector2();
	const panStart = new THREE.Vector2();
	const panEnd = new THREE.Vector2();
	const panDelta = new THREE.Vector2();
	const dollyStart = new THREE.Vector2();
	const dollyEnd = new THREE.Vector2();
	const dollyDelta = new THREE.Vector2();
	
	function getAutoRotationAngle() {
		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	}
	
	function getZoomScale() {
		return Math.pow( 0.95, scope.zoomSpeed );
	}
	
	function rotateLeft( angle ) {
		sphericalDelta.theta -= angle;
	}
	
	function rotateUp( angle ) {
		sphericalDelta.phi -= angle;
	}
	
	const panLeft = function () {
		const v = new THREE.Vector3();
		return function panLeft( distance, objectMatrix ) {
			v.setFromMatrixColumn( objectMatrix, 0 );
			v.multiplyScalar( - distance );
			panOffset.add( v );
		};
	}();
	
	const panUp = function () {
		const v = new THREE.Vector3();
		return function panUp( distance, objectMatrix ) {
			if ( scope.screenSpacePanning === true ) {
				v.setFromMatrixColumn( objectMatrix, 1 );
			} else {
				v.setFromMatrixColumn( objectMatrix, 0 );
				v.crossVectors( scope.object.up, v );
			}
			v.multiplyScalar( distance );
			panOffset.add( v );
		};
	}();
	
	const pan = function () {
		const offset = new THREE.Vector3();
		return function pan( deltaX, deltaY ) {
			const element = scope.domElement;
			if ( scope.object.isPerspectiveCamera ) {
				const position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				let targetDistance = offset.length();
				targetDistance *= Math.tan( scope.object.fov / 2 * Math.PI / 180.0 );
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );
			} else if ( scope.object.isOrthographicCamera ) {
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );
			} else {
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - panning disabled.' );
			}
		};
	}();
	
	function dollyOut( dollyScale ) {
		if ( scope.object.isPerspectiveCamera ) {
			scale /= dollyScale;
		} else if ( scope.object.isOrthographicCamera ) {
			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;
		} else {
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
		}
	}
	
	function dollyIn( dollyScale ) {
		if ( scope.object.isPerspectiveCamera ) {
			scale *= dollyScale;
		} else if ( scope.object.isOrthographicCamera ) {
			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;
		} else {
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
		}
	}
	
	function handleMouseDownRotate( event ) {
		rotateStart.set( event.clientX, event.clientY );
	}
	
	function handleMouseDownDolly( event ) {
		dollyStart.set( event.clientX, event.clientY );
	}
	
	function handleMouseDownPan( event ) {
		panStart.set( event.clientX, event.clientY );
	}
	
	function handleMouseMoveRotate( event ) {
		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
		const element = scope.domElement;
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight );
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
		rotateStart.copy( rotateEnd );
	}
	
	function handleMouseMoveDolly( event ) {
		dollyEnd.set( event.clientX, event.clientY );
		dollyDelta.subVectors( dollyEnd, dollyStart );
		if ( dollyDelta.y > 0 ) {
			dollyOut( getZoomScale() );
		} else if ( dollyDelta.y < 0 ) {
			dollyIn( getZoomScale() );
		}
		dollyStart.copy( dollyEnd );
	}
	
	function handleMouseMovePan( event ) {
		panEnd.set( event.clientX, event.clientY );
		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );
		pan( panDelta.x, panDelta.y );
		panStart.copy( panEnd );
	}
	
	function handleMouseWheel( event ) {
		if ( event.deltaY < 0 ) {
			dollyIn( getZoomScale() );
		} else if ( event.deltaY > 0 ) {
			dollyOut( getZoomScale() );
		}
	}
	
	function handleTouchStartRotate( event ) {
		if ( event.touches.length === 1 ) {
			rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		} else {
			const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
			rotateStart.set( x, y );
		}
	}
	
	function handleTouchStartPan( event ) {
		if ( event.touches.length === 1 ) {
			panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		} else {
			const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
			panStart.set( x, y );
		}
	}
	
	function handleTouchStartDolly( event ) {
		const dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		const dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
		const distance = Math.sqrt( dx * dx + dy * dy );
		dollyStart.set( 0, distance );
	}
	
	function handleTouchStartDollyPan( event ) {
		if ( scope.enableZoom ) handleTouchStartDolly( event );
		if ( scope.enablePan ) handleTouchStartPan( event );
	}
	
	function handleTouchStartDollyRotate( event ) {
		if ( scope.enableZoom ) handleTouchStartDolly( event );
		if ( scope.enableRotate ) handleTouchStartRotate( event );
	}
	
	function handleTouchMoveRotate( event ) {
		if ( event.touches.length === 1 ) {
			rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		} else {
			const position = getSecondTouchPosition( event );
			const x = 0.5 * ( event.touches[ 0 ].pageX + position.x );
			const y = 0.5 * ( event.touches[ 0 ].pageY + position.y );
			rotateEnd.set( x, y );
		}
		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
		const element = scope.domElement;
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight );
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
		rotateStart.copy( rotateEnd );
	}
	
	function handleTouchMovePan( event ) {
		if ( event.touches.length === 1 ) {
			panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		} else {
			const position = getSecondTouchPosition( event );
			const x = 0.5 * ( event.touches[ 0 ].pageX + position.x );
			const y = 0.5 * ( event.touches[ 0 ].pageY + position.y );
			panEnd.set( x, y );
		}
		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );
		pan( panDelta.x, panDelta.y );
		panStart.copy( panEnd );
	}
	
	function handleTouchMoveDolly( event ) {
		const dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		const dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
		const distance = Math.sqrt( dx * dx + dy * dy );
		dollyEnd.set( 0, distance );
		const d = dollyEnd.y / dollyStart.y;
		dollyOut( d );
		dollyStart.copy( dollyEnd );
	}
	
	function handleTouchMoveDollyPan( event ) {
		if ( scope.enableZoom ) handleTouchMoveDolly( event );
		if ( scope.enablePan ) handleTouchMovePan( event );
	}
	
	function handleTouchMoveDollyRotate( event ) {
		if ( scope.enableZoom ) handleTouchMoveDolly( event );
		if ( scope.enableRotate ) handleTouchMoveRotate( event );
	}
	
	function onMouseDown( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
		if ( event.button === scope.mouseButtons.ORBIT ) {
			if ( scope.enableRotate === false ) return;
			handleMouseDownRotate( event );
			state = STATE.ROTATE;
		} else if ( event.button === scope.mouseButtons.ZOOM ) {
			if ( scope.enableZoom === false ) return;
			handleMouseDownDolly( event );
			state = STATE.DOLLY;
		} else if ( event.button === scope.mouseButtons.PAN ) {
			if ( scope.enablePan === false ) return;
			handleMouseDownPan( event );
			state = STATE.PAN;
		}
		if ( state !== STATE.NONE ) {
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
		}
	}
	
	function onMouseMove( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
		if ( state === STATE.ROTATE ) {
			if ( scope.enableRotate === false ) return;
			handleMouseMoveRotate( event );
		} else if ( state === STATE.DOLLY ) {
			if ( scope.enableZoom === false ) return;
			handleMouseMoveDolly( event );
		} else if ( state === STATE.PAN ) {
			if ( scope.enablePan === false ) return;
			handleMouseMovePan( event );
		}
	}
	
	function onMouseUp( event ) {
		if ( scope.enabled === false ) return;
		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		state = STATE.NONE;
	}
	
	function onMouseWheel( event ) {
		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;
		event.preventDefault();
		event.stopPropagation();
		handleMouseWheel( event );
		scope.dispatchEvent( { type: 'change' } );
	}
	
	function onTouchStart( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
		switch ( event.touches.length ) {
			case 1:
				if ( scope.touches.ONE === THREE.TOUCH.ROTATE && scope.enableRotate === false ) return;
				handleTouchStartRotate( event );
				state = STATE.TOUCH_ROTATE;
				break;
			case 2:
				if ( scope.touches.TWO === THREE.TOUCH.DOLLY_PAN && scope.enableZoom === false && scope.enablePan === false ) return;
				handleTouchStartDollyPan( event );
				state = STATE.TOUCH_DOLLY_PAN;
				break;
			default:
				state = STATE.NONE;
		}
	}
	
	function onTouchMove( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
		switch ( event.touches.length ) {
			case 1:
				if ( scope.touches.ONE === THREE.TOUCH.ROTATE && scope.enableRotate === false ) return;
				handleTouchMoveRotate( event );
				state = STATE.TOUCH_ROTATE;
				break;
			case 2:
				if ( scope.touches.TWO === THREE.TOUCH.DOLLY_PAN && scope.enableZoom === false && scope.enablePan === false ) return;
				handleTouchMoveDollyPan( event );
				state = STATE.TOUCH_DOLLY_PAN;
				break;
			default:
				state = STATE.NONE;
		}
	}
	
	function onTouchEnd( event ) {
		if ( scope.enabled === false ) return;
		state = STATE.NONE;
	}
	
	function onContextMenu( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
	}
	
	function onKeyDown( event ) {
		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;
		switch ( event.keyCode ) {
			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;
			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;
			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;
			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;
		}
	}
	
	function getSecondTouchPosition( event ) {
		if ( event.touches.length > 1 ) {
			return {
				x: event.touches[ 1 ].pageX,
				y: event.touches[ 1 ].pageY
			};
		}
		return {
			x: event.touches[ 0 ].pageX,
			y: event.touches[ 0 ].pageY
		};
	}
	
	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );
	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );
	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );
	
	this.update();
};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

// Constants
THREE.MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 };
THREE.TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };
