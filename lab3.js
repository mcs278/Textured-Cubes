
// global components
var canvas;
var gl;
var length = 1;
var x = 0; 
var y = 0;
var z = -15;
var time = 0.0;
var timer = new Timer();
var speed20 = 0;
var speed30 = 0;
var non_zoomed_buf;
var zoomed50_buf;
var view_mat;
var proj_mat;
var pos;
var norm;
var image1;
var image2;
var Ulight_pos;
var Ubright;
var Usampler;
var Ushade;
var rotation = false;
var Tscroll = false;
var Trotation = false;
var Arr_pts_prime = [];
var Arr_norm_prime = [];
var Arr_zoom_prime = [];
var Arr_pts = [];
var Arr_norm = [];
var Arr_zoom = [];
var Apos;
var Anorm;
var shininess = 50;
var light_pos = vec3(0.0, 0.0, 0.0);
var shade = false;
var index = 0;
var eye = vec3(0, 0.5, 1.8);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );// creating the canvas and setting alert
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	document.onkeydown = function(e) {// setting the keyboard keys (i, o, r, t ,s,esc,y)
		e = e || window.event;
		
		if(e.keyCode===73) { // "i" move camera closer/forward
			z+=1;
		}
		else if(e.keyCode===79) { // "o" move camera further/backward)
			z-=1;
		}

		else if(e.keyCode===27) { // "esc" resets the camera. This is extra for easiness of the view
			x=0;
			y=0;
			z=-15;
		}
		else if(e.keyCode===82) { // "r" start/stop rotation
			rotation = !rotation;
		}
		else if(e.keyCode===84) { // "t" image rotation
			Trotation = !Trotation;
		}
		else if(e.keyCode===83) { // "s" image scrolling
			Tscroll = !Tscroll;
		}
		else if(e.keyCode===89) { // "y" to enable light and shade. this is extra just playing around with the code
			shade = !shade;
		}
	};
	
    gl.viewport( 0, 0, canvas.width, canvas.height );//setting up the viewport
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );//clearing the color buffer
    gl.enable(gl.DEPTH_TEST);//clearing the z/depth buffer
	
	// use program with shaders
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	//creating the image1 and setting and binding its buffer
	image1 = gl.createTexture();
    image1.image = new Image();
    image1.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, image1); // binding the texture/img
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // using WRAP & repeat texture mapping
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); // using WRAP & repeat texture mapping
		gl.bindTexture(gl.TEXTURE_2D, null);
    }
	image1.image.src = "./Images/m.png"; 

	//creating the image1 and setting and binding its buffer
	image2 = gl.createTexture();
    image2.image = new Image(); 
    image2.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, image2); 
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2.image); 		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //using linear with mag filter as said by professor
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); //Enable Mip Mapping for the zoomed texture using tri-linear filtering
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); //using WRAP & repeat texture mapping
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); //using WRAP & repeat texture mapping
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
    }
	image2.image.src = "./Images/img1.png"; 
	
	cubeVertices = [
        vec3(  length,   length, length ), //cube vertices for cube length 2 units
        vec3(  length,  -length, length ), 
        vec3( -length,   length, length ), 
        vec3( -length,  -length, length ),  
        vec3(  length,   length, -length ),
        vec3(  length,  -length, -length ),
        vec3( -length,   length, -length ), 
        vec3( -length,  -length, -length )    
    ];

	// handling the zoom
    cube(cubeVertices, Arr_pts, Arr_norm, Arr_zoom, 0);	// no zoom
	cube2(cubeVertices, Arr_pts_prime, Arr_norm_prime, Arr_zoom_prime, 0.5); // zoomed out 50% / image shrink

	// setting and binding buffers.
	
    pos = gl.createBuffer(); 	// pos/position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Arr_pts), gl.STATIC_DRAW);
    
	norm = gl.createBuffer();	// norm/normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, norm);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Arr_norm), gl.STATIC_DRAW);
	
	non_zoomed_buf = gl.createBuffer(); // non zoomed buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, non_zoomed_buf);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Arr_zoom), gl.STATIC_DRAW);
	
	zoomed50_buf = gl.createBuffer();	// 5o% zoomed buffer 
    gl.bindBuffer(gl.ARRAY_BUFFER, zoomed50_buf);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Arr_zoom_prime), gl.STATIC_DRAW);
	

	// bounding with the shaders & binding buffers
    Apos = gl.getAttribLocation(program, "pos_shader"); //pos_shader
    gl.enableVertexAttribArray(Apos);
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.vertexAttribPointer(Apos, 3, gl.FLOAT, false, 0, 0);
	
	Anorm = gl.getAttribLocation(program, "norm_shader"); //norm_shader
    gl.enableVertexAttribArray(Anorm);
    gl.bindBuffer(gl.ARRAY_BUFFER, norm);
    gl.vertexAttribPointer(Anorm, 3, gl.FLOAT, false, 0, 0);	
	
	AtextureCoord = gl.getAttribLocation(program, "TextureCoord"); //TextureCoord
    gl.enableVertexAttribArray(AtextureCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, non_zoomed_buf);
    gl.vertexAttribPointer(AtextureCoord, 2, gl.FLOAT, false, 0, 0);	
	
	//setting the uniforms for shader variables
	Ushade = gl.getUniformLocation(program, "shade");
    Ubright = gl.getUniformLocation(program, "shininess");
	Usampler = gl.getUniformLocation(program, "uSampler");
	Umov_mat = gl.getUniformLocation(program, "mov_mat");
    Uproj_mat = gl.getUniformLocation(program, "proj_mat");
    Ulight_pos = gl.getUniformLocation(program, "light_pos");
	//setting camera
    view_mat = lookAt(eye, at, up);
    proj_mat = perspective(50, 1, 0.001, 1000);// using prespective and setting horizontal fov is 50

	//setting the light
	light_mat = view_mat;
	Ulight_mat = gl.getUniformLocation(program, "light_mat");
	gl.uniformMatrix4fv(Ulight_mat, false, flatten(light_mat));
    timer.reset();	// reset timer
    gl.enable(gl.DEPTH_TEST); // enable the z buffer
	
    render();
}

