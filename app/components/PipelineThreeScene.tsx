"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function PipelineThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    pipeline: THREE.Group;
    dataFlow: THREE.Group;
    time: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create Pipeline structure
    const pipeline = new THREE.Group();

    // Three main processing nodes
    const nodePositions = [
      new THREE.Vector3(-8, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(8, 0, 0),
    ];

    const nodeColors = [0x00f5ff, 0xa855f7, 0x22c55e];

    nodePositions.forEach((pos, i) => {
      // Main node sphere
      const nodeGeometry = new THREE.IcosahedronGeometry(1.5, 1);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: nodeColors[i],
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(pos);
      node.userData = { speed: 0.01 + i * 0.005 };
      pipeline.add(node);

      // Inner glow
      const innerGeometry = new THREE.SphereGeometry(0.8, 32, 32);
      const innerMaterial = new THREE.MeshBasicMaterial({
        color: nodeColors[i],
        transparent: true,
        opacity: 0.6,
      });
      const inner = new THREE.Mesh(innerGeometry, innerMaterial);
      inner.position.copy(pos);
      pipeline.add(inner);

      // Orbiting ring
      const ringGeometry = new THREE.TorusGeometry(2, 0.03, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: nodeColors[i],
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(pos);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { rotationSpeed: 0.02 + i * 0.01 };
      pipeline.add(ring);
    });

    // Connection tubes between nodes
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const start = nodePositions[i];
      const end = nodePositions[i + 1];
      
      const curve = new THREE.CatmullRomCurve3([
        start,
        new THREE.Vector3((start.x + end.x) / 2, 2, 0),
        end,
      ]);
      
      const tubeGeometry = new THREE.TubeGeometry(curve, 30, 0.08, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.3,
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      pipeline.add(tube);
    }

    scene.add(pipeline);

    // Create Data Flow particles
    const dataFlow = new THREE.Group();
    const flowParticles: THREE.Mesh[] = [];
    
    for (let i = 0; i < 30; i++) {
      const particleGeometry = new THREE.OctahedronGeometry(0.15, 0);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0x00f5ff : i % 3 === 1 ? 0xa855f7 : 0x22c55e,
        transparent: true,
        opacity: 0.9,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.userData = {
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        yOffset: (Math.random() - 0.5) * 2,
        zOffset: (Math.random() - 0.5) * 2,
      };
      flowParticles.push(particle);
      dataFlow.add(particle);
    }
    scene.add(dataFlow);

    // Background particles
    const bgParticleCount = 300;
    const bgGeometry = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(bgParticleCount * 3);
    const bgColors = new Float32Array(bgParticleCount * 3);

    for (let i = 0; i < bgParticleCount; i++) {
      bgPositions[i * 3] = (Math.random() - 0.5) * 50;
      bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;

      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        bgColors[i * 3] = 0; bgColors[i * 3 + 1] = 0.96; bgColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.66) {
        bgColors[i * 3] = 0.66; bgColors[i * 3 + 1] = 0.33; bgColors[i * 3 + 2] = 0.97;
      } else {
        bgColors[i * 3] = 0.13; bgColors[i * 3 + 1] = 0.77; bgColors[i * 3 + 2] = 0.37;
      }
    }

    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

    const bgMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const bgParticles = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(bgParticles);

    camera.position.z = 18;
    camera.position.y = 3;

    sceneRef.current = {
      scene,
      camera,
      renderer,
      pipeline,
      dataFlow,
      time: 0,
    };

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      
      const { pipeline, dataFlow, renderer, scene, camera } = sceneRef.current;
      sceneRef.current.time += 0.01;
      const time = sceneRef.current.time;

      // Animate pipeline nodes
      pipeline.children.forEach((child, i) => {
        if (child.userData.speed) {
          child.rotation.y += child.userData.speed;
          child.rotation.x += child.userData.speed * 0.5;
        }
        if (child.userData.rotationSpeed) {
          child.rotation.z += child.userData.rotationSpeed;
        }
      });

      // Animate data flow particles
      dataFlow.children.forEach((particle) => {
        const userData = particle.userData;
        userData.progress += userData.speed;
        if (userData.progress > 1) userData.progress = 0;

        // Move along the pipeline path
        const x = -12 + userData.progress * 24;
        const y = Math.sin(userData.progress * Math.PI) * 2 + userData.yOffset;
        const z = userData.zOffset;

        particle.position.set(x, y, z);
        particle.rotation.x += 0.05;
        particle.rotation.y += 0.05;
      });

      // Animate background particles
      bgParticles.rotation.y += 0.0005;

      // Camera subtle movement
      camera.position.x = Math.sin(time * 0.3) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const { camera, renderer } = sceneRef.current;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="pipeline-three-scene"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
