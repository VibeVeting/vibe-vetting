"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HomeThreeSceneProps {
  mousePosition: { x: number; y: number };
}

export default function HomeThreeScene({ mousePosition }: HomeThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    brand: THREE.Group;
    creators: THREE.Group;
    vibeVettingCore: THREE.Group;
    scannerBeams: THREE.Group;
    dataStreams: THREE.Group;
    historyTimeline: THREE.Group;
    futureVision: THREE.Group;
    connectionLines: THREE.Group;
    particles: THREE.Points;
    matchedCreator: THREE.Group;
    time: number;
    phase: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // ===== PHASE 1: BRAND ENTITY (Looking for creators) =====
    const brand = new THREE.Group();
    brand.position.set(-12, 0, 0);

    // Brand core - pulsing diamond
    const brandCoreGeo = new THREE.OctahedronGeometry(1.2, 0);
    const brandCoreMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.95,
    });
    const brandCore = new THREE.Mesh(brandCoreGeo, brandCoreMat);
    brand.add(brandCore);

    // Brand energy field
    const brandFieldGeo = new THREE.IcosahedronGeometry(2, 1);
    const brandFieldMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const brandField = new THREE.Mesh(brandFieldGeo, brandFieldMat);
    brand.add(brandField);

    // Brand search radar rings
    for (let i = 0; i < 3; i++) {
      const radarGeo = new THREE.RingGeometry(2.5 + i * 1.2, 2.7 + i * 1.2, 64);
      const radarMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.3 - i * 0.08,
        side: THREE.DoubleSide,
      });
      const radar = new THREE.Mesh(radarGeo, radarMat);
      radar.rotation.x = Math.PI / 2;
      radar.userData = { offset: i * 0.5, speed: 2 + i * 0.5 };
      brand.add(radar);
    }

    // Brand seeking tendrils (looking for creators)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tendrilPoints = [];
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const x = Math.cos(angle) * (2 + t * 6);
        const y = Math.sin(t * Math.PI * 2) * 0.5;
        const z = Math.sin(angle) * (2 + t * 6);
        tendrilPoints.push(new THREE.Vector3(x, y, z));
      }
      const tendrilCurve = new THREE.CatmullRomCurve3(tendrilPoints);
      const tendrilGeo = new THREE.TubeGeometry(tendrilCurve, 20, 0.03, 8, false);
      const tendrilMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.4,
      });
      const tendril = new THREE.Mesh(tendrilGeo, tendrilMat);
      tendril.userData = { baseAngle: angle, phase: i * 0.3 };
      brand.add(tendril);
    }

    scene.add(brand);

    // ===== PHASE 2: CREATOR POOL (Multiple potential creators) =====
    const creators = new THREE.Group();
    creators.position.set(2, 2, -5);

    const creatorPositions = [
      { x: -4, y: 2, z: 0, color: 0x00f5ff, matched: false },
      { x: -2, y: -1, z: 2, color: 0x22c55e, matched: false },
      { x: 0, y: 1, z: -1, color: 0xf59e0b, matched: true }, // The perfect match
      { x: 2, y: -2, z: 1, color: 0xec4899, matched: false },
      { x: 4, y: 0, z: -2, color: 0x3b82f6, matched: false },
      { x: -3, y: -2, z: -1, color: 0x8b5cf6, matched: false },
      { x: 3, y: 2, z: 2, color: 0x14b8a6, matched: false },
    ];

    creatorPositions.forEach((pos, i) => {
      const creatorGroup = new THREE.Group();
      creatorGroup.position.set(pos.x, pos.y, pos.z);

      // Creator body
      const bodyGeo = new THREE.IcosahedronGeometry(0.5, 0);
      const bodyMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.9,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      creatorGroup.add(body);

      // Creator aura
      const auraGeo = new THREE.SphereGeometry(0.8, 16, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.15,
        wireframe: true,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      creatorGroup.add(aura);

      creatorGroup.userData = { ...pos, index: i, baseY: pos.y };
      creators.add(creatorGroup);
    });

    scene.add(creators);

    // ===== PHASE 3: VIBEVETTING CORE (The AI Analysis Hub) =====
    const vibeVettingCore = new THREE.Group();
    vibeVettingCore.position.set(0, -1, 0);
    vibeVettingCore.visible = true;

    // Main AI core - glowing sphere
    const coreGeo = new THREE.IcosahedronGeometry(2, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    vibeVettingCore.add(core);

    // Inner core pulse
    const innerCoreGeo = new THREE.SphereGeometry(1, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.6,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    vibeVettingCore.add(innerCore);

    // Processing rings around core
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(2.5 + i * 0.8, 0.05, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00f5ff : 0xa855f7,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + (i * Math.PI / 8);
      ring.rotation.y = i * Math.PI / 6;
      ring.userData = { rotationSpeed: 0.01 + i * 0.005, axis: i % 3 };
      vibeVettingCore.add(ring);
    }

    // Data processing nodes
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const nodeGeo = new THREE.OctahedronGeometry(0.2, 0);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0x22c55e : (i % 3 === 1 ? 0x00f5ff : 0xa855f7),
        transparent: true,
        opacity: 0.8,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5);
      node.userData = { angle, radius: 3.5, speed: 0.02 };
      vibeVettingCore.add(node);
    }

    scene.add(vibeVettingCore);

    // ===== SCANNER BEAMS (AI analyzing creators) =====
    const scannerBeams = new THREE.Group();
    
    for (let i = 0; i < 5; i++) {
      const beamGeo = new THREE.CylinderGeometry(0.02, 0.15, 15, 12);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.userData = { targetIndex: i, active: false };
      scannerBeams.add(beam);
    }
    scene.add(scannerBeams);

    // ===== DATA STREAMS (Flowing data visualization) =====
    const dataStreams = new THREE.Group();
    
    for (let i = 0; i < 50; i++) {
      const particleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.3);
      const particleMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x00f5ff : 0xa855f7,
        transparent: true,
        opacity: 0.8,
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      particle.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 15 - 5
      );
      particle.userData = { 
        speed: 0.05 + Math.random() * 0.1,
        targetX: 0,
        targetY: -1,
        targetZ: 0,
        phase: Math.random() * Math.PI * 2,
      };
      dataStreams.add(particle);
    }
    scene.add(dataStreams);

    // ===== HISTORY TIMELINE (Past content analysis) =====
    const historyTimeline = new THREE.Group();
    historyTimeline.position.set(8, 0, -2);
    historyTimeline.visible = false;

    // Timeline spine
    const spinePoints = [];
    for (let i = 0; i <= 30; i++) {
      spinePoints.push(new THREE.Vector3(0, -6 + i * 0.4, 0));
    }
    const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
    const spineGeo = new THREE.TubeGeometry(spineCurve, 30, 0.05, 8, false);
    const spineMat = new THREE.MeshBasicMaterial({
      color: 0x4a5568,
      transparent: true,
      opacity: 0.5,
    });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    historyTimeline.add(spine);

    // Timeline nodes (past posts/content)
    const timelineColors = [0x22c55e, 0xf59e0b, 0x00f5ff, 0xa855f7, 0xec4899];
    for (let i = 0; i < 15; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.15, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: timelineColors[i % 5],
        transparent: true,
        opacity: 0.8,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(
        (Math.random() - 0.5) * 2,
        -6 + i * 0.8,
        (Math.random() - 0.5) * 1
      );
      node.userData = { revealed: false, index: i };
      historyTimeline.add(node);

      // Connection to spine
      const linePoints = [node.position.clone(), new THREE.Vector3(0, node.position.y, 0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: timelineColors[i % 5],
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      historyTimeline.add(line);
    }

    scene.add(historyTimeline);

    // ===== FUTURE VISION (Prediction visualization) =====
    const futureVision = new THREE.Group();
    futureVision.position.set(10, 1, -3);
    futureVision.visible = false;

    // Success metrics rising bars
    const metricColors = [0x22c55e, 0x00f5ff, 0xf59e0b, 0xa855f7];
    const metricLabels = ['GROWTH', 'ENGAGEMENT', 'ALIGNMENT', 'ROI'];
    
    for (let i = 0; i < 4; i++) {
      const barGroup = new THREE.Group();
      barGroup.position.set(-3 + i * 2, -3, 0);

      // Bar base
      const baseGeo = new THREE.BoxGeometry(0.8, 0.1, 0.8);
      const baseMat = new THREE.MeshBasicMaterial({
        color: metricColors[i],
        transparent: true,
        opacity: 0.5,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      barGroup.add(base);

      // Rising bar
      const barGeo = new THREE.BoxGeometry(0.6, 0, 0.6);
      const barMat = new THREE.MeshBasicMaterial({
        color: metricColors[i],
        transparent: true,
        opacity: 0.8,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.y = 0.05;
      bar.userData = { targetHeight: 2 + Math.random() * 3, currentHeight: 0 };
      barGroup.add(bar);

      // Glow effect
      const glowGeo = new THREE.BoxGeometry(0.8, 0.1, 0.8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: metricColors[i],
        transparent: true,
        opacity: 0.2,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.y = 0.1;
      barGroup.add(glow);

      barGroup.userData = { index: i };
      futureVision.add(barGroup);
    }

    // Upward trending arrow
    const arrowGroup = new THREE.Group();
    arrowGroup.position.set(0, 4, 0);
    
    const arrowBodyGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 12);
    const arrowBodyMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.8,
    });
    const arrowBody = new THREE.Mesh(arrowBodyGeo, arrowBodyMat);
    arrowBody.rotation.z = -Math.PI / 4;
    arrowGroup.add(arrowBody);

    const arrowHeadGeo = new THREE.ConeGeometry(0.3, 0.6, 12);
    const arrowHeadMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.9,
    });
    const arrowHead = new THREE.Mesh(arrowHeadGeo, arrowHeadMat);
    arrowHead.position.set(1.1, 1.1, 0);
    arrowHead.rotation.z = -Math.PI / 4;
    arrowGroup.add(arrowHead);

    futureVision.add(arrowGroup);
    scene.add(futureVision);

    // ===== MATCHED CREATOR (The perfect match highlight) =====
    const matchedCreator = new THREE.Group();
    matchedCreator.position.set(12, 0, 0);
    matchedCreator.visible = false;

    // Matched creator core
    const matchCoreGeo = new THREE.IcosahedronGeometry(1, 1);
    const matchCoreMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.9,
    });
    const matchCore = new THREE.Mesh(matchCoreGeo, matchCoreMat);
    matchedCreator.add(matchCore);

    // Success rings
    for (let i = 0; i < 4; i++) {
      const successRingGeo = new THREE.TorusGeometry(1.5 + i * 0.5, 0.05, 16, 64);
      const successRingMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x22c55e : 0x00f5ff,
        transparent: true,
        opacity: 0.4 - i * 0.08,
      });
      const successRing = new THREE.Mesh(successRingGeo, successRingMat);
      successRing.rotation.x = Math.PI / 2;
      successRing.userData = { scale: 1, pulseOffset: i * 0.5 };
      matchedCreator.add(successRing);
    }

    // Connection sparkles
    for (let i = 0; i < 20; i++) {
      const sparkleGeo = new THREE.TetrahedronGeometry(0.08, 0);
      const sparkleMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x22c55e : 0x00f5ff,
        transparent: true,
        opacity: 0.9,
      });
      const sparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
      const angle = (i / 20) * Math.PI * 2;
      const radius = 2 + Math.random() * 1.5;
      sparkle.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3,
        Math.sin(angle) * radius
      );
      sparkle.userData = { angle, radius, ySpeed: 0.02 + Math.random() * 0.02 };
      matchedCreator.add(sparkle);
    }

    scene.add(matchedCreator);

    // ===== CONNECTION LINES (Brand to Creator connection) =====
    const connectionLines = new THREE.Group();
    scene.add(connectionLines);

    // ===== BACKGROUND PARTICLES =====
    const particleCount = 2500;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;

      const colorChoice = Math.random();
      if (colorChoice < 0.35) {
        colors[i * 3] = 0.66; colors[i * 3 + 1] = 0.33; colors[i * 3 + 2] = 0.97;
      } else if (colorChoice < 0.65) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 0.96; colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.85) {
        colors[i * 3] = 0.13; colors[i * 3 + 1] = 0.77; colors[i * 3 + 2] = 0.37;
      } else {
        colors[i * 3] = 0.96; colors[i * 3 + 1] = 0.62; colors[i * 3 + 2] = 0.04;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    camera.position.set(0, 2, 18);
    camera.lookAt(0, 0, 0);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      brand,
      creators,
      vibeVettingCore,
      scannerBeams,
      dataStreams,
      historyTimeline,
      futureVision,
      connectionLines,
      particles,
      matchedCreator,
      time: 0,
      phase: 0,
    };

    // ===== STORYTELLING ANIMATION LOOP =====
    // Phase 0: Brand searching (0-4s)
    // Phase 1: Finding creators pool (4-8s)
    // Phase 2: VibVetting analyzing (8-14s)
    // Phase 3: History scan (14-18s)
    // Phase 4: Future prediction (18-22s)
    // Phase 5: Perfect match (22-26s)
    // Loop back to Phase 0

    const totalCycleDuration = 26;

    const animate = () => {
      if (!sceneRef.current) return;
      
      const { 
        brand, creators, vibeVettingCore, scannerBeams, dataStreams,
        historyTimeline, futureVision, matchedCreator, connectionLines,
        particles, renderer, scene, camera 
      } = sceneRef.current;
      
      sceneRef.current.time += 0.016;
      const time = sceneRef.current.time;
      const cycleTime = time % totalCycleDuration;

      // Determine current phase
      let phase = 0;
      if (cycleTime < 4) phase = 0;
      else if (cycleTime < 8) phase = 1;
      else if (cycleTime < 14) phase = 2;
      else if (cycleTime < 18) phase = 3;
      else if (cycleTime < 22) phase = 4;
      else phase = 5;

      sceneRef.current.phase = phase;

      // ===== PHASE 0: Brand Searching =====
      // Brand pulsing and searching
      brand.children[0].rotation.y += 0.02;
      brand.children[0].rotation.x += 0.01;
      brand.children[1].rotation.y -= 0.01;
      brand.children[1].rotation.x -= 0.005;

      // Radar rings pulse
      for (let i = 2; i < 5; i++) {
        const ring = brand.children[i];
        const ud = ring.userData;
        const pulse = 1 + Math.sin(time * ud.speed + ud.offset) * 0.3;
        ring.scale.setScalar(pulse);
      }

      // Tendrils wave
      for (let i = 5; i < brand.children.length; i++) {
        const tendril = brand.children[i] as THREE.Mesh;
        if (tendril.material && !Array.isArray(tendril.material)) {
          const mat = tendril.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.3 + Math.sin(time * 2 + tendril.userData.phase) * 0.2;
        }
      }

      // Brand movement based on phase
      if (phase === 0) {
        // Searching motion - slight movement
        brand.position.x = -12 + Math.sin(time * 0.5) * 1.5;
        brand.position.y = Math.sin(time * 0.7) * 0.8;
      } else if (phase >= 1 && phase <= 2) {
        // Move toward center/creators
        const targetX = phase === 1 ? -6 : -4;
        brand.position.x += (targetX - brand.position.x) * 0.02;
        brand.position.y += (0 - brand.position.y) * 0.02;
      } else if (phase >= 3) {
        // Stay at analysis position
        brand.position.x += (-4 - brand.position.x) * 0.02;
      }

      // ===== PHASE 1 & 2: Creators Pool =====
      creators.children.forEach((creator, i) => {
        const ud = creator.userData;
        
        // Floating animation
        creator.position.y = ud.baseY + Math.sin(time * 1.5 + i * 0.5) * 0.3;
        
        // Rotate creator bodies
        creator.children[0].rotation.y += 0.015;
        creator.children[0].rotation.x += 0.01;
        creator.children[1].rotation.y -= 0.01;

        // Visibility and highlighting based on phase
        if (phase >= 1) {
          const creatorMesh = creator.children[0] as THREE.Mesh;
          const auraMesh = creator.children[1] as THREE.Mesh;
          
          if (creatorMesh.material && !Array.isArray(creatorMesh.material)) {
            const mat = creatorMesh.material as THREE.MeshBasicMaterial;
            
            // Highlight the matched creator during analysis
            if (phase >= 2 && ud.matched) {
              mat.opacity = 0.9 + Math.sin(time * 5) * 0.1;
              creator.scale.setScalar(1.2 + Math.sin(time * 3) * 0.1);
            } else if (phase >= 3 && !ud.matched) {
              // Fade out non-matched creators
              mat.opacity = Math.max(0.2, mat.opacity - 0.01);
              creator.scale.setScalar(Math.max(0.5, creator.scale.x - 0.005));
            }
          }
        }
      });

      // ===== PHASE 2: VibVetting Core Analysis =====
      // Core rotation and pulse
      vibeVettingCore.children[0].rotation.y += 0.01;
      vibeVettingCore.children[0].rotation.x += 0.005;
      
      const coreScale = 1 + Math.sin(time * 2) * 0.1;
      vibeVettingCore.children[1].scale.setScalar(coreScale);

      // Processing rings rotation
      for (let i = 2; i < 6; i++) {
        const ring = vibeVettingCore.children[i];
        const ud = ring.userData;
        if (ud.axis === 0) ring.rotation.x += ud.rotationSpeed;
        else if (ud.axis === 1) ring.rotation.y += ud.rotationSpeed;
        else ring.rotation.z += ud.rotationSpeed;
      }

      // Data nodes orbit
      for (let i = 6; i < vibeVettingCore.children.length; i++) {
        const node = vibeVettingCore.children[i];
        const ud = node.userData;
        ud.angle += ud.speed;
        node.position.x = Math.cos(ud.angle) * ud.radius;
        node.position.z = Math.sin(ud.angle) * ud.radius;
        node.position.y = Math.sin(time * 3 + i) * 0.5;
        node.rotation.y += 0.05;
      }

      // Core visibility based on phase
      if (phase >= 2) {
        vibeVettingCore.visible = true;
        const targetOpacity = phase === 2 ? 0.4 : (phase >= 3 ? 0.6 : 0.3);
        const coreMesh = vibeVettingCore.children[0] as THREE.Mesh;
        if (coreMesh.material && !Array.isArray(coreMesh.material)) {
          const mat = coreMesh.material as THREE.MeshBasicMaterial;
          mat.opacity += (targetOpacity - mat.opacity) * 0.05;
        }
      }

      // ===== SCANNER BEAMS (During analysis phase) =====
      if (phase === 2) {
        scannerBeams.children.forEach((beam, i) => {
          const beamMesh = beam as THREE.Mesh;
          if (beamMesh.material && !Array.isArray(beamMesh.material)) {
            const mat = beamMesh.material as THREE.MeshBasicMaterial;
            
            // Animate beam to scan each creator
            const targetCreator = creators.children[i % creators.children.length];
            if (targetCreator) {
              const targetPos = new THREE.Vector3();
              targetCreator.getWorldPosition(targetPos);
              
              const corePos = new THREE.Vector3();
              vibeVettingCore.getWorldPosition(corePos);
              
              // Position beam
              const midPoint = new THREE.Vector3().addVectors(corePos, targetPos).multiplyScalar(0.5);
              beam.position.copy(midPoint);
              beam.lookAt(targetPos);
              beam.rotateX(Math.PI / 2);
              
              const distance = corePos.distanceTo(targetPos);
              beam.scale.set(1, distance / 15, 1);
              
              // Pulse opacity
              mat.opacity = 0.3 + Math.sin(time * 4 + i * 0.8) * 0.3;
              mat.color.setHex(i % 2 === 0 ? 0x00f5ff : 0xa855f7);
            }
          }
        });
      } else {
        scannerBeams.children.forEach((beam) => {
          const beamMesh = beam as THREE.Mesh;
          if (beamMesh.material && !Array.isArray(beamMesh.material)) {
            (beamMesh.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        });
      }

      // ===== DATA STREAMS (Flowing toward core) =====
      dataStreams.children.forEach((particle, i) => {
        const ud = particle.userData;
        
        if (phase >= 1 && phase <= 3) {
          // Flow toward core
          particle.position.x += (ud.targetX - particle.position.x) * 0.01;
          particle.position.y += (ud.targetY - particle.position.y) * 0.01;
          particle.position.z += (ud.targetZ - particle.position.z) * 0.01;
          
          // Reset when close to core
          if (particle.position.distanceTo(new THREE.Vector3(ud.targetX, ud.targetY, ud.targetZ)) < 1) {
            particle.position.set(
              (Math.random() - 0.5) * 30,
              (Math.random() - 0.5) * 15,
              (Math.random() - 0.5) * 15 - 5
            );
          }
        } else {
          // Scatter
          particle.position.x += Math.sin(time + i) * 0.02;
          particle.position.y += Math.cos(time * 1.3 + i) * 0.02;
        }
        
        particle.rotation.z = time * 2;
      });

      // ===== PHASE 3: History Timeline =====
      if (phase >= 3) {
        historyTimeline.visible = true;
        
        // Reveal timeline nodes sequentially
        const phaseProgress = phase === 3 ? (cycleTime - 14) / 4 : 1;
        
        historyTimeline.children.forEach((child, i) => {
          if (child.userData.index !== undefined) {
            const revealProgress = Math.min(1, phaseProgress * 15 - i);
            
            if (revealProgress > 0) {
              child.userData.revealed = true;
              child.scale.setScalar(revealProgress);
              
              // Pulse revealed nodes
              const nodeMesh = child as THREE.Mesh;
              if (nodeMesh.material && !Array.isArray(nodeMesh.material)) {
                (nodeMesh.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(time * 3 + i) * 0.2;
              }
            }
          }
        });

        // Scroll timeline
        historyTimeline.position.y = Math.sin(time * 0.5) * 0.5;
      } else {
        historyTimeline.visible = false;
      }

      // ===== PHASE 4: Future Vision =====
      if (phase >= 4) {
        futureVision.visible = true;
        
        const phaseProgress = phase === 4 ? (cycleTime - 18) / 4 : 1;
        
        // Animate rising bars
        futureVision.children.slice(0, 4).forEach((barGroup, i) => {
          const bar = barGroup.children[1] as THREE.Mesh;
          const glow = barGroup.children[2] as THREE.Mesh;
          
          const targetHeight = bar.userData.targetHeight * phaseProgress;
          bar.userData.currentHeight += (targetHeight - bar.userData.currentHeight) * 0.05;
          
          bar.scale.y = Math.max(0.1, bar.userData.currentHeight);
          bar.position.y = 0.05 + bar.userData.currentHeight / 2;
          
          glow.position.y = bar.position.y + bar.userData.currentHeight / 2;
          glow.scale.y = Math.max(0.1, bar.userData.currentHeight * 0.1);
          
          // Pulse glow
          if (glow.material && !Array.isArray(glow.material)) {
            (glow.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 4 + i) * 0.15;
          }
        });

        // Arrow pulse
        const arrow = futureVision.children[4];
        arrow.position.y = 4 + Math.sin(time * 2) * 0.3;
        arrow.rotation.z = Math.sin(time * 0.5) * 0.1;
      } else {
        futureVision.visible = false;
        // Reset bar heights
        futureVision.children.slice(0, 4).forEach((barGroup) => {
          const bar = barGroup.children[1] as THREE.Mesh;
          bar.userData.currentHeight = 0;
        });
      }

      // ===== PHASE 5: Perfect Match =====
      if (phase === 5) {
        matchedCreator.visible = true;
        
        const phaseProgress = (cycleTime - 22) / 4;
        
        // Pulse matched creator
        matchedCreator.children[0].rotation.y += 0.03;
        matchedCreator.children[0].rotation.x += 0.02;
        
        const matchScale = 1 + Math.sin(time * 3) * 0.15;
        matchedCreator.children[0].scale.setScalar(matchScale);
        
        // Pulse success rings
        for (let i = 1; i < 5; i++) {
          const ring = matchedCreator.children[i];
          const ud = ring.userData;
          const pulse = 1 + Math.sin(time * 2 + ud.pulseOffset) * 0.2;
          ring.scale.setScalar(pulse * (1 + phaseProgress * 0.5));
        }

        // Animate sparkles
        for (let i = 5; i < matchedCreator.children.length; i++) {
          const sparkle = matchedCreator.children[i];
          const ud = sparkle.userData;
          ud.angle += 0.02;
          sparkle.position.x = Math.cos(ud.angle) * ud.radius;
          sparkle.position.z = Math.sin(ud.angle) * ud.radius;
          sparkle.position.y = Math.sin(time * ud.ySpeed * 80) * 1.5;
          sparkle.rotation.x += 0.08;
          sparkle.rotation.y += 0.05;
        }

        // Create connection beam from brand to matched creator
        while (connectionLines.children.length > 0) {
          connectionLines.remove(connectionLines.children[0]);
        }

        // Draw curved connection
        const brandPos = brand.position.clone();
        const matchPos = matchedCreator.position.clone();
        const midPoint = new THREE.Vector3(
          (brandPos.x + matchPos.x) / 2,
          (brandPos.y + matchPos.y) / 2 + 3,
          (brandPos.z + matchPos.z) / 2
        );
        
        const connectionCurve = new THREE.QuadraticBezierCurve3(brandPos, midPoint, matchPos);
        const connectionGeo = new THREE.TubeGeometry(connectionCurve, 50, 0.1 + Math.sin(time * 5) * 0.05, 12, false);
        const connectionMat = new THREE.MeshBasicMaterial({
          color: 0x22c55e,
          transparent: true,
          opacity: 0.6 + Math.sin(time * 4) * 0.2,
        });
        const connection = new THREE.Mesh(connectionGeo, connectionMat);
        connectionLines.add(connection);

        // Energy particles along connection
        for (let i = 0; i < 10; i++) {
          const t = (time * 0.5 + i * 0.1) % 1;
          const point = connectionCurve.getPoint(t);
          
          const energyGeo = new THREE.SphereGeometry(0.15, 8, 8);
          const energyMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x22c55e : 0x00f5ff,
            transparent: true,
            opacity: 0.8,
          });
          const energy = new THREE.Mesh(energyGeo, energyMat);
          energy.position.copy(point);
          connectionLines.add(energy);
        }

      } else {
        matchedCreator.visible = false;
        // Clear connection lines
        while (connectionLines.children.length > 0) {
          connectionLines.remove(connectionLines.children[0]);
        }
      }

      // ===== Background particles =====
      particles.rotation.y += 0.0001;
      particles.rotation.x += 0.00005;

      // Gentle wave motion
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += Math.sin(time * 0.5 + positions[i * 3] * 0.1) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;

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

  // Mouse interaction - smooth camera movement
  useEffect(() => {
    if (!sceneRef.current) return;
    const { camera, particles, vibeVettingCore } = sceneRef.current;
    
    // Camera follows mouse for immersive depth effect
    const targetX = (mousePosition.x - 0.5) * 12;
    const targetY = 3 + (mousePosition.y - 0.5) * -6;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // Particles respond to mouse
    particles.rotation.x = (mousePosition.y - 0.5) * 0.15;
    particles.rotation.z = (mousePosition.x - 0.5) * 0.1;

    // Core slightly follows mouse
    vibeVettingCore.rotation.y = (mousePosition.x - 0.5) * 0.3;
    vibeVettingCore.rotation.x = (mousePosition.y - 0.5) * 0.2;
  }, [mousePosition]);

  return (
    <div 
      ref={containerRef} 
      className="home-three-scene"
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