function render() {
	
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// clear the color and z buffers
    time += timer.getElapsedTime() / 1000; // setting timer from milliseconds to seconds
	
	gl.uniform1f(Ushade, shade);// to choose light or color for texture
	
	// if r key is pressed. for rotation 360 is one cycle per sec
	if(rotation) {
		speed20=time*120; 
		speed30=time*180;
	}	
	view_mat = lookAt(eye, at, up);

	gl.uniformMatrix4fv(Uproj_mat, false, flatten(proj_mat)); //setting proj_mat
	gl.uniform3fv(Ulight_pos,  flatten(light_pos));// setting light_pos
    gl.uniform1f(Ubright,  shininess);
	
	// cube 1
	if(Trotation) {	
		var copy_Arr_zoom = Arr_zoom.slice(); // creating a copy of Arr_zoom
		texture_rot(copy_Arr_zoom, time*90);		//make rotation 15 rpm on Arr_zoom
		gl.bindBuffer(gl.ARRAY_BUFFER, non_zoomed_buf);  
		gl.bufferData(gl.ARRAY_BUFFER, flatten(copy_Arr_zoom), gl.STATIC_DRAW);
	}
    gl.bindBuffer(gl.ARRAY_BUFFER, non_zoomed_buf);
    gl.vertexAttribPointer(AtextureCoord, 2, gl.FLOAT, false, 0, 0);
	//moving  the cube
	mov_mat = view_mat;
	mov_mat = mult(mov_mat, translate(vec3(x,y,z)));
	mov_mat = mult(mov_mat, translate(vec3(-4, 0, 0))); // placing in in (-4,0,0)
	mov_mat = mult(mov_mat, rotate(speed20, [0, 1, 0])); // setting rotation speed and axis
    gl.uniformMatrix4fv(Umov_mat, false, flatten(mov_mat));
	//setting texture and binding
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, image1);
    gl.uniform1i(Usampler, 0)
	gl.drawArrays(gl.TRIANGLES, 0, 36);
	// cube 2 
	if(Tscroll) {
		texture_trans(Arr_zoom_prime, 1/60 , time);
		zoomed50_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, zoomed50_buf);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Arr_zoom_prime), gl.STATIC_DRAW);
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, zoomed50_buf);
	gl.vertexAttribPointer(AtextureCoord, 2, gl.FLOAT, false, 0, 0); 
	//setting the move matrix to transform
	mov_mat = view_mat;
	mov_mat = mult(mov_mat, translate(vec3(x,y,z)));
	mov_mat = mult(mov_mat, translate(vec3(4, 0, 0))); // put cube at position (4,0,0)
	mov_mat = mult(mov_mat, rotate(speed30, [1, 0, 0]));// set the speed of rotation and the axis
    gl.uniformMatrix4fv(Umov_mat, false, flatten(mov_mat));
	
	//setting and binding texture
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, image2);
    gl.uniform1i(Usampler, 0)
	// draw cube
	gl.drawArrays(gl.TRIANGLES, 0, 36);
	// loop
    window.requestAnimFrame(render);
}
// modified version of ANGEL's code
function cube2(cube_ver, cube_pts, cube_norm, img_Coord, zoom, scroll_switch){// zoom is - for zoom in, + zoom out, 0 else
    quad2(cube_ver, cube_pts, cube_norm, img_Coord, 0, 1, 2, 3, vec3(0, 0, 1), zoom, scroll_switch);
    quad2(cube_ver, cube_pts, cube_norm, img_Coord, 4, 0, 6, 2, vec3(0, 1, 0), zoom, scroll_switch);
    quad2(cube_ver, cube_pts, cube_norm, img_Coord, 4, 5, 0, 1, vec3(1, 0, 0), zoom, scroll_switch);
    quad2(cube_ver, cube_pts, cube_norm, img_Coord, 2, 3, 6, 7, vec3(1, 0, 1), zoom, scroll_switch);
    quad2(cube_ver, cube_pts, cube_norm, img_Coord, 6, 7, 4, 5, vec3(0, 1, 1), zoom, scroll_switch);
    quad2(cube_ver, cube_pts, cube_norm, img_Coord, 1, 5, 3, 7, vec3(1, 1, 0), zoom);
}

