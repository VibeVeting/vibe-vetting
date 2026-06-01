'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PricingThreeSceneProps {
  mousePosition: { x: number; y: number };
}

export default function PricingThreeScene({ mousePosition }: PricingThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    crystals: THREE.Group;
    rings: THREE.Group;
    particles: THREE.Points;
    time: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 0, 30);

    // ===== FLOATING CRYSTALS (representing pricing tiers) =====
    const crystals = new THREE.Group();

    // Create 3 main crystals for each pricing tier
    const crystalColors = [0x667eea, 0xa855f7, 0x00f5ff];
    const crystalPositions = [
      { x: -12, y: 3, z: -5 },
      { x: 0, y: -4, z: -10 },
      { x: 12, y: 2, z: -8 },
    ];

    crystalPositions.forEach((pos, i) => {
      const crystalGroup = new THREE.Group();
      crystalGroup.position.set(pos.x, pos.y, pos.z);

      // Main crystal
      const crystalGeo = new THREE.OctahedronGeometry(1.5 + i * 0.3, 0);
      const crystalMat = new THREE.MeshBasicMaterial({
        color: crystalColors[i],
        transparent: true,
        opacity: 0.7,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystalGroup.add(crystal);

      // Crystal wireframe
      const wireGeo = new THREE.OctahedronGeometry(1.8 + i * 0.3, 0);
      const wireMat = new THREE.MeshBasicMaterial({
        color: crystalColors[i],
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      const wireframe = new THREE.Mesh(wireGeo, wireMat);
      crystalGroup.add(wireframe);

      // Glow ring
      const ringGeo = new THREE.RingGeometry(2.5, 3, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: crystalColors[i],
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      crystalGroup.add(ring);

      crystalGroup.userData = { rotSpeed: 0.005 + i * 0.002, floatOffset: i * 2 };
      crystals.add(crystalGroup);
    });

    scene.add(crystals);

    // ===== ORBITAL RINGS =====
    const rings = new THREE.Group();

    for (let i = 0; i < 5; i++) {
      const ringGeo = new THREE.TorusGeometry(8 + i * 4, 0.05, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x667eea : 0xa855f7,
        transparent: true,
        opacity: 0.15 - i * 0.02,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + i * 0.1;
      ring.rotation.y = i * 0.2;
      ring.userData = { rotSpeed: 0.001 * (i % 2 === 0 ? 1 : -1) };
      rings.add(ring);
    }

    scene.add(rings);

    // ===== PARTICLES =====
    const particleCount = 800;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;

      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.4;
        colors[i * 3 + 1] = 0.49;
        colors[i * 3 + 2] = 0.92;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.66;
        colors[i * 3 + 1] = 0.33;
        colors[i * 3 + 2] = 0.97;
      } else {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0.96;
        colors[i * 3 + 2] = 1;
      }

      sizes[i] = Math.random() * 3 + 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Store refs
    sceneRef.current = {
      scene,
      camera,
      renderer,
      crystals,
      rings,
      particles,
      time: 0,
    };

    // Animation
    const animate = () => {
      if (!sceneRef.current) return;
      
      const { camera, renderer, scene, crystals, rings, particles, time } = sceneRef.current;
      sceneRef.current.time += 0.016;
      const t = sceneRef.current.time;

      // Animate crystals
      crystals.children.forEach((crystal, i) => {
        crystal.rotation.y += crystal.userData.rotSpeed;
        crystal.position.y += Math.sin(t + crystal.userData.floatOffset) * 0.005;
      });

      // Animate rings
      rings.children.forEach((ring) => {
        ring.rotation.z += ring.userData.rotSpeed;
      });

      // Animate particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(t + i) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Mouse interaction
      camera.position.x += (mousePosition.x * 3 - camera.position.x) * 0.05;
      camera.position.y += (mousePosition.y * 2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
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

  // Update mouse position
  useEffect(() => {
    // Mouse position is used in animate loop
  }, [mousePosition]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 0,
      }} 
    />
  );
}
