import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  integrations,
  IntegrationIcon,
  getAccentColor,
  isLightBadge,
} from "./integrations.jsx";

const PAPER_HEX = 0xf3f0e8;
const WIRE_COLOR = new THREE.Color(0x171614);

// Continuous left-to-right carousel flow along the 3D mountain trail.
// VISIBLE_SLOTS keeps badge spacing constant across the trail regardless of roster size,
// while off-stage icons queue seamlessly behind the left ridge.
const INITIAL_SLOT_OFFSET = 0.92;
const VISIBLE_SLOTS = 12.6;
const SLOT_SPEED = 0.42;

// Full-span 3D world waypoints [x, y, z] calibrated to camera (fov 32, y=14.4, z=41, lookAt y=5.6):
// Enters high on the left ridge, dips into the central valley around xFrac ~ 0.43 (Claude),
// glides across the mid-right bench, and crests/recedes over the right shoulder at xFrac ~ 0.90.
const TRAIL_WAYPOINTS = [
  [-62.0, 12.6, -31.0],
  [-48.0, 12.4, -28.0], // ~Sheets   (xFrac ~ 0.10, high left ridge)
  [-34.0, 12.3, -28.0], // ~Slack    (xFrac ~ 0.21, left ridge)
  [-22.5, 10.2, -24.0], // ~Teams    (xFrac ~ 0.30, descending into pass)
  [-14.2, 7.1, -19.5], // ~Webhook  (xFrac ~ 0.35, lower pass)
  [-5.2, 5.2, -16.0], // ~Claude   (xFrac ~ 0.43, valley floor — closest to camera)
  [2.5, 7.0, -19.2], // ~OpenAI   (xFrac ~ 0.51, climbing out of valley)
  [10.8, 8.9, -22.2], // ~Excel    (xFrac ~ 0.58, mid-right bench)
  [20.5, 9.0, -20.2], // ~Gmail    (xFrac ~ 0.67, right shoulder)
  [32.0, 9.2, -19.5], // ~LinkedIn (xFrac ~ 0.78, right shoulder front)
  [43.2, 12.2, -24.8], // right peak climb
  [54.8, 15.2, -33.2], // cresting & receding over right ridge
  [67.0, 15.8, -41.5],
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hash2(x, z) {
  const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return h - Math.floor(h);
}

function quinticNoise(x, z) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
  const v = zf * zf * zf * (zf * (zf * 6 - 15) + 10);

  const a = hash2(xi, zi);
  const b = hash2(xi + 1, zi);
  const c = hash2(xi, zi + 1);
  const d = hash2(xi + 1, zi + 1);

  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x, z, octaves = 4) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i += 1) {
    const rx = x * freq * 0.866 - z * freq * 0.5 + i * 5.3;
    const rz = x * freq * 0.5 + z * freq * 0.866 + i * 2.9;
    sum += amp * quinticNoise(rx, rz);
    freq *= 2.04;
    amp *= 0.5;
  }
  return sum;
}

function ridgedFbm(x, z, octaves = 4) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let weight = 1;
  for (let i = 0; i < octaves; i += 1) {
    const rx = x * freq * 0.82 - z * freq * 0.57 + i * 7.1;
    const rz = x * freq * 0.57 + z * freq * 0.82 + i * 3.7;
    let signal = 1 - Math.abs(quinticNoise(rx, rz) * 2 - 1);
    signal = signal * signal * weight;
    weight = clamp(signal * 1.8, 0.25, 1);
    sum += signal * amp;
    freq *= 2.08;
    amp *= 0.48;
  }
  return sum;
}

function mound(x, z, cx, cz, rx, rz, height, angle = 0) {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const dx = x - cx;
  const dz = z - cz;
  const lx = (dx * cosA + dz * sinA) / rx;
  const lz = (-dx * sinA + dz * cosA) / rz;
  const d2 = lx * lx + lz * lz;
  if (d2 > 9) return 0;
  return height * Math.exp(-d2);
}

