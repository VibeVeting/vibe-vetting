'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  progress: number;
}

export function ThreeScene({ progress }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    rings: THREE.Mesh[];
    core: THREE.Mesh;
    dataNodes: THREE.Mesh[];
    connections: THREE.Line[];
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x667eea, 2, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x764ba2, 2, 20);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Create gradient texture for particles
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 1)');
    gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.5)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    // Particle system - DNA helix style
    const particleCount = 2000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 8;
      const radius = 3 + Math.sin(t * 2) * 0.5;
      
      positions[i * 3] = Math.cos(t) * radius + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = (i / particleCount - 0.5) * 10 + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(t) * radius + (Math.random() - 0.5) * 0.5;

      // Purple gradient colors
      const color = new THREE.Color();
      color.setHSL(0.7 + Math.random() * 0.1, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Glowing rings
    const rings: THREE.Mesh[] = [];
    const ringColors = [0x667eea, 0x764ba2, 0xa855f7];
    
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(2 + i * 0.8, 0.02, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2 + (i * 0.3);
      ring.rotation.y = i * 0.5;
      scene.add(ring);
      rings.push(ring);
    }

    // Central glowing core - icosahedron
    const coreGeometry = new THREE.IcosahedronGeometry(0.8, 2);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x667eea,
      emissive: 0x667eea,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9,
      wireframe: false,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Wireframe overlay for core
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.Mesh(coreGeometry, wireframeMaterial);
    core.add(wireframe);

    // Data nodes floating around
    const dataNodes: THREE.Mesh[] = [];
    const nodeCount = 8;
    
    for (let i = 0; i < nodeCount; i++) {
      const nodeGeometry = new THREE.OctahedronGeometry(0.15, 0);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0x22c55e : 0xf59e0b,
        emissive: i % 2 === 0 ? 0x22c55e : 0xf59e0b,
        emissiveIntensity: 0.3,
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 4;
      node.position.x = Math.cos(angle) * radius;
      node.position.y = Math.sin(angle * 2) * 1.5;
      node.position.z = Math.sin(angle) * radius;
      node.userData = { angle, speed: 0.5 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2 };
      
      scene.add(node);
      dataNodes.push(node);
    }

    // Connection lines between nodes and core
    const connections: THREE.Line[] = [];
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x667eea,
      transparent: true,
      opacity: 0.3,
    });

    dataNodes.forEach((node) => {
      const points = [new THREE.Vector3(0, 0, 0), node.position.clone()];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      connections.push(line);
    });

    sceneRef.current = { scene, camera, renderer, particles, rings, core, dataNodes, connections };

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate particles
      particles.rotation.y = elapsed * 0.1;
      particles.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

      // Animate rings
      rings.forEach((ring, i) => {
        ring.rotation.z = elapsed * (0.3 + i * 0.1) * (i % 2 === 0 ? 1 : -1);
        ring.rotation.x = Math.PI / 2 + Math.sin(elapsed + i) * 0.2;
      });

      // Pulse core
      const scale = 1 + Math.sin(elapsed * 2) * 0.1;
      core.scale.set(scale, scale, scale);
      core.rotation.y = elapsed * 0.5;
      core.rotation.x = elapsed * 0.3;

      // Animate data nodes
      dataNodes.forEach((node, i) => {
        const { speed, offset } = node.userData;
        const angle = elapsed * speed + offset;
        const radius = 4 + Math.sin(elapsed * 2 + i) * 0.5;
        
        node.position.x = Math.cos(angle) * radius;
        node.position.z = Math.sin(angle) * radius;
        node.position.y = Math.sin(elapsed * 2 + i * 0.5) * 1.5;
        node.rotation.x = elapsed * 2;
        node.rotation.y = elapsed * 3;

        // Update connection lines
        const positions = connections[i].geometry.attributes.position.array as Float32Array;
        positions[3] = node.position.x;
        positions[4] = node.position.y;
        positions[5] = node.position.z;
        connections[i].geometry.attributes.position.needsUpdate = true;
      });

      // Camera subtle movement
      camera.position.x = Math.sin(elapsed * 0.3) * 0.5;
      camera.position.y = Math.cos(elapsed * 0.2) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Update based on progress
  useEffect(() => {
    if (!sceneRef.current) return;
    const { core, rings } = sceneRef.current;
    
    // Scale core based on progress
    const baseScale = 0.8 + (progress / 100) * 0.4;
    core.scale.set(baseScale, baseScale, baseScale);
    
    // Change ring opacity based on progress
    rings.forEach((ring, i) => {
      const material = ring.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + (progress / 100) * 0.7 * ((i + 1) / rings.length);
    });
  }, [progress]);

  return (
    <div 
      ref={containerRef} 
      className="three-scene-container"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
      }}
    />
  );
}
