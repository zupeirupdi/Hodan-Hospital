import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createAnatomicalHeart, evaluateCardiacCycle } from '../three/anatomicalHeartGeometry';

export type HeartViewMode = 'overview' | 'coronary' | 'rhythm';

export interface HeartCanvas3DProps {
  viewMode: HeartViewMode;
  isPaused: boolean;
  bpm: number;
  selectedHotspotId: string | null;
  onEcgSample?: (ecgValue: number, phase: number) => void;
  onSelectHotspot?: (id: string) => void;
}

const _tmpVec = new THREE.Vector3();

function createSoftParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(240, 253, 250, 1)');
    grad.addColorStop(0.35, 'rgba(45, 212, 191, 0.55)');
    grad.addColorStop(0.7, 'rgba(234, 158, 36, 0.25)');
    grad.addColorStop(1, 'rgba(31, 110, 122, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const HeartCanvas3D: React.FC<HeartCanvas3DProps> = ({
  viewMode,
  isPaused,
  bpm,
  selectedHotspotId,
  onEcgSample,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const propsRef = useRef({ viewMode, isPaused, bpm, selectedHotspotId, onEcgSample });
  propsRef.current = { viewMode, isPaused, bpm, selectedHotspotId, onEcgSample };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param) || '');
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'pan-y';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(0, 0.08, 4.95);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Hodan Hospital Brand Lighting Rig: Amber Gold Superior Key + Clinical Teal Rim & Core
    const hemiLight = new THREE.HemisphereLight(0x99f6e4, 0x102026, 1.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfef3c7, 2.35);
    keyLight.position.set(-2.4, 3.2, 3.6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 2.3);
    rimLight.position.set(3.2, -1.6, -2.6);
    scene.add(rimLight);

    const topGoldLight = new THREE.PointLight(0xea9e24, 3.4, 9);
    topGoldLight.position.set(-0.6, 2.1, 1.8);
    scene.add(topGoldLight);

    const apexTealLight = new THREE.PointLight(0x14b8a6, 2.8, 8);
    apexTealLight.position.set(0.8, -1.7, 1.7);
    scene.add(apexTealLight);

    // Anatomically Accurate 3D Human Heart (already tinted Hodan Gold -> Architectural Teal)
    const heart = createAnatomicalHeart(isSoftwareGl);
    scene.add(heart.root);

    // Subtle inner bioluminescent teal core inside myocardium
    const innerGlowGeo = new THREE.SphereGeometry(0.46, 28, 24);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#2dd4bf'),
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerGlowMesh = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    innerGlowMesh.position.set(0.08, -0.15, 0);
    heart.ventriclesGroup.add(innerGlowMesh);

    // Tilted telemetry orbital rings in Hodan Gold & Clinical Teal
    const ringGeo1 = new THREE.TorusGeometry(1.75, 0.006, 12, 96);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ea9e24'),
      transparent: true,
      opacity: 0.28,
    });
    const haloRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    haloRing1.rotation.set(Math.PI * 0.42, 0.22, -0.18);
    scene.add(haloRing1);

    const ringGeo2 = new THREE.TorusGeometry(2.05, 0.0045, 12, 96);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#2dd4bf'),
      transparent: true,
      opacity: 0.18,
    });
    const haloRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    haloRing2.rotation.set(-Math.PI * 0.36, -0.3, 0.25);
    scene.add(haloRing2);

    // Ambient floating luminous bioparticles arranged in a spatial 3D cardiac aura shell
    const particleCount = isSoftwareGl ? 48 : 130;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleBase = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const rad = 1.65 + Math.random() * 2.1;
      const px = Math.sin(phi) * Math.cos(theta) * rad;
      const py = Math.cos(phi) * rad * 0.85;
      const pz = Math.sin(phi) * Math.sin(theta) * rad - 0.5;
      particlePositions[i * 3] = px;
      particlePositions[i * 3 + 1] = py;
      particlePositions[i * 3 + 2] = pz;
      particleBase[i * 3] = px;
      particleBase[i * 3 + 1] = py;
      particleBase[i * 3 + 2] = pz;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleTex = createSoftParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.145,
      map: particleTex,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isDragging = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let targetDragYaw = 0;
    let targetDragPitch = 0;
    let currentDragYaw = 0;
    let currentDragPitch = 0;
    let hoverOffsetX = 0;
    let hoverOffsetY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      hoverOffsetX = nx * 0.16;
      hoverOffsetY = ny * 0.1;

      if (!isDragging) return;
      const dx = e.clientX - pointerStartX;
      const dy = e.clientY - pointerStartY;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;

      targetDragYaw = THREE.MathUtils.clamp(targetDragYaw + dx * 0.009, -1.25, 1.25);
      targetDragPitch = THREE.MathUtils.clamp(targetDragPitch + dy * 0.006, -0.55, 0.55);
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 240);
      const h = Math.max(container.clientHeight, 240);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let isVisible = true;
    const visObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    visObserver.observe(container);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let cycleAccum = 0;
    let idleClock = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      if (!isVisible) {
        frameId = isSoftwareGl ? window.setTimeout(tick, 180) : requestAnimationFrame(tick);
        return;
      }

      const { viewMode: mode, isPaused: paused, bpm: targetBpm, selectedHotspotId: hotspot, onEcgSample: ecgCb } =
        propsRef.current;

      const beatRate = targetBpm / 60;
      if (!paused && !prefersReducedMotion) {
        cycleAccum = (cycleAccum + delta * beatRate) % 1;
        idleClock += delta;
      }

      const cycle = paused ? evaluateCardiacCycle(0.75) : evaluateCardiacCycle(cycleAccum);

      if (ecgCb) {
        ecgCb(cycle.ecgValue, cycleAccum);
      }

      const vRadial = 1 - cycle.systole * 0.082 + cycle.diastoleRecoil * 0.032;
      const vLength = 1 + cycle.systole * 0.025;
      heart.ventriclesGroup.scale.set(vRadial, vLength, vRadial);
      heart.ventriclesGroup.rotation.y = cycle.systole * 0.055;

      const aScale = 1 - cycle.atrialPulse * 0.075 + cycle.systole * 0.035;
      heart.atriaGroup.scale.set(aScale, 1 - cycle.atrialPulse * 0.04, aScale);

      const vesselPulse = 1 + cycle.arterialPulse * 0.048;
      heart.vesselsGroup.scale.set(vesselPulse, 1 + cycle.arterialPulse * 0.018, vesselPulse);

      const targetCoronaryScale = mode === 'coronary' ? 1.032 : 1.0;
      const nextCor = THREE.MathUtils.damp(heart.coronaryGroup.scale.x, targetCoronaryScale, 6, delta);
      heart.coronaryGroup.scale.setScalar(nextCor);

      topGoldLight.intensity = 3.2 + cycle.systole * 1.45;
      apexTealLight.intensity = 2.6 + cycle.arterialPulse * 1.3;
      innerGlowMat.opacity = 0.13 + cycle.systole * 0.16;
      ringMat1.opacity = mode === 'rhythm' ? 0.25 + cycle.systole * 0.25 : 0.24;

      let presetYaw = 0;
      let presetPitch = 0;
      let targetCamZ = width < 640 ? 5.35 : 4.5;
      let targetCamY = 0.08;

      if (mode === 'coronary') {
        presetYaw = -0.36;
        presetPitch = 0.1;
        targetCamZ = width < 640 ? 4.85 : 3.9;
      } else if (mode === 'rhythm') {
        presetYaw = 0.3;
        presetPitch = -0.06;
        targetCamZ = width < 640 ? 5.05 : 4.15;
      }

      if (hotspot === 'aortic-arch') {
        presetPitch = 0.22;
        targetCamY = 0.42;
      } else if (hotspot === 'mitral-valve') {
        presetYaw = -0.25;
        targetCamY = -0.08;
      } else if (hotspot === 'coronary-tree') {
        presetYaw = -0.18;
      } else if (hotspot === 'pulmonary-trunk') {
        presetYaw = 0.36;
      }

      const scrollProgress = prefersReducedMotion
        ? 0
        : THREE.MathUtils.clamp(window.scrollY / Math.max(window.innerHeight, 600), 0, 1);

      if (!isDragging && (mode !== 'overview' || hotspot)) {
        targetDragYaw = THREE.MathUtils.damp(targetDragYaw, 0, 2.2, delta);
        targetDragPitch = THREE.MathUtils.damp(targetDragPitch, 0, 2.2, delta);
      }

      currentDragYaw = THREE.MathUtils.damp(
        currentDragYaw,
        targetDragYaw + presetYaw + scrollProgress * 0.48,
        6,
        delta
      );
      currentDragPitch = THREE.MathUtils.damp(
        currentDragPitch,
        targetDragPitch + presetPitch - scrollProgress * 0.18,
        6,
        delta
      );

      const idleFloatY = prefersReducedMotion ? 0 : Math.sin(idleClock * 1.25) * 0.045;
      const idleSwayYaw = prefersReducedMotion ? 0 : Math.sin(idleClock * 0.65) * 0.11;

      heart.root.position.y = idleFloatY + scrollProgress * 0.14;
      heart.root.rotation.y = -0.14 + currentDragYaw + idleSwayYaw + hoverOffsetX * 0.65;
      heart.root.rotation.x = 0.08 + currentDragPitch + hoverOffsetY * 0.55;

      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 5, delta);
      _tmpVec.set(0, targetCamY * 0.65, 0);
      camera.lookAt(_tmpVec);

      const auraExpand = 1 + cycle.systole * 0.055;
      particles.scale.setScalar(auraExpand);
      particles.rotation.y = idleClock * 0.045 + hoverOffsetX * 0.25;
      particles.rotation.x = hoverOffsetY * 0.15;
      haloRing1.rotation.z = -0.18 + idleClock * 0.08;
      haloRing2.rotation.z = 0.25 - idleClock * 0.06;

      if (!contextLost) {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      visObserver.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      heart.dispose();
      innerGlowGeo.dispose();
      innerGlowMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
      envTarget.dispose();
      renderer.dispose();

      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <svg
          viewBox="0 0 320 360"
          className="h-72 w-72 drop-shadow-[0_18px_48px_rgba(31,110,122,0.45)] md:h-96 md:w-96"
          aria-label="Anatomical human heart illustration"
        >
          <defs>
            <linearGradient id="heartFallbackGrad" x1="0%" y1="0%" x2="20%" y2="100%">
              <stop offset="0%" stopColor="#EA9E24" />
              <stop offset="45%" stopColor="#1F6E7A" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
          </defs>
          <path
            d="M150 92 C142 56, 168 38, 192 52 C210 62, 212 88, 198 106 L186 118 C222 126, 250 158, 242 206 C234 252, 194 294, 166 314 C144 302, 92 260, 82 202 C74 156, 98 122, 134 114 Z"
            fill="url(#heartFallbackGrad)"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="relative h-full w-full cursor-grab active:cursor-grabbing select-none"
      aria-label="Interactive 3D anatomical beating human heart — drag to rotate"
      role="img"
    />
  );
};
