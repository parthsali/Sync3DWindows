import * as THREE from 'three';
import WindowManager from './WindowManager.js';

// Use this to clear the local storage when loaded multiple spheres in the scene
// window.localStorage.clear();

let camera, scene, renderer, world;
let near, far;
let pixR = window.devicePixelRatio || 1;
let spheres = [];
let sceneOffsetTarget = { x: 0, y: 0 };
let sceneOffset = { x: 0, y: 0 };


let today = new Date();
today.setHours(0, 0, 0, 0);
today = today.getTime();


let windowManager;
let initialized = false;

function getTime() {
    return (Date.now() - today) / 1000.0;
}

if (new URLSearchParams(window.location.search).get("clear")) {
    localStorage.clear();
} else {
    document.addEventListener("visibilitychange", initialize);
    window.onload = initialize;

    function initialize() {
        if (document.visibilityState !== 'hidden' && !initialized) {
            init();
        }
    }

    function init() {
        initialized = true;
        setTimeout(() => {
            setupScene();
            setupWindowManager();
            resize();
            updateWindowShape(false);
            render();
            window.addEventListener('resize', resize);
        }, 500);
    }

    function setupScene() {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2.5;
        near = camera.position.z - 0.5;
        far = camera.position.z + 0.5;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0.0);
        scene.add(camera);

        renderer = new THREE.WebGLRenderer({ antialias: true, depthBuffer: true });
        renderer.setPixelRatio(pixR);

        world = new THREE.Object3D();
        scene.add(world);

        renderer.domElement.id = "scene";
        document.body.appendChild(renderer.domElement);
    }

    function setupWindowManager() {
        windowManager = new WindowManager();
        windowManager.setWinShapeChangeCallback(updateWindowShape);
        windowManager.setWinChangeCallback(windowsUpdated);

        let metaData = { foo: "bar" };
        windowManager.init(metaData);

        windowsUpdated();
    }

    function windowsUpdated() {
        updateNumberOfSpheres();
    }

    function updateNumberOfSpheres() {
        let wins = windowManager.getWindows();

        spheres.forEach(sphere => world.remove(sphere));
        spheres = [];

        for (let i = 0; i < wins.length; i++) {
            let win = wins[i];

            let hue = i * 0.25;
            let saturation = 1.0;
            let lightness = 0.5;

            let color = new THREE.Color();
            color.setHSL(hue, saturation, lightness);

            let size = 100 + i * 50;
            let segments = 10;
            let sphere = new THREE.Mesh(
                new THREE.SphereGeometry(size, segments, segments),
                new THREE.MeshBasicMaterial({ color, wireframe: true })
            );

            sphere.position.x = win.shape.x + (win.shape.w * 0.5);
            sphere.position.y = win.shape.y + (win.shape.h * 0.5);

            world.add(sphere);
            spheres.push(sphere);
        }
    }

    function updateWindowShape(easing = true) {
        sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
        if (!easing) sceneOffset = { ...sceneOffsetTarget };
    }

    function render() {
        let t = getTime();
        windowManager.update();



        for (let i = 0; i < spheres.length; i++) {
            let sphere = spheres[i];
            let win = wins[i];
            let _t = t;

            let posTarget = { x: win.shape.x + (win.shape.w * 0.5), y: win.shape.y + (win.shape.h * 0.5) }

            sphere.position.x += (posTarget.x - sphere.position.x) * falloff;
            sphere.position.y += (posTarget.y - sphere.position.y) * falloff;
            sphere.rotation.x = _t * 0.5;
            sphere.rotation.y = _t * 0.5;
            sphere.rotation.z = _t * 0.5;
        };

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    function resize() {
        let width = window.innerWidth;
        let height = window.innerHeight

        camera = new THREE.OrthographicCamera(0, width, 0, height, -10000, 10000);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
}
