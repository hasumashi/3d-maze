'use strict';

import './index.css';
let audioUrl = require('./fireloop.mp3');
console.log(audioUrl)
import * as THREE from 'three';
window.three = THREE;

// import 'three-orbit-controls';
// console.log(OrbitControls)
// const orbitControls = OrbitControls(THREE)

// "config"
const RESOLUTION = { w: 80, h: 50 };

// globals
let camera, scene, renderer;
let geometry, material, gemMesh;
let fireAudio;

let playerPos;
let MAZE_SIZE;

// main
document.addEventListener("DOMContentLoaded", function (event) {
	init();
	animate();
});

function init() {
	// prepare three.js
	camera = new THREE.PerspectiveCamera(70, RESOLUTION.w / RESOLUTION.h, 0.01, 10);
	// camera.position.z = 3;
	// camera.position.y = 0.5;
	// camera.lookAt(new THREE.Vector3(0, 0, 0));

	scene = new THREE.Scene();

	/* ---example/finish gem?--- */
	const finishPos = [6, 1];
	geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
	material = new THREE.MeshNormalMaterial();
	gemMesh = new THREE.Mesh(geometry, material);
	gemMesh.position.copy(new THREE.Vector3(finishPos[0], 0, finishPos[1]))
	scene.add(gemMesh);
	/* ---example--- */

	renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
	// renderer.setClearColor( 0x000000, 0 );
	renderer.setSize(RESOLUTION.w, RESOLUTION.h);

	renderer.domElement.id = 'renderer';
	renderer.domElement.className = 'centered';
	document.body.appendChild(renderer.domElement);


	// generate maze geometry
	const maze = [
		[2, 2, 0, 2, 2, 2, 2, 2],
		[1, 0, 0, 1, 0, 1, 0, 1],
		[1, 0, 0, 1, 0, 0, 0, 1],
		[1, 0, 0, 1, 0, 1, 0, 1],
		[1, 0, 0, 0, 0, 1, 0, 1],
		[1, 0, 0, 1, 0, 1, 0, 1],
		[2, 2, 2, 2, 2, 2, 2, 2],
	];
	MAZE_SIZE = [maze.length, maze[0].length];
	const playerStart = [4, 2]; // [x, y]
	playerPos = playerStart;
	camera.position.copy(new THREE.Vector3(playerPos[0], 0, playerPos[1]));
	addWalls(maze);

	// input controls
	document.addEventListener('keydown', event => {
		const movement = {
			'w': [0, 0, -1],
			's': [0, 0, +1],
			'a': [-1, 0, 0],
			'd': [+1, 0, 0],
		};
		const moveVector = new THREE.Vector3(...movement[event.key]);
		if (moveVector === undefined) // pressed other key
			return false;

		const nextPlayerPos = Array.from(playerPos);
		nextPlayerPos[0] += moveVector.x;
		nextPlayerPos[1] += moveVector.z;
		const nextField = maze[nextPlayerPos[1]][nextPlayerPos[0]];
		// console.log('NEXT:', playerPos, moveVector, nextPlayerPos, nextField)

		if (nextField !== 0) // would hit wall
			return false;

		fireAudio.setVolume(1 - (playerPos[1] / MAZE_SIZE[0]));

		if (nextPlayerPos[0] === finishPos[0] && nextPlayerPos[1] === finishPos[1]) {
			console.log('COLLECTED GEM!');
			scene.remove(gemMesh);
		}

		playerPos = Array.from(nextPlayerPos);
		camera.position.add(moveVector);
	});

	// audio effects
	var listener = new THREE.AudioListener();
	camera.add(listener);

	// create a global audio source
	fireAudio = new THREE.Audio(listener);

	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load(audioUrl, function (buffer) {
		fireAudio.setBuffer(buffer);
		fireAudio.setLoop(true);
		// fireAudio.setVolume(0.5);
		fireAudio.setVolume(1 - (playerPos[1] / MAZE_SIZE[0]));
		fireAudio.play();
	});
}

let wallsContainer;
function addWalls(mazeArray) {
	wallsContainer = new THREE.Object3D();

	// floors
	// const floorGeom = new THREE.PlaneGeometry(...MAZE_SIZE);
	// const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });
	// const ceil = new THREE.Mesh(floorGeom, floorMaterial);
	// ceil.rotation.z = THREE.Math.degToRad(-90);
	// const floor = ceil.clone();
	// ceil.position.y =  1;
	// floor.position.y = -1;
	// scene.add(ceil).add(floor);

	// maze walls
	for (let i = 0; i < mazeArray.length; i++) {
		for (let j = 0; j < mazeArray[i].length; j++) {
			const field = mazeArray[i][j];
			if (field === 0) continue;

			const wallGeometry = new THREE.PlaneGeometry();
			const wallMaterial = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
			const wall = new THREE.Mesh(wallGeometry, wallMaterial);

			if (field === 1) wall.rotateY(Math.PI / 2);
			wall.position.z = i + 0.01;
			wall.position.x = j + 0.01;
			wallsContainer.add(wall);
		}
	}

	scene.add(wallsContainer);
}

function animate() {

	requestAnimationFrame(animate);

	gemMesh.rotation.x += 0.01;
	gemMesh.rotation.y += 0.02;

	renderer.render(scene, camera);

}