function quad2( cube_ver, cube_pts, cube_norm, img_Coord, v1, v2, v3, v4, norm, zoom){
    cube_norm.push(norm);
    cube_norm.push(norm);
    cube_norm.push(norm);
    cube_norm.push(norm);
    cube_norm.push(norm);
    cube_norm.push(norm);
	// setting texture coordinates should range from (0,1) in both the s and t dimensions
    img_Coord.push(vec2(0-zoom+.5,0-zoom+.5));// made a copy with an added 0.5 to put the 4 small images from 0 to 2 instead from -.5 to 1.5
    img_Coord.push(vec2(1+zoom+.5,0-zoom+.5));
    img_Coord.push(vec2(1+zoom+.5,1+zoom+.5));
    img_Coord.push(vec2(0-zoom+.5,0-zoom+.5));
    img_Coord.push(vec2(1+zoom+.5,1+zoom+.5));
    img_Coord.push(vec2(0-zoom+.5,1+zoom+.5));
	// push the points
    cube_pts.push(cube_ver[v1]);
    cube_pts.push(cube_ver[v3]);
    cube_pts.push(cube_ver[v4]);
    cube_pts.push(cube_ver[v1]);
    cube_pts.push(cube_ver[v4]);
    cube_pts.push(cube_ver[v2]);
}
function cube(cube_ver, cube_pts, cube_norm, img_Coord, zoom, scroll_switch){// zoom is - for zoom in, + zoom out, 0 else
    quad(cube_ver, cube_pts, cube_norm, img_Coord, 0, 1, 2, 3, vec3(0, 0, 1), zoom, scroll_switch);
    quad(cube_ver, cube_pts, cube_norm, img_Coord, 4, 0, 6, 2, vec3(0, 1, 0), zoom, scroll_switch);
    quad(cube_ver, cube_pts, cube_norm, img_Coord, 4, 5, 0, 1, vec3(1, 0, 0), zoom, scroll_switch);
    quad(cube_ver, cube_pts, cube_norm, img_Coord, 2, 3, 6, 7, vec3(1, 0, 1), zoom, scroll_switch);
    quad(cube_ver, cube_pts, cube_norm, img_Coord, 6, 7, 4, 5, vec3(0, 1, 1), zoom, scroll_switch);
    quad(cube_ver, cube_pts, cube_norm, img_Coord, 1, 5, 3, 7, vec3(1, 1, 0), zoom);
}

function quad( cube_ver, cube_pts, cube_norm, img_Coord, v1, v2, v3, v4, norm, zoom){
    cube_norm.push(norm);
    cube_norm.push(norm);
    cube_norm.push(norm);
    cube_norm.push(norm);
    cube_norm.push(norm);
    cube_norm.push(norm);
	// setting texture coordinates should range from (0,1) in both the s and t dimensions
    img_Coord.push(vec2(0-zoom,0-zoom));
    img_Coord.push(vec2(1+zoom,0-zoom));
    img_Coord.push(vec2(1+zoom,1+zoom));
    img_Coord.push(vec2(0-zoom,0-zoom));
    img_Coord.push(vec2(1+zoom,1+zoom));
    img_Coord.push(vec2(0-zoom,1+zoom));
	// push the points
    cube_pts.push(cube_ver[v1]);
    cube_pts.push(cube_ver[v3]);
    cube_pts.push(cube_ver[v4]);
    cube_pts.push(cube_ver[v1]);
    cube_pts.push(cube_ver[v4]);
    cube_pts.push(cube_ver[v2]);
}
function texture_trans(img_cordinput, newx, time_elabse) {
	for(var i=0; i<img_cordinput.length; i++) {
	// translating all the x and y s and putting values back in the matrix
		var newX = img_cordinput[i][0]+ (newx);
		var newY = img_cordinput[i][1];
		img_cordinput[i] = [newX, newY];
	}
}
function texture_rot(img_cordinput, angle_deg) { // angle_deg is angle of rotation in degrees
	var rad = angle_deg*Math.PI/180; // change angle_deg from degrees to radians
	
	for(var i=0; i<img_cordinput.length; i++) {
		var X = img_cordinput[i][0];
		var Y = img_cordinput[i][1];
		// rotate around center of each face
		X = X-.5; //translate img coordinates by .5 because the texture goes from 0 to 1 and this makes it around the center
		Y = Y-.5;
		// rotation using the radian value of the angle
		var newX = X*Math.cos(rad) + Y*Math.sin(rad);
		var newY = -X*Math.sin(rad) + Y*Math.cos(rad);
		// return the coordinates of image to original state again then apply the changes to the matrix with the old/ translated version of x and y
		newX = newX+.5;
		newY = newY+.5;
		img_cordinput[i] = [newX, newY];
	}
}

