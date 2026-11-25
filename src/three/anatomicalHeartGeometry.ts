import * as THREE from 'three';

export interface HeartAnatomyHandles {
  root: THREE.Group;
  ventriclesGroup: THREE.Group;
  atriaGroup: THREE.Group;
  vesselsGroup: THREE.Group;
  coronaryGroup: THREE.Group;
  hotspotTargets: Map<string, THREE.Object3D>;
  dispose: () => void;
}

/**
 * Computes physiological cardiac cycle phases for a given cycle progress u in [0, 1).
 * Models realistic P-wave (atrial contraction), QRS (ventricular systole + arterial distension),
 * and T-wave / dicrotic diastolic recoil.
 */
export function evaluateCardiacCycle(u: number) {
  const phase = ((u % 1) + 1) % 1;

  // Atrial systole (P wave): peaks around phase 0.10
  const atrialPulse = Math.exp(-Math.pow((phase - 0.1) / 0.055, 2));

  // Primary ventricular contraction (Lub / S1): sharp peak around phase 0.24
  const systole = Math.exp(-Math.pow((phase - 0.24) / 0.065, 2));

  // Secondary rebound / valve closure recoil (Dub / S2): around phase 0.42
  const diastoleRecoil = Math.exp(-Math.pow((phase - 0.42) / 0.055, 2)) * 0.52;

  // Great vessels expand slightly delayed after ventricular ejection
  const arterialPulse =
    Math.exp(-Math.pow((phase - 0.29) / 0.08, 2)) +
    Math.exp(-Math.pow((phase - 0.46) / 0.06, 2)) * 0.35;

  // Normalized ECG voltage for synchronized 2D waveform
  const pWave = 0.14 * Math.exp(-Math.pow((phase - 0.1) / 0.032, 2));
  const qDip = -0.14 * Math.exp(-Math.pow((phase - 0.185) / 0.012, 2));
  const rSpike = 1.0 * Math.exp(-Math.pow((phase - 0.215) / 0.014, 2));
  const sDip = -0.26 * Math.exp(-Math.pow((phase - 0.245) / 0.015, 2));
  const tWave = 0.28 * Math.exp(-Math.pow((phase - 0.39) / 0.048, 2));
  const ecgValue = pWave + qDip + rSpike + sDip + tWave;

  return {
    atrialPulse,
    systole,
    diastoleRecoil,
    arterialPulse,
    ecgValue,
  };
}

function sampleMyocardiumPoint(t: number, phi: number, offset = 0): THREE.Vector3 {
  const y = 0.44 - t * 1.52;
  const tiltFactor = Math.pow(t, 1.25);
  const centerX = 0.34 * tiltFactor;
  const centerZ = 0.14 * Math.sin(t * Math.PI * 0.85);

  let env = Math.sin(Math.pow(t, 0.72) * Math.PI * 0.98);
  if (t <= 0.0001 || t >= 0.9999) env = 0.001;

  const baseRx = 0.76 * Math.pow(1 - t * 0.32, 0.55) * env;
  const baseRz = 0.58 * Math.pow(1 - t * 0.25, 0.55) * env;

  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);

  const lvFullness = 1.0 + 0.16 * Math.max(0, cosP) * (1 - t * 0.4);
  const rvAnteriorBulge =
    1.0 + 0.14 * Math.max(0, -cosP * 0.6 + sinP * 0.8) * (1 - t * 0.55);

  const antSulcusAngle = 1.38 - t * 0.25;
  const dAnt = Math.atan2(Math.sin(phi - antSulcusAngle), Math.cos(phi - antSulcusAngle));
  const antGroove = Math.exp(-Math.pow(dAnt / 0.22, 2)) * 0.11 * Math.sin(t * Math.PI);

  const postSulcusAngle = -1.78 - t * 0.18;
  const dPost = Math.atan2(Math.sin(phi - postSulcusAngle), Math.cos(phi - postSulcusAngle));
  const postGroove = Math.exp(-Math.pow(dPost / 0.24, 2)) * 0.1 * Math.sin(t * Math.PI);

  const muscleRipple =
    0.014 * Math.sin(phi * 5 + t * 8) * Math.sin(t * Math.PI) +
    0.009 * Math.cos(phi * 8 - t * 11) * Math.sin(t * Math.PI);

  const radialMod = lvFullness * rvAnteriorBulge - antGroove - postGroove + muscleRipple;
  const diaphragmaticFlat = sinP < 0 ? 1 - 0.12 * Math.abs(sinP) * (1 - t * 0.4) : 1.0;

  const x = centerX + (baseRx * radialMod + offset) * cosP;
  const z = centerZ + (baseRz * radialMod * diaphragmaticFlat + offset) * sinP;

  return new THREE.Vector3(x, y, z);
}

