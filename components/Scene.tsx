
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { COLORS } from '../constants';
import { MarsProject } from '../types';

interface SceneProps {
  projects: MarsProject[];
  onProjectSelect: (project: MarsProject) => void;
}

const Scene: React.FC<SceneProps> = ({ projects, onProjectSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010103, 0.008);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 4000);
    camera.position.set(0, 30, 110);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x010103, 1);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.15;
    controls.maxDistance = 400;
    controls.minDistance = 20;

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 2.5, 0.4, 0.85);
    bloomPass.threshold = 0.35; 
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.8;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(30, 60, 30);
    scene.add(pointLight);

    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // --- YELLOW-GREEN PARTICLE TREE ---
    const treeHeight = 45;
    const particleCount = 65000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const cYellow = new THREE.Color(COLORS.festiveGold);
    const cGreen = new THREE.Color(COLORS.primary);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const h = t * treeHeight;
      const angle = t * Math.PI * 105;
      
      const baseRadius = (1 - t) * 17.5 + 0.3;
      const noise = (Math.random() - 0.5) * 6.5 * (1 - t + 0.1); 
      const radius = baseRadius + noise;

      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = h - 22.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.5;

      const mixedColor = cGreen.clone().lerp(cYellow, t);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 2.0;
    }

    const treeGeometry = new THREE.BufferGeometry();
    treeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    treeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    treeGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const treeMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const treeParticles = new THREE.Points(treeGeometry, treeMaterial);
    treeGroup.add(treeParticles);

    // --- STAR TOPPER ---
    const createStarShape = (radius: number, innerRadius: number) => {
      const shape = new THREE.Shape();
      const spikes = 5;
      const step = Math.PI / spikes;
      let rotation = -Math.PI / 2;
      shape.moveTo(0, -radius);
      for (let i = 0; i < spikes; i++) {
        let x = Math.cos(rotation) * radius;
        let y = Math.sin(rotation) * radius;
        shape.lineTo(x, y);
        rotation += step;
        x = Math.cos(rotation) * innerRadius;
        y = Math.sin(rotation) * innerRadius;
        shape.lineTo(x, y);
        rotation += step;
      }
      return shape;
    };

    const starShape = createStarShape(2.8, 1.2);
    const topperStarGeo = new THREE.ShapeGeometry(starShape);
    const topperStarMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const starMesh = new THREE.Mesh(topperStarGeo, topperStarMat);
    starMesh.position.y = treeHeight - 22.5 + 1.2;
    treeGroup.add(starMesh);

    // --- CHRISTMAS ORNAMENTS (Dense & Random Sizes) ---
    const ornamentCount = 300; // Increased density
    const ornamentGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const ornamentColors = [0xe11d48, 0xffffff, 0xfde047, 0x10b981]; 
    
    for (let i = 0; i < ornamentCount; i++) {
      const t = Math.random();
      const h = t * treeHeight;
      const angle = Math.random() * Math.PI * 2;
      // Keep ornaments closer to the tree's shell for a "compact" look
      const treeRadiusAtH = (1 - t) * 16.5 + 1.2;
      const radius = treeRadiusAtH + (Math.random() - 0.5) * 1.5;
      
      const col = ornamentColors[Math.floor(Math.random() * ornamentColors.length)];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        metalness: 0.9,
        roughness: 0.1,
        emissive: col,
        emissiveIntensity: 0.3
      });
      
      const ornament = new THREE.Mesh(ornamentGeometry, mat);
      ornament.position.set(
        Math.cos(angle) * radius,
        h - 22.5,
        Math.sin(angle) * radius
      );
      
      // Random scale for variety
      const randScale = 0.35 + Math.random() * 0.9;
      ornament.scale.setScalar(randScale);
      
      treeGroup.add(ornament);
    }

    // --- ENHANCED GIFT BOXES ---
    const giftCount = 12;
    const boxGeo = new THREE.BoxGeometry(3, 3, 3);
    const ribbonGeo1 = new THREE.BoxGeometry(3.1, 0.4, 0.4);
    const ribbonGeo2 = new THREE.BoxGeometry(0.4, 0.4, 3.1);
    const ribbonGeo3 = new THREE.BoxGeometry(0.4, 3.1, 0.4);
    const bowGeo = new THREE.SphereGeometry(0.4, 8, 8);

    for(let i=0; i<giftCount; i++) {
        const giftGroup = new THREE.Group();
        
        const mainColor = ornamentColors[i % ornamentColors.length];
        const ribbonColor = i % 2 === 0 ? 0xfde047 : 0xffffff;
        
        const giftMat = new THREE.MeshStandardMaterial({ 
            color: mainColor,
            metalness: 0.5,
            roughness: 0.4
        });
        const ribbonMat = new THREE.MeshStandardMaterial({ 
            color: ribbonColor,
            emissive: ribbonColor,
            emissiveIntensity: 0.2
        });

        // Box
        const giftBox = new THREE.Mesh(boxGeo, giftMat);
        giftGroup.add(giftBox);

        // Ribbons
        const r1 = new THREE.Mesh(ribbonGeo1, ribbonMat);
        r1.position.y = 1.35;
        giftGroup.add(r1);

        const r2 = new THREE.Mesh(ribbonGeo2, ribbonMat);
        r2.position.y = 1.35;
        giftGroup.add(r2);

        const r3 = new THREE.Mesh(ribbonGeo3, ribbonMat);
        giftGroup.add(r3);
        
        const r4 = new THREE.Mesh(ribbonGeo3, ribbonMat);
        r4.rotation.z = Math.PI / 2;
        giftGroup.add(r4);

        // Bow on top
        const bow = new THREE.Mesh(bowGeo, ribbonMat);
        bow.position.y = 1.6;
        bow.scale.set(1.5, 0.8, 1.5);
        giftGroup.add(bow);

        const r = 11 + Math.random() * 8;
        const angle = (i / giftCount) * Math.PI * 2 + Math.random() * 0.5;
        giftGroup.position.set(Math.cos(angle) * r, -21, Math.sin(angle) * r);
        giftGroup.rotation.y = Math.random() * Math.PI;
        giftGroup.scale.setScalar(0.7 + Math.random() * 0.6);
        
        scene.add(giftGroup);
    }

    // --- THIN SILK SPIRAL LIGHT TRAIL ---
    const createLightTrail = () => {
      const points = [];
      const segments = 1200;
      const loops = 15;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI * 2 * loops;
        const radius = (1 - t) * 20.5 + 2.0;
        const y = t * 48 - 24;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const trailGeo = new THREE.BufferGeometry();
      const vertices = [];
      const trailColors = [];
      const res = 2500;
      
      const ribbonColorStart = new THREE.Color('#fff000');
      const ribbonColorEnd = new THREE.Color('#ffffff');
      
      for (let i = 0; i < res; i++) {
        const t = i / res;
        const p = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
        const width = 0.015 + Math.sin(t * Math.PI * 40) * 0.005; 
        
        const v1 = p.clone().add(normal.clone().multiplyScalar(width));
        const v2 = p.clone().add(normal.clone().multiplyScalar(-width));
        
        vertices.push(v1.x, v1.y, v1.z);
        vertices.push(v2.x, v2.y, v2.z);

        const col = ribbonColorStart.clone().lerp(ribbonColorEnd, t);
        trailColors.push(col.r, col.g, col.b);
        trailColors.push(col.r, col.g, col.b);
      }

      trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      trailGeo.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));

      const indices = [];
      for (let i = 0; i < res - 1; i++) {
        const a = i * 2;
        const b = i * 2 + 1;
        const c = (i + 1) * 2;
        const d = (i + 1) * 2 + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
      trailGeo.setIndex(indices);

      const trailMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      return new THREE.Mesh(trailGeo, trailMat);
    };

    const lightTrail = createLightTrail();
    scene.add(lightTrail);

    // --- PROJECT NODES ---
    const projectNodes: THREE.Sprite[] = [];
    
    const createNodes = (projList: MarsProject[]) => {
      projectNodes.forEach(n => {
          scene.remove(n);
          if(n.userData.ring) scene.remove(n.userData.ring);
      });
      projectNodes.length = 0;

      const displayItems = projList.length === 0 ? 
        Array.from({ length: 6 }).map((_, i) => ({ id: `p-${i}`, isPlaceholder: true })) : 
        projList;

      displayItems.forEach((item: any, index: number) => {
        const hRange = 40; 
        const yPos = (Math.random() - 0.5) * hRange; 
        const t = (yPos + 22.5) / treeHeight; 
        const treeRadiusAtH = (1 - Math.max(0, Math.min(1, t))) * 17;
        
        const angle = Math.random() * Math.PI * 2;
        const radiusOffset = 8 + Math.random() * 10;
        const radius = treeRadiusAtH + radiusOffset;

        let spriteMat: THREE.SpriteMaterial;
        if (item.isPlaceholder) {
            spriteMat = new THREE.SpriteMaterial({ 
                color: 0x10b981, 
                transparent: true, 
                opacity: 0.15,
                blending: THREE.AdditiveBlending 
            });
        } else {
            const texture = textureLoader.load(item.imageUrl);
            spriteMat = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: false, 
                opacity: 1.0, 
                color: 0x888888 
            });
        }

        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(10.0, 7.0, 1);
        sprite.position.set(
          Math.cos(angle) * radius,
          yPos,
          Math.sin(angle) * radius
        );
        
        sprite.userData = { 
            project: item.isPlaceholder ? null : item, 
            isPlaceholder: !!item.isPlaceholder,
            originalScale: sprite.scale.clone(), 
            angle, 
            radius, 
            yPos 
        };
        projectNodes.push(sprite);
        scene.add(sprite);

        const ringGeo = new THREE.RingGeometry(5.2, 5.4, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
          color: COLORS.primary, 
          transparent: true, 
          opacity: 0.15,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(sprite.position);
        scene.add(ring);
        sprite.userData.ring = ring;
      });
    };

    createNodes(projects);

    // --- AMBIENT FLOATING MOTES ---
    const moteCount = 2000;
    const motePositions = new Float32Array(moteCount * 3);
    const moteVelocities = new Float32Array(moteCount * 3);
    for(let i=0; i<moteCount; i++) {
        motePositions[i*3] = (Math.random() - 0.5) * 180;
        motePositions[i*3+1] = (Math.random() - 0.5) * 180;
        motePositions[i*3+2] = (Math.random() - 0.5) * 180;
        moteVelocities[i*3] = (Math.random() - 0.5) * 0.04;
        moteVelocities[i*3+1] = (Math.random() - 0.5) * 0.04;
        moteVelocities[i*3+2] = (Math.random() - 0.5) * 0.04;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const moteMat = new THREE.PointsMaterial({ 
      size: 0.04, 
      color: 0xccffaa, 
      transparent: true, 
      opacity: 0.45, 
      blending: THREE.AdditiveBlending 
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    // --- DENSE STAR FIELD ---
    const starCount = 45000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for(let i=0; i<starCount; i++) {
        const r = 400 + Math.random() * 1600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        starPositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        starPositions[i*3+2] = r * Math.cos(phi);
        const col = new THREE.Color().setHSL(0.18 + Math.random() * 0.08, 0.4, 0.7);
        starColors[i*3] = col.r;
        starColors[i*3+1] = col.g;
        starColors[i*3+2] = col.b;
    }
    const starFieldGeo = new THREE.BufferGeometry();
    starFieldGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starFieldGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starFieldMat = new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starFieldGeo, starFieldMat);
    scene.add(stars);

    const onMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(projectNodes);
      if (intersects.length > 0) {
        const project = intersects[0].object.userData.project;
        if (project) {
          onProjectSelect(project);
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      controls.update();
      treeGroup.rotation.y = elapsedTime * 0.02;
      lightTrail.rotation.y = elapsedTime * 0.12;

      const starPulse = 1.0 + Math.sin(elapsedTime * 3.5) * 0.12;
      starMesh.scale.set(starPulse, starPulse, starPulse);
      starMesh.lookAt(camera.position);

      const motePosArray = motes.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<moteCount; i++) {
          motePosArray[i*3] += moteVelocities[i*3];
          motePosArray[i*3+1] += moteVelocities[i*3+1];
          motePosArray[i*3+2] += moteVelocities[i*3+2];
          if(Math.abs(motePosArray[i*3]) > 120) motePosArray[i*3] *= -0.99;
          if(Math.abs(motePosArray[i*3+1]) > 120) motePosArray[i*3+1] *= -0.99;
          if(Math.abs(motePosArray[i*3+2]) > 120) motePosArray[i*3+2] *= -0.99;
      }
      motes.geometry.attributes.position.needsUpdate = true;
      motes.rotation.y = elapsedTime * 0.008;

      projectNodes.forEach((sprite, i) => {
        const floatY = Math.sin(elapsedTime * 0.8 + i) * 1.5;
        const orbitAngle = sprite.userData.angle + elapsedTime * 0.04;
        
        sprite.position.x = Math.cos(orbitAngle) * sprite.userData.radius;
        sprite.position.z = Math.sin(orbitAngle) * sprite.userData.radius;
        sprite.position.y = sprite.userData.yPos + floatY;
        
        if (sprite.userData.ring) {
            sprite.userData.ring.position.copy(sprite.position);
            sprite.userData.ring.lookAt(camera.position);
            const ringPulse = 1.0 + Math.sin(elapsedTime * 2.5 + i) * 0.08;
            sprite.userData.ring.scale.set(ringPulse, ringPulse, 1);
        }
      });

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(projectNodes);
      
      projectNodes.forEach(s => {
          if (!s.userData.isPlaceholder) {
            (s.material as THREE.SpriteMaterial).color.set(0x888888);
          } else {
            (s.material as THREE.SpriteMaterial).color.set(0x10b981);
            (s.material as THREE.SpriteMaterial).opacity = 0.15;
          }
          s.scale.lerp(s.userData.originalScale, 0.1);
      });
      
      if (intersects.length > 0) {
          const target = intersects[0].object as THREE.Sprite;
          if (!target.userData.isPlaceholder) {
            document.body.style.cursor = 'pointer';
            (target.material as THREE.SpriteMaterial).color.set(0xffffff);
            target.scale.lerp(new THREE.Vector3(12.0, 8.5, 1), 0.15); 
          }
      } else {
          document.body.style.cursor = 'default';
      }

      composer.render();
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      containerRef.current?.removeChild(renderer.domElement);
      treeGeometry.dispose();
      treeMaterial.dispose();
      topperStarGeo.dispose();
      topperStarMat.dispose();
      lightTrail.geometry.dispose();
      (lightTrail.material as THREE.Material).dispose();
      projectNodes.forEach(s => {
          (s.material as THREE.Material).dispose();
          if(s.userData.ring) {
              s.userData.ring.geometry.dispose();
              s.userData.ring.material.dispose();
          }
      });
      moteGeo.dispose();
      moteMat.dispose();
      starFieldGeo.dispose();
      starFieldMat.dispose();
      renderer.dispose();
    };
  }, [projects, onProjectSelect, textureLoader]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Scene;