// Staggered, branching spurs & mountain ridges across foreground, mid-ground, and horizon
// so contour clusters weave organically without a synthetic straight seam line:
const LANDFORMS = [
  // Foreground rocky hills, benches & diagonal spurs (matching Reference.png's lively foreground)
  [-52, 2, 18, 7.5, 3.2, 0.18],
  [-28, 6, 15, 6.0, 2.6, 0.34],
  [-15, -3, 14, 5.5, 3.1, 0.48], // diagonal spur sweeping from Teams/Webhook toward bottom-center
  [-2, 5, 13, 5.2, 2.4, 0.52],
  [8, 12, 14, 5.5, 2.1, -0.25],
  [24, 3, 16, 6.2, 2.7, -0.32],
  [36, -6, 15, 5.8, 3.6, -0.38], // rocky spur extending forward below LinkedIn
  [54, 4, 19, 7.0, 2.8, -0.15],

  // Staggered mid-ground ridges on the left (multiple overlapping crests instead of one wall)
  [-92, -23, 24, 6.8, 8.6, -0.08],
  [-68, -19, 19, 5.8, 7.4, 0.14],
  [-54, -27, 20, 6.5, 8.2, -0.06],
  [-36, -21, 16, 5.6, 7.2, 0.18],
  [-22, -26, 15, 6.0, 6.2, -0.12],

  // Central valley staggered benches & back-ridges (behind Webhook, Claude, OpenAI, Excel)
  [-6, -15, 13, 6.5, -1.8, 0.05],
  [-9, -24, 14, 4.6, 4.8, 0.12],
  [4, -21, 13, 4.4, 4.4, -0.14],
  [15, -25, 14, 5.0, 5.2, 0.09],

  // Prominent right peak centered at x ~ +37..+43 and tapering right ridges
  [31, -21, 12, 5.2, 6.4, 0.22],
  [40, -28, 15, 6.8, 11.4, -0.16],
  [54, -24, 15, 6.0, 7.8, 0.15],
  [72, -27, 20, 7.2, 6.6, -0.08],
  [92, -30, 24, 8.5, 5.4, 0.05],

  // Distant alpine peaks behind the left ridge & central valley pass
  [-74, -52, 22, 13, 9.6, 0.05],
  [-50, -48, 19, 12, 8.4, -0.09],
  [-24, -52, 21, 14, 10.4, 0.07],
  [-3, -55, 20, 14, 9.8, -0.05],
  [16, -50, 17, 12, 6.8, 0.08],
  [27, -48, 13, 11, -1.8, 0.0], // subtle notch around xFrac ~ 0.68
  [42, -52, 19, 14, 10.2, -0.1],
  [66, -58, 22, 15, 5.2, 0.06], // softer, mistier far-right horizon
];

function terrainHeight(x, z) {
  // Foreground slopes gently toward the camera while keeping natural undulations
  const nearSlope = z > -4 ? -(z + 4) * 0.22 : 0;

  // Gradual rise into the mountain range (no single sharp step-wall across the whole width)
  const mountainRise = smoothstep(4, -32, z) * 6.2 + smoothstep(-32, -66, z) * 3.0;

  // Natural central valley pass & right-center saddle
  const centralPass =
    Math.exp(-Math.pow((x + 3) / 18, 2)) *
    smoothstep(0, -20, z) *
    (1 - smoothstep(-28, -46, z)) *
    2.6;

  let h = -2.0 + nearSlope + mountainRise - centralPass;

  for (let i = 0; i < LANDFORMS.length; i += 1) {
    const [cx, cz, rx, rz, amp, ang] = LANDFORMS[i];
    h += mound(x, z, cx, cz, rx, rz, amp, ang);
  }

  // Anisotropic geological ridge waves (compressed in Z like real faulted strata)
  // create interwoven contour clusters across both foreground foothills and mountain slopes
  const strataRidges = ridgedFbm(x * 0.046 + 3.7, z * 0.082 + 2.1, 4);
  const craggyDetail = ridgedFbm(x * 0.085 + 11.2, z * 0.095 + 6.4, 3);
  const broadRoll = fbm(x * 0.038 + 8.3, z * 0.052 + 4.9, 4) - 0.5;
  const rockFacet =
    (quinticNoise(x * 0.15 + 4.1, z * 0.16 + 7.3) - 0.5) * 1.15;

  const slopeAmp = clamp((h + 5.0) / 13.0, 0.52, 1.32);
  h += (strataRidges - 0.36) * 4.4 * slopeAmp;
  h += (craggyDetail - 0.38) * 1.9 * slopeAmp;
  h += broadRoll * 3.4;
  h += rockFacet * (0.78 + 0.22 * slopeAmp);

  return h;
}