/**
 * Creates a sculpted anatomical myocardial ventricular cone (Left + Right Ventricles)
 * with realistic anatomical asymmetry, anterior/posterior interventricular sulci,
 * leftward cardiac apex tilt, and rich violet-to-sapphire vertex coloring matching
 * the primary design reference.
 */
function buildVentricularMyocardium(): THREE.BufferGeometry {
  const uSegs = 72; // circumferential
  const vSegs = 56; // base-to-apex
  const geo = new THREE.BufferGeometry();

  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const colorTop = new THREE.Color('#c27814'); // Rich Hodan amber-gold near AV groove
  const colorMid = new THREE.Color('#1f6e7a'); // Hodan architectural slate-teal mid-myocardium
  const colorApex = new THREE.Color('#14b8a6'); // Luminous clinical teal toward apex
  const colorTip = new THREE.Color('#67e8f9'); // Crisp ice-teal specular apex
  const tmpColor = new THREE.Color();

  for (let iv = 0; iv <= vSegs; iv++) {
    const t = iv / vSegs; // 0 = base (top), 1 = apex (bottom)

    for (let iu = 0; iu <= uSegs; iu++) {
      const phi = (iu / uSegs) * Math.PI * 2;
      const pt = sampleMyocardiumPoint(t, phi, 0);

      positions.push(pt.x, pt.y, pt.z);
      uvs.push(iu / uSegs, 1 - t);

      // Hodan Hospital Brand Gradient: Amber-Gold top -> Slate-Teal middle -> Ice-Teal apex
      if (t < 0.35) {
        tmpColor.copy(colorTop).lerp(colorMid, t / 0.35);
      } else if (t < 0.82) {
        tmpColor.copy(colorMid).lerp(colorApex, (t - 0.35) / 0.47);
      } else {
        tmpColor.copy(colorApex).lerp(colorTip, (t - 0.82) / 0.18);
      }
      colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * (uSegs + 1) + iu;
      const b = a + uSegs + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(c, b, d);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates an organic sculpted atrial chamber + auricle mesh.
 */
function buildAtriumChamber(
  rx: number,
  ry: number,
  rz: number,
  scallopStrength: number,
  topHex: string,
  bottomHex: string
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 40, 32);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cTop = new THREE.Color(topHex);
  const cBot = new THREE.Color(bottomHex);
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Scalloped auricular ridges
    const angle = Math.atan2(z, x);
    const ridge = 1 + scallopStrength * Math.sin(angle * 6 + y * 3) * (1 - Math.abs(y) * 0.5);
    // Taper inferiorly where atrium meets AV sulcus
    const taper = y < 0 ? 1 + y * 0.22 : 1.0;

    x *= rx * ridge * taper;
    y *= ry;
    z *= rz * ridge * taper;

    pos.setXYZ(i, x, y, z);

    const mix = THREE.MathUtils.clamp((y / ry + 1) * 0.5, 0, 1);
    tmp.copy(cBot).lerp(cTop, mix);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a tapered anatomical blood vessel along a CatmullRomCurve3 with
 * an optional flared luminal rim (collar) at the open end.
 */
function buildVesselTube(
  points: THREE.Vector3[],
  radiusStart: number,
  radiusEnd: number,
  tubularSegments = 48,
  radialSegments = 24,
  flareTip = true
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(tubularSegments, false);

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const p = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    let r = THREE.MathUtils.lerp(radiusStart, radiusEnd, t);
    if (flareTip && t > 0.9) {
      const flareT = (t - 0.9) / 0.1;
      r *= 1 + Math.sin(flareT * Math.PI * 0.85) * 0.13;
    }

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);

      const nx = cos * N.x + sin * B.x;
      const ny = cos * N.y + sin * B.y;
      const nz = cos * N.z + sin * B.z;

      positions.push(p.x + r * nx, p.y + r * ny, p.z + r * nz);
      uvs.push(j / radialSegments, t);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Projects a series of (t, phi) epicardial coordinates onto the exact sculpted myocardial surface
 * with slight outward offset so coronary vessels hug the heart tightly without clipping.
 */
function buildCoronaryBranch(
  samples: Array<{ t: number; phi: number; offset?: number }>,
  radiusStart: number,
  radiusEnd: number
): THREE.BufferGeometry {
  const pts = samples.map(({ t, phi, offset = 0.016 }) =>
    sampleMyocardiumPoint(t, phi, offset)
  );

  return buildVesselTube(pts, radiusStart, radiusEnd, 36, 10, false);
}

export function createAnatomicalHeart(isSoftwareGl: boolean): HeartAnatomyHandles {
  const root = new THREE.Group();
  const ventriclesGroup = new THREE.Group();
  const atriaGroup = new THREE.Group();
  const vesselsGroup = new THREE.Group();
  const coronaryGroup = new THREE.Group();
  const hotspotTargets = new Map<string, THREE.Object3D>();

  const disposables: Array<{ dispose: () => void }> = [];

  // Shared translucent crystalline materials tuned to Hodan Hospital Slate, Teal & Gold
  const myocardiumMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.14,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    ior: 1.52,
    reflectivity: 0.95,
    sheen: 0.55,
    sheenColor: new THREE.Color('#fde68a'),
    sheenRoughness: 0.35,
    emissive: new THREE.Color('#0f3840'),
    emissiveIntensity: 0.4,
    transmission: isSoftwareGl ? 0 : 0.24,
    thickness: 0.9,
    attenuationColor: new THREE.Color('#14b8a6'),
    attenuationDistance: 1.4,
  });
  disposables.push(myocardiumMat);

  const atriaMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.16,
    metalness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    ior: 1.48,
    sheen: 0.65,
    sheenColor: new THREE.Color('#fcd34d'),
    emissive: new THREE.Color('#273339'),
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.95,
  });
  disposables.push(atriaMat);

  const aortaMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ea9e24'),
    roughness: 0.12,
    metalness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    ior: 1.56,
    sheen: 0.7,
    sheenColor: new THREE.Color('#fef3c7'),
    emissive: new THREE.Color('#78450a'),
    emissiveIntensity: 0.44,
    side: THREE.DoubleSide,
  });
  disposables.push(aortaMat);

  const pulmonaryMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#1f7a88'),
    roughness: 0.14,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    ior: 1.5,
    emissive: new THREE.Color('#0d3b42'),
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide,
  });
  disposables.push(pulmonaryMat);

  const venaCavaMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#34424a'),
    roughness: 0.18,
    metalness: 0.14,
    clearcoat: 0.95,
    clearcoatRoughness: 0.12,
    emissive: new THREE.Color('#152229'),
    emissiveIntensity: 0.38,
    side: THREE.DoubleSide,
  });
  disposables.push(venaCavaMat);

  const coronaryMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#fbbf24'),
    roughness: 0.18,
    metalness: 0.18,
    clearcoat: 1.0,
    emissive: new THREE.Color('#b45309'),
    emissiveIntensity: 0.54,
  });
  disposables.push(coronaryMat);

  const coronaryVeinMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#5eead4'),
    roughness: 0.2,
    metalness: 0.12,
    clearcoat: 0.9,
    emissive: new THREE.Color('#0f766e'),
    emissiveIntensity: 0.44,
  });
  disposables.push(coronaryVeinMat);

  // 1. Primary Sculpted Ventricles (LV + RV)
  const ventriclesGeo = buildVentricularMyocardium();
  disposables.push(ventriclesGeo);
  const ventriclesMesh = new THREE.Mesh(ventriclesGeo, myocardiumMat);
  ventriclesMesh.name = 'ventricles';
  ventriclesGroup.add(ventriclesMesh);

  // 2. Right Atrium & Right Auricle (viewer left / anatomical right)
  const rightAtriumGeo = buildAtriumChamber(0.36, 0.33, 0.32, 0.075, '#d97706', '#2a7a88');
  disposables.push(rightAtriumGeo);
  const rightAtriumMesh = new THREE.Mesh(rightAtriumGeo, atriaMat);
  rightAtriumMesh.position.set(-0.48, 0.44, 0.04);
  rightAtriumMesh.rotation.set(0.15, 0.2, 0.22);
  atriaGroup.add(rightAtriumMesh);

  // Right Auricle appendage wrapping anteriorly
  const rightAuricleGeo = buildAtriumChamber(0.22, 0.17, 0.18, 0.1, '#ea9e24', '#34424a');
  disposables.push(rightAuricleGeo);
  const rightAuricleMesh = new THREE.Mesh(rightAuricleGeo, atriaMat);
  rightAuricleMesh.position.set(-0.34, 0.56, 0.24);
  rightAuricleMesh.rotation.set(0.2, -0.4, -0.3);
  atriaGroup.add(rightAuricleMesh);

  // 3. Left Atrium & Left Auricle (viewer right-posterior / anatomical left)
  const leftAtriumGeo = buildAtriumChamber(0.34, 0.3, 0.31, 0.06, '#ea9e24', '#1f6e7a');
  disposables.push(leftAtriumGeo);
  const leftAtriumMesh = new THREE.Mesh(leftAtriumGeo, atriaMat);
  leftAtriumMesh.position.set(0.32, 0.48, -0.18);
  leftAtriumMesh.rotation.set(-0.1, -0.25, -0.2);
  atriaGroup.add(leftAtriumMesh);

  const leftAuricleGeo = buildAtriumChamber(0.2, 0.15, 0.16, 0.12, '#f59e0b', '#235e69');
  disposables.push(leftAuricleGeo);
  const leftAuricleMesh = new THREE.Mesh(leftAuricleGeo, atriaMat);
  leftAuricleMesh.position.set(0.42, 0.45, 0.16);
  leftAuricleMesh.rotation.set(0.1, 0.5, 0.25);
  atriaGroup.add(leftAuricleMesh);

  // 4. Ascending Aorta, Aortic Arch & Descending Aorta
  const aortaCurve = [
    new THREE.Vector3(-0.04, 0.28, 0.04),
    new THREE.Vector3(-0.08, 0.62, 0.1),
    new THREE.Vector3(-0.04, 0.96, 0.04),
    new THREE.Vector3(0.14, 1.06, -0.12),
    new THREE.Vector3(0.26, 0.82, -0.34),
    new THREE.Vector3(0.2, 0.2, -0.46),
    new THREE.Vector3(0.16, -0.42, -0.44),
  ];
  const aortaGeo = buildVesselTube(aortaCurve, 0.2, 0.15, 56, 26, false);
  disposables.push(aortaGeo);
  const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
  aortaMesh.name = 'aorta';
  vesselsGroup.add(aortaMesh);

  // 3 Superior Aortic Arch Branches (Brachiocephalic, Left Common Carotid, Left Subclavian)
  const branchConfigs = [
    // Brachiocephalic Trunk (rightmost in patient = viewer left)
    {
      pts: [
        new THREE.Vector3(-0.05, 0.96, 0.04),
        new THREE.Vector3(-0.14, 1.18, 0.06),
        new THREE.Vector3(-0.22, 1.38, 0.08),
      ],
      r0: 0.085,
      r1: 0.072,
    },
    // Left Common Carotid Artery (center)
    {
      pts: [
        new THREE.Vector3(0.06, 1.02, -0.04),
        new THREE.Vector3(0.05, 1.24, -0.04),
        new THREE.Vector3(0.04, 1.44, -0.03),
      ],
      r0: 0.068,
      r1: 0.058,
    },
    // Left Subclavian Artery (viewer right)
    {
      pts: [
        new THREE.Vector3(0.16, 0.98, -0.14),
        new THREE.Vector3(0.24, 1.19, -0.14),
        new THREE.Vector3(0.32, 1.36, -0.13),
      ],
      r0: 0.07,
      r1: 0.06,
    },
  ];
  for (const cfg of branchConfigs) {
    const bGeo = buildVesselTube(cfg.pts, cfg.r0, cfg.r1, 24, 20, true);
    disposables.push(bGeo);
    const bMesh = new THREE.Mesh(bGeo, aortaMat);
    vesselsGroup.add(bMesh);
  }

  // 5. Pulmonary Trunk + Left & Right Pulmonary Arteries
  const pulmTrunkGeo = buildVesselTube(
    [
      new THREE.Vector3(-0.18, 0.24, 0.26),
      new THREE.Vector3(-0.14, 0.5, 0.28),
      new THREE.Vector3(0.04, 0.72, 0.16),
      new THREE.Vector3(0.18, 0.76, 0.02),
    ],
    0.17,
    0.14,
    34,
    22,
    false
  );
  disposables.push(pulmTrunkGeo);
  const pulmTrunkMesh = new THREE.Mesh(pulmTrunkGeo, pulmonaryMat);
  vesselsGroup.add(pulmTrunkMesh);

  // Left Pulmonary Artery (sweeping to viewer right)
  const leftPulmGeo = buildVesselTube(
    [
      new THREE.Vector3(0.1, 0.72, 0.08),
      new THREE.Vector3(0.35, 0.73, 0.02),
      new THREE.Vector3(0.62, 0.7, -0.05),
    ],
    0.115,
    0.095,
    24,
    20,
    true
  );
  disposables.push(leftPulmGeo);
  vesselsGroup.add(new THREE.Mesh(leftPulmGeo, pulmonaryMat));

  // Right Pulmonary Artery (passing under aortic arch to viewer left)
  const rightPulmGeo = buildVesselTube(
    [
      new THREE.Vector3(0.06, 0.7, 0.08),
      new THREE.Vector3(-0.22, 0.67, -0.08),
      new THREE.Vector3(-0.56, 0.64, -0.14),
    ],
    0.11,
    0.092,
    24,
    20,
    true
  );
  disposables.push(rightPulmGeo);
  vesselsGroup.add(new THREE.Mesh(rightPulmGeo, pulmonaryMat));

  // 6. Superior & Inferior Vena Cava
  const svcGeo = buildVesselTube(
    [
      new THREE.Vector3(-0.48, 0.45, -0.02),
      new THREE.Vector3(-0.49, 0.82, -0.04),
      new THREE.Vector3(-0.5, 1.18, -0.04),
    ],
    0.145,
    0.125,
    28,
    22,
    true
  );
  disposables.push(svcGeo);
  vesselsGroup.add(new THREE.Mesh(svcGeo, venaCavaMat));

  const ivcGeo = buildVesselTube(
    [
      new THREE.Vector3(-0.46, 0.28, -0.16),
      new THREE.Vector3(-0.48, -0.12, -0.22),
      new THREE.Vector3(-0.48, -0.44, -0.24),
    ],
    0.15,
    0.14,
    22,
    20,
    true
  );
  disposables.push(ivcGeo);
  vesselsGroup.add(new THREE.Mesh(ivcGeo, venaCavaMat));

  // Posterior Pulmonary Veins entering Left Atrium
  const pvConfigs = [
    [new THREE.Vector3(0.34, 0.52, -0.24), new THREE.Vector3(0.64, 0.56, -0.32)],
    [new THREE.Vector3(0.32, 0.38, -0.26), new THREE.Vector3(0.62, 0.34, -0.34)],
    [new THREE.Vector3(0.18, 0.48, -0.26), new THREE.Vector3(-0.18, 0.46, -0.38)],
  ];
  for (const pts of pvConfigs) {
    const pvGeo = buildVesselTube(pts, 0.068, 0.06, 16, 14, true);
    disposables.push(pvGeo);
    vesselsGroup.add(new THREE.Mesh(pvGeo, venaCavaMat));
  }

  // 7. Intricate Coronary Arterial & Venous Network hugging the Myocardium
  // Left Anterior Descending (LAD) Artery down anterior interventricular groove
  const ladGeo = buildCoronaryBranch(
    [
      { t: 0.06, phi: 1.48 },
      { t: 0.22, phi: 1.4 },
      { t: 0.42, phi: 1.32 },
      { t: 0.64, phi: 1.24 },
      { t: 0.84, phi: 1.16 },
      { t: 0.94, phi: 1.1 },
    ],
    0.032,
    0.01
  );
  disposables.push(ladGeo);
  coronaryGroup.add(new THREE.Mesh(ladGeo, coronaryMat));

  // Diagonal Branches off LAD across Left Ventricle
  const diag1 = buildCoronaryBranch(
    [
      { t: 0.24, phi: 1.38 },
      { t: 0.38, phi: 1.04 },
      { t: 0.56, phi: 0.72 },
      { t: 0.74, phi: 0.5 },
    ],
    0.022,
    0.007
  );
  const diag2 = buildCoronaryBranch(
    [
      { t: 0.46, phi: 1.3 },
      { t: 0.6, phi: 0.95 },
      { t: 0.78, phi: 0.68 },
    ],
    0.019,
    0.006
  );
  const diag3 = buildCoronaryBranch(
    [
      { t: 0.62, phi: 1.24 },
      { t: 0.76, phi: 1.56 },
      { t: 0.88, phi: 1.82 },
    ],
    0.016,
    0.005
  );
  disposables.push(diag1, diag2, diag3);
  coronaryGroup.add(
    new THREE.Mesh(diag1, coronaryMat),
    new THREE.Mesh(diag2, coronaryMat),
    new THREE.Mesh(diag3, coronaryMat)
  );

  // Left Circumflex Artery + Obtuse Marginal
  const lcxGeo = buildCoronaryBranch(
    [
      { t: 0.08, phi: 1.15 },
      { t: 0.14, phi: 0.55 },
      { t: 0.22, phi: -0.05 },
      { t: 0.34, phi: -0.65 },
      { t: 0.48, phi: -1.1 },
    ],
    0.028,
    0.009
  );
  const omGeo = buildCoronaryBranch(
    [
      { t: 0.22, phi: -0.05 },
      { t: 0.42, phi: 0.12 },
      { t: 0.64, phi: 0.18 },
      { t: 0.82, phi: 0.22 },
    ],
    0.02,
    0.006
  );
  disposables.push(lcxGeo, omGeo);
  coronaryGroup.add(new THREE.Mesh(lcxGeo, coronaryMat), new THREE.Mesh(omGeo, coronaryMat));

  // Right Coronary Artery (RCA) & Great Cardiac Vein
  const rcaGeo = buildCoronaryBranch(
    [
      { t: 0.1, phi: 1.95 },
      { t: 0.2, phi: 2.38 },
      { t: 0.34, phi: 2.75 },
      { t: 0.52, phi: 2.5 },
      { t: 0.72, phi: 2.15 },
    ],
    0.026,
    0.008
  );
  const greatVeinGeo = buildCoronaryBranch(
    [
      { t: 0.78, phi: 1.1 },
      { t: 0.55, phi: 1.2 },
      { t: 0.32, phi: 1.28 },
      { t: 0.14, phi: 0.9 },
      { t: 0.12, phi: 0.25 },
    ],
    0.011,
    0.024
  );
  disposables.push(rcaGeo, greatVeinGeo);
  coronaryGroup.add(
    new THREE.Mesh(rcaGeo, coronaryMat),
    new THREE.Mesh(greatVeinGeo, coronaryVeinMat)
  );

  // Assemble hierarchical anatomical heart
  ventriclesGroup.add(coronaryGroup);
  root.add(ventriclesGroup);
  root.add(atriaGroup);
  root.add(vesselsGroup);

  // Attach invisible lightweight anchor nodes for 3D-to-2D hotspot projection
  const registerAnchor = (id: string, parent: THREE.Object3D, x: number, y: number, z: number) => {
    const anchor = new THREE.Object3D();
    anchor.position.set(x, y, z);
    parent.add(anchor);
    hotspotTargets.set(id, anchor);
  };
  registerAnchor('aortic-arch', vesselsGroup, 0.04, 1.02, 0.06);
  registerAnchor('mitral-valve', ventriclesGroup, 0.22, -0.22, 0.48);
  registerAnchor('coronary-tree', coronaryGroup, -0.05, 0.02, 0.58);
  registerAnchor('pulmonary-trunk', vesselsGroup, -0.18, 0.5, 0.36);

  // Subtle anatomical poise rotation
  root.rotation.set(0.08, -0.14, 0.04);

  return {
    root,
    ventriclesGroup,
    atriaGroup,
    vesselsGroup,
    coronaryGroup,
    hotspotTargets,
    dispose: () => {
      for (const item of disposables) {
        item.dispose();
      }
    },
  };
}
