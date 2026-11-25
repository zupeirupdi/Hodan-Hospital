import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HOSPITAL_IMAGES } from '../data/hospitalData';
import { LightboxMedia } from './AmbientEffects';

export interface CardTunnel3DCanvasProps {
  scrollProgress: number;
  autoCruise: boolean;
  onInspectCard: (media: LightboxMedia) => void;
  onActiveTitleChange?: (title: string) => void;
}

const TUNNEL_CARD_DEFS = [
  { src: HOSPITAL_IMAGES.exteriorBuilding, title: 'Hodan Hospital Main Campus', subtitle: 'Abdikassim Road, Hodan District' },
  { src: HOSPITAL_IMAGES.operatingRoom, title: 'Sterile Surgical & Laparoscopy Theater', subtitle: 'Level 2 · C-Arm & Anesthesia Suites' },
  { src: HOSPITAL_IMAGES.receptionLobby, title: 'Main Admissions Atrium', subtitle: 'Ground Floor · Paperless EHR Check-In' },
  { src: HOSPITAL_IMAGES.neuroOrtho, title: 'Neurosurgery & Orthopedics Suite', subtitle: 'Spine, Cranial & Trauma Diagnostics' },
  { src: HOSPITAL_IMAGES.nicuPediatrics, title: 'Neonatal ICU (NICU) & Nursery', subtitle: 'Dedicated Newborn Intensive Care' },
  { src: HOSPITAL_IMAGES.pharmacyCare, title: '24/7 Clinical Pharmacy Dispensary', subtitle: 'EHR-Verified Medication Care' },
  { src: HOSPITAL_IMAGES.dentalOphthalmology, title: 'Ophthalmology & Oral Dentistry', subtitle: 'Eye Microsurgery & Dental Clinics' },
  { src: HOSPITAL_IMAGES.diagnosticsLab, title: 'CT/MRI & Automated Pathology Lab', subtitle: 'Level 1 Diagnostic Imaging Division' },
  { src: HOSPITAL_IMAGES.icuSuite, title: 'Adult ICU & Private Recovery Suites', subtitle: 'Level 3 Continuous Telemetry Care' },
  { src: HOSPITAL_IMAGES.maternityCare, title: 'Maternal & Pediatric Pavilion', subtitle: 'Obstetrics, Gynecology & Child Wellness' },
  { src: HOSPITAL_IMAGES.medicalTeam, title: 'Clinical Directorate & Specialists', subtitle: 'Physicians, Surgeons & Nursing Leads' },
  { src: HOSPITAL_IMAGES.outreachAmbulance, title: 'Emergency Dispatch Fleet (1234)', subtitle: '24/7 Pre-Hospital Patient Transport' },
];