function buildSurveyWireframe(compact) {
  const halfWidth = compact ? 98 : 140;
  const cols = compact ? 96 : 138;
  const rows = compact ? 82 : 110;
  const zNear = 16.5;
  const zFar = -90;

  const stepX = (halfWidth * 2) / cols;

  // Spacious foreground triangles transitioning smoothly into crisp ridge contours
  const zCoords = new Float32Array(rows + 1);
  zCoords[0] = zNear;
  let weightSum = 0;
  const weights = new Float32Array(rows);
  for (let r = 0; r < rows; r += 1) {
    const u = r / rows;
    const fgSpread = 1.35 * Math.exp(-Math.pow(u / 0.22, 2));
    const ridgeDetail = -0.32 * Math.exp(-Math.pow((u - 0.4) / 0.2, 2));
    const farSpread = 0.6 * smoothstep(0.66, 1.0, u);
    const w = Math.max(0.48, 1.0 + fgSpread + ridgeDetail + farSpread);
    weights[r] = w;
    weightSum += w;
  }

  let accum = 0;
  for (let r = 1; r <= rows; r += 1) {
    accum += weights[r - 1];
    zCoords[r] = zNear + (zFar - zNear) * (accum / weightSum);
  }

  const stride = cols + 1;
  const vx = new Float32Array((rows + 1) * stride);
  const vy = new Float32Array((rows + 1) * stride);
  const vz = new Float32Array((rows + 1) * stride);

  for (let r = 0; r <= rows; r += 1) {
    const baseZ = zCoords[r];
    const localStepZ =
      r < rows
        ? Math.abs(zCoords[r + 1] - baseZ)
        : Math.abs(baseZ - zCoords[r - 1]);
    const isEdgeRow = r === 0 || r === rows;

    for (let c = 0; c <= cols; c += 1) {
      const idx = r * stride + c;
      const baseX = -halfWidth + c * stepX;
      const isEdgeCol = c === 0 || c === cols;

      const jx = isEdgeCol
        ? 0
        : (hash2(c * 1.73 + 13.7, r * 2.39 + 5.1) - 0.5) * stepX * 0.26;
      const jz = isEdgeRow
        ? 0
        : (hash2(c * 2.91 + 7.3, r * 1.61 + 19.4) - 0.5) * localStepZ * 0.26;

      const px = baseX + jx;
      const pz = baseZ + jz;

      vx[idx] = px;
      vz[idx] = pz;
      vy[idx] = terrainHeight(px, pz);
    }
  }

  const edgeCount = (rows + 1) * cols + rows * (cols + 1) + rows * cols;
  const positions = new Float32Array(edgeCount * 6);
  let ptr = 0;

  function pushEdge(a, b) {
    positions[ptr] = vx[a];
    positions[ptr + 1] = vy[a];
    positions[ptr + 2] = vz[a];
    positions[ptr + 3] = vx[b];
    positions[ptr + 4] = vy[b];
    positions[ptr + 5] = vz[b];
    ptr += 6;
  }

  for (let r = rows - 1; r >= 0; r -= 1) {
    if (r === rows - 1) {
      for (let c = 0; c < cols; c += 1) {
        pushEdge((r + 1) * stride + c, (r + 1) * stride + c + 1);
      }
    }

    for (let c = 0; c < cols; c += 1) {
      const i00 = r * stride + c;
      const i10 = i00 + 1;
      const i01 = (r + 1) * stride + c;
      const i11 = i01 + 1;

      pushEdge(i00, i10);
      pushEdge(i00, i01);
      if (c === cols - 1) {
        pushEdge(i10, i11);
      }

      pushEdge(i00, i11);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return { geometry, halfWidth, zFar };
}

export default function WireLandscape() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const nodesContainerRef = useRef(null);
  const hoverStateRef = useRef({
    hoveredIndex: -1,
    pointerX: 0,
    pointerY: 0,
    leaveTimestamp: 0,
  });

  function updateStagePointer(event) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    hoverStateRef.current.pointerX = event.clientX - rect.left;
    hoverStateRef.current.pointerY = event.clientY - rect.top;
  }

  function handleBadgeEnter(index, event) {
    updateStagePointer(event);
    hoverStateRef.current.hoveredIndex = index;
    hoverStateRef.current.leaveTimestamp = 0;
  }

  function handleBadgeMove(index, event) {
    updateStagePointer(event);
    hoverStateRef.current.hoveredIndex = index;
  }

  function handleBadgeLeave(index) {
    if (hoverStateRef.current.hoveredIndex === index) {
      hoverStateRef.current.hoveredIndex = -1;
      hoverStateRef.current.leaveTimestamp = performance.now();
    }
  }

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const nodesContainer = nodesContainerRef.current;
    if (!stage || !canvas || !nodesContainer) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const compact = window.innerWidth < 768;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PAPER_HEX);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 280);
    const baseCamX = 0;
    const baseCamY = compact ? 15.6 : 14.6;
    const baseCamZ = compact ? 44 : 41;
    const lookTarget = new THREE.Vector3(0, compact ? 5.9 : 5.7, -26);
    camera.position.set(baseCamX, baseCamY, baseCamZ);
    camera.lookAt(lookTarget);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const { geometry: wireGeometry, halfWidth, zFar } =
      buildSurveyWireframe(compact);

    const wireMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uColor: { value: WIRE_COLOR },
        uBaseOpacity: { value: 0.46 },
        uFarZ: { value: zFar },
        uHalfWidth: { value: halfWidth },
      },
      vertexShader: `
        varying float vAlpha;
        uniform float uBaseOpacity;
        uniform float uFarZ;
        uniform float uHalfWidth;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = -mvPosition.z;

          // Extra soft mist on the far-right distant horizon matching Reference.png
          float rightHorizonMist = smoothstep(42.0, 88.0, position.x) * smoothstep(-36.0, -58.0, position.z);
          float farDist = mix(120.0, 96.0, rightHorizonMist);

          float depthFade = 1.0 - smoothstep(50.0, farDist, dist);
          depthFade = pow(max(depthFade, 0.0), 1.28);

          float backFade = smoothstep(uFarZ, uFarZ + 16.0, position.z);
          float sideFade = 1.0 - smoothstep(uHalfWidth - 10.0, uHalfWidth, abs(position.x));

          vAlpha = uBaseOpacity * depthFade * backFade * sideFade;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          if (vAlpha <= 0.004) discard;
          gl_FragColor = vec4(uColor, vAlpha);
        }
      `,
    });

    const wireMesh = new THREE.LineSegments(wireGeometry, wireMaterial);
    wireMesh.frustumCulled = false;
    scene.add(wireMesh);

    const xScale = compact ? 0.62 : 1;
    const controlPoints = TRAIL_WAYPOINTS.map(
      ([x, y, z]) => new THREE.Vector3(x * xScale, y, z),
    );

    const trailCurve = new THREE.CatmullRomCurve3(
      controlPoints,
      false,
      "catmullrom",
      0.5,
    );
    const trailSamples = trailCurve.getPoints(720);

    const cumulative = new Float32Array(trailSamples.length);
    let totalLength = 0;
    for (let i = 1; i < trailSamples.length; i += 1) {
      totalLength += trailSamples[i].distanceTo(trailSamples[i - 1]);
      cumulative[i] = totalLength;
    }

    const sampled = new THREE.Vector3();
    function pointAlongTrail(u) {
      const target = clamp(u, 0, 1) * totalLength;
      let low = 0;
      let high = cumulative.length - 1;

      while (low < high - 1) {
        const mid = (low + high) >> 1;
        if (cumulative[mid] <= target) {
          low = mid;
        } else {
          high = mid;
        }
      }

      const span = cumulative[high] - cumulative[low] || 1;
      const t = (target - cumulative[low]) / span;
      return sampled.lerpVectors(trailSamples[low], trailSamples[high], t);
    }

    const projected = new THREE.Vector3();
    let width = 1;
    let height = 1;
    let slotOffset = INITIAL_SLOT_OFFSET;
    let speedMix = 1;

    const maxNodes = 32;
    const boostMix = new Float32Array(maxNodes);
    const labelMix = new Float32Array(maxNodes);
    const screenXs = new Float32Array(maxNodes);
    const screenYs = new Float32Array(maxNodes);
    const baseScales = new Float32Array(maxNodes);
    const baseOpacities = new Float32Array(maxNodes);
    const distances = new Float32Array(maxNodes);
    const isVisibleArr = new Uint8Array(maxNodes);

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    function onPointerMove(event) {
      if (reduceMotion || compact) return;
      const nx = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      targetParallaxX = clamp(nx, -1, 1) * 0.65;
      targetParallaxY = clamp(-ny, -1, 1) * 0.25;
    }

    function updateCarouselNodes(dt = 0) {
      camera.updateMatrixWorld();
      const elements = nodesContainer.children;
      const count = Math.min(elements.length, maxNodes);
      if (!count) return;

      // Pass 1: compute 3D projected positions and base visibility for all nodes
      for (let i = 0; i < count; i += 1) {
        const slotPos = (((i + slotOffset) % count) + count) % count;
        if (slotPos > VISIBLE_SLOTS) {
          isVisibleArr[i] = 0;
          baseOpacities[i] = 0;
          continue;
        }

        const curveU = slotPos / VISIBLE_SLOTS;
        const point = pointAlongTrail(curveU);
        const distance = camera.position.distanceTo(point);

        projected.copy(point).project(camera);

        const normX = projected.x * 0.5 + 0.5;
        const normY = -projected.y * 0.5 + 0.5;
        screenXs[i] = normX * width;
        screenYs[i] = normY * height;
        distances[i] = distance;
        baseScales[i] = clamp(1.67 - distance * 0.0102, 0.76, 1.09);

        const enterFade = smoothstep(0.01, 0.1, curveU);
        const exitFade = 1 - smoothstep(0.87, 0.97, curveU);
        const edgeFade =
          smoothstep(0.02, 0.08, normX) * (1 - smoothstep(0.91, 0.97, normX));
        const opacity = enterFade * exitFade * edgeFade;
        const visible = projected.z < 1 && opacity > 0.015;

        isVisibleArr[i] = visible ? 1 : 0;
        baseOpacities[i] = visible ? opacity : 0;
      }

      // Pass 2: if a visible icon is hovered, find the nearest 3 visible icons (hovered + 2 closest neighbors)
      let hoveredIdx = hoverStateRef.current.hoveredIndex;
      if (hoveredIdx >= count || hoveredIdx < 0 || !isVisibleArr[hoveredIdx]) {
        hoveredIdx = -1;
      }

      let near1 = -1;
      let near2 = -1;
      if (hoveredIdx !== -1) {
        const refX = screenXs[hoveredIdx];
        const refY = screenYs[hoveredIdx];
        let bestDist1 = Infinity;
        let bestDist2 = Infinity;

        for (let i = 0; i < count; i += 1) {
          if (i === hoveredIdx || !isVisibleArr[i] || baseOpacities[i] < 0.12) {
            continue;
          }
          const dx = screenXs[i] - refX;
          const dy = (screenYs[i] - refY) * 0.65;
          const d2 = dx * dx + dy * dy;
          if (d2 < bestDist1) {
            bestDist2 = bestDist1;
            near2 = near1;
            bestDist1 = d2;
            near1 = i;
          } else if (d2 < bestDist2) {
            bestDist2 = d2;
            near2 = i;
          }
        }
      }

      const lerpRate = dt > 0 ? 1 - Math.exp(-dt * 14) : 1;

      // Pass 3: apply transforms, enlargement, z-ordering, and nearest-3 labels
      for (let i = 0; i < count; i += 1) {
        const element = elements[i];
        const badgeEl = element.firstElementChild;
        const labelEl = element.lastElementChild;

        if (!isVisibleArr[i]) {
          boostMix[i] = 0;
          labelMix[i] = 0;
          element.style.opacity = "0";
          element.style.visibility = "hidden";
          if (labelEl) labelEl.style.opacity = "0";
          if (badgeEl) badgeEl.removeAttribute("data-active");
          continue;
        }

        const isPrimary = i === hoveredIdx;
        const isNeighbor = i === near1 || i === near2;
        const targetBoost = isPrimary ? 0.24 : isNeighbor ? 0.11 : 0;
        const targetLabel = isPrimary || isNeighbor ? 1 : 0;

        boostMix[i] += (targetBoost - boostMix[i]) * lerpRate;
        labelMix[i] += (targetLabel - labelMix[i]) * lerpRate;
        if (Math.abs(boostMix[i] - targetBoost) < 0.001) boostMix[i] = targetBoost;
        if (Math.abs(labelMix[i] - targetLabel) < 0.001) labelMix[i] = targetLabel;

        const totalScale = baseScales[i] * (1 + boostMix[i]);
        const opacity = isPrimary || isNeighbor
          ? Math.max(baseOpacities[i], 0.96)
          : baseOpacities[i];
        const zBoost = isPrimary ? 300 : isNeighbor ? 200 : 0;

        element.style.left = `${screenXs[i]}px`;
        element.style.top = `${screenYs[i]}px`;
        element.style.transform = `translate(-50%, -50%) scale(${totalScale.toFixed(3)})`;
        element.style.opacity = opacity.toFixed(3);
        element.style.visibility = "visible";
        element.style.zIndex = String(Math.round(500 - distances[i] * 4 + zBoost));

        if (badgeEl) {
          if (isPrimary) {
            badgeEl.setAttribute("data-active", "true");
          } else {
            badgeEl.removeAttribute("data-active");
          }
        }

        if (labelEl) {
          const lMix = labelMix[i];
          if (lMix > 0.01) {
            const invScale = 1 / totalScale;
            const slideY = (1 - lMix) * -4;
            labelEl.style.opacity = lMix.toFixed(3);
            labelEl.style.transform = `translateX(-50%) translateY(${slideY.toFixed(2)}px) scale(${invScale.toFixed(3)})`;
            if (isPrimary) {
              labelEl.setAttribute("data-primary", "true");
            } else {
              labelEl.removeAttribute("data-primary");
            }
          } else {
            labelEl.style.opacity = "0";
            labelEl.removeAttribute("data-primary");
          }
        }
      }
    }

    function sizeRenderer() {
      width = stage.clientWidth || 1;
      height = stage.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    }

    sizeRenderer();
    updateCarouselNodes();
    renderer.render(scene, camera);

    let frame = 0;
    let last = performance.now();

    function animate(now) {
      frame = requestAnimationFrame(animate);
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (document.hidden) return;

      const isHovering =
        hoverStateRef.current.hoveredIndex !== -1 ||
        (hoverStateRef.current.leaveTimestamp > 0 &&
          now - hoverStateRef.current.leaveTimestamp < 90);
      const targetSpeedMix = isHovering ? 0 : 1;
      const speedRate = 1 - Math.exp(-delta * (isHovering ? 24 : 9));
      speedMix += (targetSpeedMix - speedMix) * speedRate;
      if (Math.abs(speedMix - targetSpeedMix) < 0.001) speedMix = targetSpeedMix;

      const activeCount = nodesContainer.children.length || 1;
      slotOffset = (slotOffset + delta * SLOT_SPEED * speedMix) % activeCount;

      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.045;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.045;
      camera.position.set(
        baseCamX + currentParallaxX,
        baseCamY + currentParallaxY,
        baseCamZ,
      );
      camera.lookAt(lookTarget);

      updateCarouselNodes(delta);
      renderer.render(scene, camera);
    }

    if (!reduceMotion) {
      frame = requestAnimationFrame(animate);
    }

    let resizeFrame = 0;
    function onResize() {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        sizeRenderer();
        updateCarouselNodes();
        renderer.render(scene, camera);
      });
    }

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      wireGeometry.dispose();
      wireMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative -mt-2 w-full sm:-mt-4">
      <div
        ref={stageRef}
        className="relative h-[410px] w-full overflow-hidden sm:h-[450px] lg:h-[490px]"
        role="img"
        aria-label="A 3D wireframe mountain landscape with integration icons flowing continuously along a winding valley and ridge trail."
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        <div
          ref={nodesContainerRef}
          className="pointer-events-none absolute inset-0 z-20"
        >
          {integrations.map((item, index) => (
            <div key={item.name} className="wire-node">
              <span
                className="wire-badge"
                onPointerEnter={(event) => handleBadgeEnter(index, event)}
                onPointerMove={(event) => handleBadgeMove(index, event)}
                onPointerLeave={() => handleBadgeLeave(index)}
                style={{
                  "--badge-color": getAccentColor(item.name),
                  ...(isLightBadge(item.name)
                    ? {
                        backgroundColor: "#ffffff",
                        outline: "1px solid rgb(23 23 22 / 0.09)",
                      }
                    : null),
                }}
              >
                <IntegrationIcon name={item.name} />
              </span>
              <span className="wire-label" aria-hidden="true">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-paper to-transparent"
          aria-hidden="true"
        />
      </div>

      <ul className="sr-only">
        {integrations.map((item) => (
          <li key={item.name}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}
