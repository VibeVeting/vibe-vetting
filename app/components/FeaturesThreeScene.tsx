"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FeaturesThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    dna: THREE.Group;
    time: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create DNA Double Helix
    const dna = new THREE.Group();
    const helixPoints1: THREE.Vector3[] = [];
    const helixPoints2: THREE.Vector3[] = [];
    const sphereCount = 60;
    
    for (let i = 0; i < sphereCount; i++) {
      const t = i / sphereCount;
      const y = (t - 0.5) * 30;
      const angle = t * Math.PI * 6;
      const radius = 2;

      // First helix strand
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      helixPoints1.push(new THREE.Vector3(x1, y, z1));

      // Second helix strand (opposite)
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      helixPoints2.push(new THREE.Vector3(x2, y, z2));

      // Sphere for first strand
      const sphereGeometry1 = new THREE.SphereGeometry(0.12, 12, 12);
      const sphereMaterial1 = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.9,
      });
      const sphere1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
      sphere1.position.set(x1, y, z1);
      dna.add(sphere1);

      // Sphere for second strand
      const sphereGeometry2 = new THREE.SphereGeometry(0.12, 12, 12);
      const sphereMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.9,
      });
      const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
      sphere2.position.set(x2, y, z2);
      dna.add(sphere2);

      // Connecting rungs every 3rd position
      if (i % 3 === 0) {
        const rungGeometry = new THREE.CylinderGeometry(0.03, 0.03, radius * 2, 8);
        const rungMaterial = new THREE.MeshBasicMaterial({
          color: 0x22c55e,
          transparent: true,
          opacity: 0.6,
        });
        const rung = new THREE.Mesh(rungGeometry, rungMaterial);
        rung.position.set(0, y, 0);
        rung.rotation.z = angle + Math.PI / 2;
        dna.add(rung);
      }
    }

    // Create helix curves
    const curve1 = new THREE.CatmullRomCurve3(helixPoints1);
    const curve2 = new THREE.CatmullRomCurve3(helixPoints2);
    
    const tubeGeometry1 = new THREE.TubeGeometry(curve1, 100, 0.05, 8, false);
    const tubeMaterial1 = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.4,
    });
    const tube1 = new THREE.Mesh(tubeGeometry1, tubeMaterial1);
    dna.add(tube1);

    const tubeGeometry2 = new THREE.TubeGeometry(curve2, 100, 0.05, 8, false);
    const tubeMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4,
    });
    const tube2 = new THREE.Mesh(tubeGeometry2, tubeMaterial2);
    dna.add(tube2);

    scene.add(dna);

    // Add floating data particles
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 0.96; colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.66; colors[i * 3 + 1] = 0.33; colors[i * 3 + 2] = 0.97;
      } else {
        colors[i * 3] = 0.13; colors[i * 3 + 1] = 0.77; colors[i * 3 + 2] = 0.37;
      }
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 15;
    camera.position.x = 5;

    sceneRef.current = {
      scene,
      camera,
      renderer,
      dna,
      time: 0,
    };

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      
      const { dna, renderer, scene, camera } = sceneRef.current;
      sceneRef.current.time += 0.01;

      // Rotate DNA
      dna.rotation.y += 0.005;
      
      // Subtle camera movement
      camera.position.y = Math.sin(sceneRef.current.time * 0.5) * 2;

      // Animate particles
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

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

  return (
    <div 
      ref={containerRef} 
      className="features-three-scene"
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