export const CardTunnel3DCanvas: React.FC<CardTunnel3DCanvasProps> = ({
  scrollProgress,
  autoCruise,
  onInspectCard,
  onActiveTitleChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const propsRef = useRef({ scrollProgress, autoCruise, onInspectCard, onActiveTitleChange });
  propsRef.current = { scrollProgress, autoCruise, onInspectCard, onActiveTitleChange };

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
    renderer.toneMappingExposure = 1.14;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'pan-y';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b0e, 0.044);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 64);
    camera.position.set(0, 0, 2.6);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const tealGlow = new THREE.PointLight(0x2dd4bf, 5.5, 24);
    tealGlow.position.set(0, 0, -4);
    scene.add(tealGlow);

    const goldGlow = new THREE.PointLight(0xea9e24, 4.5, 26);
    goldGlow.position.set(0, 1.4, -12);
    scene.add(goldGlow);

    // Prepare textures lazily once user nears the Card Tunnel section
    let disposed = false;
    const textureLoader = new THREE.TextureLoader();
    const maxAniso = isSoftwareGl ? 1 : Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const textures: (THREE.Texture | null)[] = TUNNEL_CARD_DEFS.map(() => null);
    const materialsByDef: THREE.MeshBasicMaterial[][] = TUNNEL_CARD_DEFS.map(() => []);
    let texturesRequested = false;

    const loadTunnelTextures = () => {
      if (texturesRequested || disposed) return;
      texturesRequested = true;
      TUNNEL_CARD_DEFS.forEach((def, defIdx) => {
        textureLoader.load(def.src, (tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = maxAniso;
          textures[defIdx] = tex;
          for (const mat of materialsByDef[defIdx]) {
            mat.color.setHex(0xffffff);
            mat.map = tex;
            mat.needsUpdate = true;
          }
        });
      });
    };

    // Subtle tunnel guide rings in Hodan Teal & Gold
    const ringGeo = new THREE.TorusGeometry(4.55, 0.014, 8, 72);
    const ringMatTeal = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.24,
    });
    const ringMatGold = new THREE.MeshBasicMaterial({
      color: 0xea9e24,
      transparent: true,
      opacity: 0.26,
    });

    for (let r = 0; r < 11; r++) {
      const ring = new THREE.Mesh(ringGeo, r % 2 === 0 ? ringMatGold : ringMatTeal);
      ring.position.z = -r * 3.2 - 1.5;
      scene.add(ring);
    }

    // Build 36 curved photo cards forming a swirling MotionSites Card Tunnel
    const cardCount = isSoftwareGl ? 24 : 36;
    const cardGeo = new THREE.PlaneGeometry(2.45, 1.58, 10, 1);
    const posAttr = cardGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      posAttr.setZ(i, (vx * vx) * 0.088);
    }
    cardGeo.computeVertexNormals();

    const borderGeo = new THREE.PlaneGeometry(2.53, 1.66, 10, 1);
    const borderPos = borderGeo.attributes.position;
    for (let i = 0; i < borderPos.count; i++) {
      const vx = borderPos.getX(i);
      borderPos.setZ(i, (vx * vx) * 0.088 - 0.015);
    }

    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    const interactiveMeshes: THREE.Mesh[] = [];
    const cardGroups: {
      group: THREE.Group;
      baseZ: number;
      angle: number;
      radius: number;
      defIdx: number;
      borderMat: THREE.MeshBasicMaterial;
    }[] = [];

    const tunnelSpan = 36;

    for (let i = 0; i < cardCount; i++) {
      const defIdx = i % TUNNEL_CARD_DEFS.length;
      const ringSlot = Math.floor(i / 4);
      const lane = i % 4;
      const angle = (lane / 4) * Math.PI * 2 + ringSlot * 0.44 + 0.36;
      const radius = 3.55 + (lane % 2) * 0.38;
      const z = -(i / cardCount) * tunnelSpan;

      const cardMat = new THREE.MeshBasicMaterial({
        color: 0x0f1f26,
        side: THREE.DoubleSide,
      });
      materialsByDef[defIdx].push(cardMat);

      const borderMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xea9e24 : 0x2dd4bf,
        transparent: true,
        opacity: 0.52,
        side: THREE.DoubleSide,
      });

      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.userData = { defIdx };
      interactiveMeshes.push(cardMesh);

      const borderMesh = new THREE.Mesh(borderGeo, borderMat);

      const group = new THREE.Group();
      group.add(borderMesh);
      group.add(cardMesh);
      group.position.set(Math.cos(angle) * radius, Math.sin(angle) * (radius * 0.72), z);
      group.lookAt(0, 0, z + 1.4);

      tunnelGroup.add(group);
      cardGroups.push({ group, baseZ: z, angle, radius, defIdx, borderMat });
    }

    // Telemetry warp motes streaming along tunnel
    const moteCount = isSoftwareGl ? 60 : 140;
    const moteGeo = new THREE.BufferGeometry();
    const motePositions = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const rad = 1.2 + Math.random() * 4.5;
      motePositions[i * 3] = Math.cos(a) * rad;
      motePositions[i * 3 + 1] = Math.sin(a) * rad * 0.75;
      motePositions[i * 3 + 2] = -Math.random() * tunnelSpan;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.065,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(-9, -9);
    let hoverOffsetX = 0;
    let hoverOffsetY = 0;
    let hoveredDefIdx: number | null = null;
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      pointerNdc.set(nx, ny);
      hoverOffsetX = nx * 0.5;
      hoverOffsetY = ny * 0.35;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 8) return;
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        const hitIdx = hits[0].object.userData.defIdx as number;
        const item = TUNNEL_CARD_DEFS[hitIdx];
        if (item) {
          propsRef.current.onInspectCard({
            src: item.src,
            title: item.title,
            subtitle: item.subtitle,
          });
        }
      }
    };

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 240);
      const h = Math.max(container.clientHeight, 240);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let isVisible = false;
    const visObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.02 }
    );
    visObserver.observe(container);

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadTunnelTextures();
          preloadObserver.disconnect();
        }
      },
      { rootMargin: '900px 0px', threshold: 0.01 }
    );
    preloadObserver.observe(container);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId = 0;
    let lastTime = performance.now();
    let cruiseOffset = 0;
    let smoothScroll = 0;

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

      if (isVisible) {
        const { scrollProgress: scrollTarget, autoCruise: cruise, onActiveTitleChange: titleCb } =
          propsRef.current;

        if (cruise && !prefersReducedMotion) {
          cruiseOffset = (cruiseOffset + delta * 2.25) % tunnelSpan;
        }
        smoothScroll = THREE.MathUtils.damp(smoothScroll, scrollTarget, 5, delta);

        const travel = (smoothScroll * 24 + cruiseOffset) % tunnelSpan;

        for (const item of cardGroups) {
          let z = item.baseZ + travel;
          while (z > 3.6) z -= tunnelSpan;
          while (z < 3.6 - tunnelSpan) z += tunnelSpan;

          const swirl = z * 0.036;
          const x = Math.cos(item.angle + swirl) * item.radius;
          const y = Math.sin(item.angle + swirl) * (item.radius * 0.72);
          item.group.position.set(x, y, z);
          item.group.lookAt(0, 0, z + 1.8);

          const isHovered = hoveredDefIdx === item.defIdx;
          item.borderMat.color.setHex(isHovered ? 0xfbbf24 : item.defIdx % 2 === 0 ? 0xea9e24 : 0x2dd4bf);
          item.borderMat.opacity = isHovered ? 0.98 : 0.48;
        }

        const posArr = moteGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < moteCount; i++) {
          let mz = posArr.getZ(i) + delta * (cruise ? 4.2 : 1.1);
          if (mz > 3) mz = -tunnelSpan + Math.random() * 2;
          posArr.setZ(i, mz);
        }
        posArr.needsUpdate = true;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, hoverOffsetX, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, hoverOffsetY, 5, delta);
        camera.lookAt(hoverOffsetX * 0.2, hoverOffsetY * 0.2, -16);

        if (Math.abs(pointerNdc.x) <= 1 && Math.abs(pointerNdc.y) <= 1) {
          raycaster.setFromCamera(pointerNdc, camera);
          const hits = raycaster.intersectObjects(interactiveMeshes, false);
          if (hits.length > 0) {
            const idx = hits[0].object.userData.defIdx as number;
            if (hoveredDefIdx !== idx) {
              hoveredDefIdx = idx;
              canvas.style.cursor = 'pointer';
              titleCb?.(TUNNEL_CARD_DEFS[idx]?.title ?? 'Hodan Hospital');
            }
          } else if (hoveredDefIdx !== null) {
            hoveredDefIdx = null;
            canvas.style.cursor = 'default';
          }
        }

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
      preloadObserver.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);

      cardGeo.dispose();
      borderGeo.dispose();
      ringGeo.dispose();
      ringMatTeal.dispose();
      ringMatGold.dispose();
      moteGeo.dispose();
      moteMat.dispose();
      textures.forEach((t) => t?.dispose());
      interactiveMeshes.forEach((m) => (m.material as THREE.Material).dispose());
      cardGroups.forEach((c) => c.borderMat.dispose());
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-4 p-6 sm:grid-cols-3">
        {TUNNEL_CARD_DEFS.slice(0, 6).map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onInspectCard(item)}
            className="relative overflow-hidden rounded-xl border border-white/15 bg-[#0D161B]"
          >
            <img
              src={item.src}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="relative h-full w-full"
      aria-label="Interactive 3D Card Tunnel gallery of Hodan Hospital"
    />
  );
};
