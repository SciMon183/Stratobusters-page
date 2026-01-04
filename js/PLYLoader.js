/**
 * Simplified PLYLoader for Three.js
 * Supports colored PLY/PRT files
 */
THREE.PLYLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.path = '';
	this.requestHeader = {};
	this.withCredentials = false;
};

THREE.PLYLoader.prototype = {
	constructor: THREE.PLYLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		const scope = this;
		const loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'text' );
		if ( scope.requestHeader ) {
			loader.setRequestHeader( scope.requestHeader );
		}
		if ( scope.withCredentials !== undefined ) {
			loader.setWithCredentials( scope.withCredentials );
		}
		loader.load( url, function ( text ) {
			try {
				onLoad( scope.parse( text ) );
			} catch ( e ) {
				if ( onError ) {
					onError( e );
				} else {
					console.error( e );
				}
				if ( scope.manager && scope.manager.itemError ) {
					scope.manager.itemError( url );
				}
			}
		}, onProgress, onError );
	},
	setPath: function ( value ) {
		this.path = value;
		return this;
	},
	setRequestHeader: function ( value ) {
		this.requestHeader = value;
		return this;
	},
	setWithCredentials: function ( value ) {
		this.withCredentials = value;
		return this;
	},
	parse: function ( text ) {
		function parseHeader( text ) {
			const headerEnd = text.indexOf( 'end_header\n' );
			if ( headerEnd === -1 ) {
				throw new Error( 'PLY: Invalid header' );
			}
			const headerText = text.substring( 0, headerEnd + 10 );
			const header = {
				format: 'ascii',
				vertexCount: 0,
				faceCount: 0,
				hasColors: false,
				hasNormals: false,
				headerLength: headerEnd + 10
			};
			const lines = headerText.split( '\n' );
			let currentElement = null;
			for ( let i = 0; i < lines.length; i ++ ) {
				const line = lines[ i ].trim();
				if ( line.startsWith( 'format' ) ) {
					header.format = line.split( ' ' )[ 1 ];
				} else if ( line.startsWith( 'element vertex' ) ) {
					header.vertexCount = parseInt( line.split( ' ' )[ 2 ] );
					currentElement = 'vertex';
				} else if ( line.startsWith( 'element face' ) ) {
					header.faceCount = parseInt( line.split( ' ' )[ 2 ] );
					currentElement = 'face';
				} else if ( line.startsWith( 'property' ) && currentElement === 'vertex' ) {
					if ( line.includes( 'red' ) || line.includes( 'r' ) || 
					     line.includes( 'green' ) || line.includes( 'g' ) ||
					     line.includes( 'blue' ) || line.includes( 'b' ) ) {
						header.hasColors = true;
					}
					if ( line.includes( 'nx' ) || line.includes( 'normal_x' ) ) {
						header.hasNormals = true;
					}
				}
			}
			return header;
		}
		const header = parseHeader( text );
		const bodyText = text.substring( header.headerLength );
		const lines = bodyText.split( '\n' ).filter( l => l.trim() !== '' );
		const vertices = [];
		const colors = [];
		const normals = [];
		const indices = [];
		let vertexIndex = 0;
		let faceIndex = 0;
		for ( let i = 0; i < lines.length; i ++ ) {
			const parts = lines[ i ].trim().split( /\s+/ );
			if ( vertexIndex < header.vertexCount ) {
				const x = parseFloat( parts[ 0 ] );
				const y = parseFloat( parts[ 1 ] );
				const z = parseFloat( parts[ 2 ] );
				vertices.push( x, y, z );
				let offset = 3;
				if ( header.hasNormals ) {
					normals.push( parseFloat( parts[ offset ] ), 
					              parseFloat( parts[ offset + 1 ] ), 
					              parseFloat( parts[ offset + 2 ] ) );
					offset += 3;
				}
				if ( header.hasColors ) {
					const r = parseFloat( parts[ offset ] ) / 255.0;
					const g = parseFloat( parts[ offset + 1 ] ) / 255.0;
					const b = parseFloat( parts[ offset + 2 ] ) / 255.0;
					colors.push( r, g, b );
				}
				vertexIndex ++;
			} else if ( faceIndex < header.faceCount ) {
				const count = parseInt( parts[ 0 ] );
				if ( count === 3 ) {
					indices.push( parseInt( parts[ 1 ] ), 
					              parseInt( parts[ 2 ] ), 
					              parseInt( parts[ 3 ] ) );
				}
				faceIndex ++;
			}
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		if ( normals.length > 0 ) {
			geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		} else {
			geometry.computeVertexNormals();
		}
		if ( colors.length > 0 ) {
			geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
		}
		if ( indices.length > 0 ) {
			geometry.setIndex( indices );
		}
		return geometry;
	}
};
