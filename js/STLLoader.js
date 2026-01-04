/**
 * STLLoader for Three.js
 * Based on Three.js r128 STLLoader
 */

THREE.STLLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.path = '';
	this.requestHeader = {};
	this.withCredentials = false;
};

THREE.STLLoader.prototype = {
	constructor: THREE.STLLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		const scope = this;
		const loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
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
	parse: function ( data ) {
		const binData = this.isBinary( data ) ? data : this.ensureBinary( data );
		return this.isBinary( data ) ? this.parseBinary( binData ) : this.parseASCII( this.ensureString( data ) );
	},
	isBinary: function ( data ) {
		// Check if data is a string (ASCII STL)
		if ( typeof data === 'string' ) {
			return false;
		}
		
		// Check if data is an ArrayBuffer
		if ( !( data instanceof ArrayBuffer ) ) {
			return false;
		}
		
		// Check if we have enough data to read the header
		if ( data.byteLength < 84 ) {
			return false;
		}
		
		try {
			const reader = new DataView( data );
			const faces_size = reader.getUint32( 80, true );
			const data_offset = 84;
			const data_length = reader.byteLength;
			const expected_length = data_offset + faces_size * 50;
			return expected_length === data_length;
		} catch ( e ) {
			return false;
		}
	},
	ensureBinary: function ( buffer ) {
		if ( typeof buffer === 'string' ) {
			const array_buffer = new Uint8Array( buffer.length );
			for ( let i = 0; i < buffer.length; i ++ ) {
				array_buffer[ i ] = buffer.charCodeAt( i ) & 0xff;
			}
			return array_buffer.buffer;
		} else {
			return buffer;
		}
	},
	ensureString: function ( buffer ) {
		if ( typeof buffer !== 'string' ) {
			const array_buffer = new Uint8Array( buffer );
			let str = '';
			for ( let i = 0; i < buffer.byteLength; i ++ ) {
				str += String.fromCharCode( array_buffer[ i ] );
			}
			return str;
		} else {
			return buffer;
		}
	},
	parseBinary: function ( data ) {
		const reader = new DataView( data );
		const dataArray = new Uint8Array( data );
		const faces = reader.getUint32( 80, true );
		let r, g, b, hasColors = false;
		let defaultR, defaultG, defaultB, alpha;
		for ( let index = 0; index < 80 - 10; index ++ ) {
			const colorString = String.fromCharCode( dataArray[ index ], dataArray[ index + 1 ], dataArray[ index + 2 ], dataArray[ index + 3 ], dataArray[ index + 4 ], dataArray[ index + 5 ] );
			if ( colorString.indexOf( 'COLOR' ) === 0 ) {
				hasColors = true;
				defaultR = dataArray[ index + 6 ] / 255;
				defaultG = dataArray[ index + 7 ] / 255;
				defaultB = dataArray[ index + 8 ] / 255;
				alpha = dataArray[ index + 9 ] / 255;
			}
		}
		const dataOffset = 84;
		const faceLength = 12 * 4 + 2;
		const geometry = new THREE.BufferGeometry();
		const vertices = [];
		const normals = [];
		const colors = [];
		for ( let face = 0; face < faces; face ++ ) {
			const start = dataOffset + face * faceLength;
			const normalX = reader.getFloat32( start, true );
			const normalY = reader.getFloat32( start + 4, true );
			const normalZ = reader.getFloat32( start + 8, true );
			if ( hasColors ) {
				const packedColor = reader.getUint16( start + 48, true );
				if ( ( packedColor & 0x8000 ) === 0 ) {
					r = ( packedColor & 0x1F ) / 31;
					g = ( ( packedColor >> 5 ) & 0x1F ) / 31;
					b = ( ( packedColor >> 10 ) & 0x1F ) / 31;
				} else {
					r = defaultR;
					g = defaultG;
					b = defaultB;
				}
			}
			for ( let i = 1; i <= 3; i ++ ) {
				const vertexstart = start + i * 12;
				vertices.push( reader.getFloat32( vertexstart, true ) );
				vertices.push( reader.getFloat32( vertexstart + 4, true ) );
				vertices.push( reader.getFloat32( vertexstart + 8, true ) );
				normals.push( normalX, normalY, normalZ );
				if ( hasColors ) {
					colors.push( r, g, b );
				}
			}
		}
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		if ( hasColors ) {
			geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
		}
		return geometry;
	},
	parseASCII: function ( data ) {
		const geometry = new THREE.BufferGeometry();
		const patternFace = /facet([\s\S]*?)endfacet/g;
		let faceCount = 0;
		const normal = new THREE.Vector3();
		const vertices = [];
		const normals = [];
		const vertex = new THREE.Vector3();
		let result;
		while ( ( result = patternFace.exec( data ) ) !== null ) {
			let vertexCount = 0;
			const normalString = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*(?:[eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]+\.?[0-9]*(?:[eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]+\.?[0-9]*(?:[eE][\-+]?[0-9]+)?)+/g.exec( result[ 0 ] );
			if ( normalString !== null ) {
				normal.set( parseFloat( normalString[ 1 ] ), parseFloat( normalString[ 2 ] ), parseFloat( normalString[ 3 ] ) );
			}
			const vertexPattern = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*(?:[eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]+\.?[0-9]*(?:[eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]+\.?[0-9]*(?:[eE][\-+]?[0-9]+)?)+/g;
			while ( ( result = vertexPattern.exec( result[ 0 ] ) ) !== null ) {
				vertex.set( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) );
				vertices.push( vertex.x, vertex.y, vertex.z );
				normals.push( normal.x, normal.y, normal.z );
				vertexCount ++;
			}
			if ( vertexCount !== 3 ) {
				console.warn( 'STLLoader: A face doesn\'t have 3 vertices' );
			}
			faceCount ++;
		}
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		return geometry;
	}
};
