import * as THREE from "./Opensource/three.module.js";
import { OrbitControls } from "./Opensource/OrbitControls.js";
import { GLTFLoader } from "./Opensource/GLTFLoader.js";
import { DRACOLoader } from './Opensource/DRACOLoader.js';
import './Opensource/jquery.js'
//https://cdn.jsdelivr.net/npm/three@0.114/build/three.module.js
//https://cdn.jsdelivr.net/npm/three@0.114/examples/jsm/controls/OrbitControls.js
let camera, scene, renderer;
let mouse, raycaster, controls;
let cube, pause_lerp, lerping, origin, camPos, newPosition, oldPosition;
let objects = [];
let INTERSECTED, targetPosition, pointerPosition;
	
function init() {
	// Init scene
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		100,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	// Init renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Init BoxGeometry object (rectangular cuboid)
	const geometry = new THREE.BoxGeometry(2, 2, 2);
	const texture = new THREE.TextureLoader().load('./Photo/crate.gif');
	const material = new THREE.MeshBasicMaterial({ map: texture });
	cube = new THREE.Mesh(geometry, material);
	//cube.position.set(-2, 1, 2);

	//scene.add(cube);

	var light = new THREE.HemisphereLight( 'white', 0x080820, 1 );
    scene.add(light)
	//Sky
	const skyBoxGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );
	const texture1 = new THREE.TextureLoader().load('./Photo/wall.jpg');
	const skyBoxMaterial = new THREE.MeshBasicMaterial({map : texture1, side: THREE.DoubleSide});
	const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	camera.position.set(10, 10, 5);
	
	
	controls = new OrbitControls(camera, renderer.domElement);
	pause_lerp = false;
	lerping = false;
	origin = null;
	camPos = new THREE.Vector3(0, 0, 0);

	const loader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	loader.setDRACOLoader(dracoLoader);
	loader.load('file.glb', function ( gltf ) {

		gltf.scene.traverse( function ( child ) {

			if ( child.isMesh ) {
                objects.push(child);
                if (child.name == "Plane") {
                    child.material.color.setHex('0x63a6a4');
                }
			}
		} );
		scene.add(gltf.scene);
        renderer.render(scene, camera);

	},
	function ( xhr ) {
		const s = ( xhr.loaded / xhr.total * 100 ) + '% loaded';
		var element = document.getElementById("p1");
		element.innerHTML = s;
	},
	function ( error ) {
		console.log( 'An error happened' );
	});
    INTERSECTED = null;
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2(Infinity, Infinity);
    newPosition = null;
    oldPosition = camera.position;
    pointerPosition = null;
	//renderer.domElement.addEventListener('click', onClick, false);
	renderer.domElement.addEventListener('mousemove', onMouseMove);
	renderer.domElement.addEventListener('mouseup', onMouseUp);
	renderer.domElement.addEventListener('mousedown', onMouseDown);
	renderer.domElement.addEventListener('wheel', onWheel);	
	
}

// Draw the scene every time the screen is refreshed
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	if (newPosition) {
        console.log(oldPosition)
        console.log(newPosition)
        camera.lookAt(new THREE.Vector3 (
                newPosition.x + (newPosition.x > oldPosition.x ? 1 : -1), 
                newPosition.y + 3, 
                newPosition.z + (newPosition.x > oldPosition.x ? 1 : -1)), 
                0.05)
        if (!pause_lerp) {
            
            camPos.lerp(new THREE.Vector3 (
                newPosition.x, 
                newPosition.y + 3, 
                newPosition.z), 
                0.05);
            camera.position.copy(camPos);
        }
        camera.updateMatrixWorld();
    }
	raycast();
	renderer.render(scene, camera);
};

function showAlert(message) {
	$('#alert_placeholder').html(`
	<div class="alert alert-success alert-dismissible rounded-0 fade show" role="alert">
		`+ message + `
		<button type="button" class="close" data-dismiss="alert" aria-label="Close">
		<span aria-hidden="true">&times;</span>
		</button>
	</div>
  `)
}
function raycast() {
	raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        intersects.every(function (element, index) {
            if (element.object.name == "Plane") {
                pointerPosition = element.point;
                return false;
            }
        })
    }
}
function onWindowResize() {
	// Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	// After making changes to aspect
	camera.updateProjectionMatrix();
	// Reset size
	renderer.setSize(window.innerWidth, window.innerHeight);
}
function onMouseMove(event) {

	event.preventDefault();

	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

function onMouseUp(event) {
    oldPosition = camera.position;
    newPosition = pointerPosition;
	pause_lerp = false;

}
function onWheel() {
	pause_lerp = true;
}

function onMouseDown(event) {
    pause_lerp = true;

}

window.addEventListener('resize', onWindowResize, false);
init();
animate();



