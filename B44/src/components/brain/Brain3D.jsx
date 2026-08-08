import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// Brain regions with 3D positions mapped roughly to real anatomy
const REGIONS_3D = [
  {
    id: "left_amygdala",
    label: "Amygdala",
    // medial temporal lobe, lower-left
    position: new THREE.Vector3(-1.1, -0.55, 0.3),
    radius: 0.32,
    baseColor: new THREE.Color("#e0b4b4"),
  },
  {
    id: "left_cerebellar_exterior",
    label: "Cerebellar ext.",
    // posterior-inferior, left
    position: new THREE.Vector3(-0.85, -1.1, -1.0),
    radius: 0.48,
    baseColor: new THREE.Color("#d4c9b0"),
  },
  {
    id: "splenium_corpus_callosum_md",
    label: "Splenium CC",
    // posterior midline, slightly superior
    position: new THREE.Vector3(0.0, 0.1, -0.65),
    radius: 0.38,
    baseColor: new THREE.Color("#b8cce0"),
  },
  {
    id: "paracentral_volume",
    label: "Paracentral",
    // superior midline, slightly posterior
    position: new THREE.Vector3(-0.25, 1.05, -0.2),
    radius: 0.34,
    baseColor: new THREE.Color("#b0d4b8"),
  },
  {
    id: "superior_fronto_occipital_fasciculus_axd",
    label: "SFOF AxD",
    // white matter tract — superior-frontal, left
    position: new THREE.Vector3(-0.9, 0.6, 0.8),
    radius: 0.36,
    baseColor: new THREE.Color("#c8b8d8"),
  },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function colorForValue(v) {
  const t = Math.max(0, Math.min(1, (v - -1) / 2));
  if (t < 0.5) {
    const k = t / 0.5;
    return new THREE.Color(
      lerp(0.86, 0.96, k),
      lerp(0.15, 0.96, k),
      lerp(0.15, 0.96, k)
    );
  }
  const k = (t - 0.5) / 0.5;
  return new THREE.Color(
    lerp(0.96, 0.15, k),
    lerp(0.96, 0.39, k),
    lerp(0.96, 0.92, k)
  );
}

export default function Brain3D({ nodes, metric, selectedRoi, onSelectRoi }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const brainGroupRef = useRef(null);
  const regionMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2(-999, -999));
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.1, y: 0.4 });
  const autoRotateRef = useRef(true);
  const hoveredRef = useRef(null);
  const animFrameRef = useRef(null);

  const [hoveredRoi, setHoveredRoi] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, label: "", value: "" });

  // Build procedural brain geometry with sulci detail
  function buildBrainMesh() {
    const group = new THREE.Group();

    // Main brain body — oblate spheroid
    const brainGeo = new THREE.SphereGeometry(1.25, 64, 48);
    const positions = brainGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Flatten slightly on sides, elongate front-back
      const nx = x * 0.92;
      const ny = y * 0.85;
      const nz = z * 1.15;

      // Indent bottom (brain stem area)
      const bottomFlatten = Math.max(0, -y / 1.25);
      const stemIndent = bottomFlatten * bottomFlatten * 0.25;

      // Add gyri/sulci using multiple noise octaves
      const noise1 = Math.sin(x * 8.2 + 1.1) * Math.cos(z * 7.8 + 0.5) * Math.sin(y * 6.5 + 2.1) * 0.045;
      const noise2 = Math.sin(x * 14.5 + 0.3) * Math.cos(z * 12.1 + 1.7) * Math.sin(y * 10.8 + 0.8) * 0.025;
      const noise3 = Math.sin(x * 22.0 + 2.3) * Math.cos(z * 19.5 + 0.9) * Math.sin(y * 17.2 + 1.5) * 0.012;
      const totalNoise = noise1 + noise2 + noise3;

      // Longitudinal fissure — central crease top
      const longFissure = Math.exp(-x * x * 18) * Math.max(0, y / 1.25) * 0.15;

      // Sylvian fissure — lateral groove
      const sylvianLeft = Math.exp(-(x + 0.5) * (x + 0.5) * 5 - (y - 0.0) * (y - 0.0) * 8) * 0.10;

      const r = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (r > 0.001) {
        const scale = 1 + totalNoise - longFissure * 0.5 - stemIndent;
        positions.setXYZ(i, nx * scale, ny * scale - stemIndent * 0.4, nz * scale);
      }
    }
    brainGeo.computeVertexNormals();

    const brainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e8ddd0"),
      roughness: 0.78,
      metalness: 0.02,
      side: THREE.FrontSide,
    });

    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    group.add(brainMesh);

    // Cerebellum — back-bottom
    const cerebGeo = new THREE.SphereGeometry(0.55, 32, 24);
    const cerebPos = cerebGeo.attributes.position;
    for (let i = 0; i < cerebPos.count; i++) {
      const x = cerebPos.getX(i);
      const y = cerebPos.getY(i);
      const z = cerebPos.getZ(i);
      const n1 = Math.sin(x * 12 + y * 8) * 0.04;
      const n2 = Math.cos(z * 15 + x * 10) * 0.025;
      cerebPos.setXYZ(i, x + n1, y + n2, z + n1 * 0.5);
    }
    cerebGeo.computeVertexNormals();
    const cerebMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e0d5c5"),
      roughness: 0.82,
      metalness: 0.01,
    });
    const cerebMesh = new THREE.Mesh(cerebGeo, cerebMat);
    cerebMesh.position.set(0, -1.05, -1.0);
    cerebMesh.scale.set(1.3, 0.75, 0.85);
    group.add(cerebMesh);

    // Brain stem
    const stemGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.65, 16);
    const stemMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d8cfc0"),
      roughness: 0.85,
      metalness: 0.0,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.set(0, -1.4, -0.2);
    stemMesh.rotation.x = -0.25;
    group.add(stemMesh);

    return group;
  }

  function buildRegionSpheres() {
    const meshes = [];
    REGIONS_3D.forEach((region) => {
      const geo = new THREE.SphereGeometry(region.radius, 24, 18);
      const mat = new THREE.MeshStandardMaterial({
        color: region.baseColor.clone(),
        roughness: 0.55,
        metalness: 0.08,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(region.position);
      mesh.userData = { regionId: region.id, label: region.label, baseColor: region.baseColor.clone() };
      meshes.push(mesh);
    });
    return meshes;
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 50);
    camera.position.set(0, 0.4, 5.5);
    cameraRef.current = camera;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.4);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.5);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.3);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    // Brain group
    const brainGroup = new THREE.Group();
    brainGroupRef.current = brainGroup;
    scene.add(brainGroup);

    const brainMesh = buildBrainMesh();
    brainGroup.add(brainMesh);

    const regionMeshes = buildRegionSpheres();
    regionMeshes.forEach((m) => brainGroup.add(m));
    regionMeshesRef.current = regionMeshes;

    // Subtle pulse animation per region
    regionMeshes.forEach((m, i) => {
      m.userData.phaseOffset = i * 1.3;
    });

    // Grid / environment subtle fog
    scene.fog = new THREE.FogExp2(0xf7f4ee, 0.04);

    // Animation loop
    let clock = new THREE.Clock();
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Auto-rotate
      if (autoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current.y += 0.003;
      }
      brainGroup.rotation.x = rotationRef.current.x;
      brainGroup.rotation.y = rotationRef.current.y;

      // Pulse selected region
      regionMeshesRef.current.forEach((m) => {
        const isSelected = m.userData.regionId === selectedRoi;
        const isHovered = m.userData.regionId === hoveredRef.current;
        const pulse = isSelected
          ? 1 + Math.sin(elapsed * 3 + m.userData.phaseOffset) * 0.06
          : isHovered
          ? 1.08
          : 1.0;
        m.scale.setScalar(pulse);
        m.material.opacity = isSelected ? 0.95 : isHovered ? 0.92 : 0.75;
        m.material.emissive = isSelected
          ? new THREE.Color(0.15, 0.15, 0.05)
          : new THREE.Color(0, 0, 0);
        m.material.emissiveIntensity = isSelected ? 0.3 : 0;
      });

      // Hover detection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(regionMeshesRef.current);
      const newHovered = hits.length > 0 ? hits[0].object.userData.regionId : null;
      if (newHovered !== hoveredRef.current) {
        hoveredRef.current = newHovered;
        setHoveredRoi(newHovered);
        mount.style.cursor = newHovered ? "pointer" : "grab";
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update region colors when metric changes
  useEffect(() => {
    regionMeshesRef.current.forEach((mesh) => {
      const node = nodes.find((n) => n.roi === mesh.userData.regionId);
      if (node) {
        const col = colorForValue(node[metric] ?? 0);
        mesh.material.color.copy(col);
      }
    });
  }, [metric, nodes]);

  // Mouse events
  const handleMouseMove = useCallback((e) => {
    const rect = mountRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    if (isDraggingRef.current) {
      autoRotateRef.current = false;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      rotationRef.current.y += dx * 0.008;
      rotationRef.current.x += dy * 0.006;
      rotationRef.current.x = Math.max(-1.0, Math.min(1.0, rotationRef.current.x));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    }

    // Tooltip
    if (hoveredRef.current) {
      const node = nodes.find((n) => n.roi === hoveredRef.current);
      const region = REGIONS_3D.find((r) => r.id === hoveredRef.current);
      const val = node ? node[metric] : 0;
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 10,
        label: region?.label || hoveredRef.current,
        value: (val > 0 ? "+" : "") + (val ?? 0).toFixed(2),
      });
    } else {
      setTooltip((t) => ({ ...t, visible: false }));
    }
  }, [nodes, metric]);

  const handleMouseDown = useCallback((e) => {
    isDraggingRef.current = true;
    autoRotateRef.current = false;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    mountRef.current.style.cursor = "grabbing";
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const dx = Math.abs(e.clientX - prevMouseRef.current.x);
    const dy = Math.abs(e.clientY - prevMouseRef.current.y);
    // If barely moved, treat as click
    if (dx < 4 && dy < 4 && hoveredRef.current) {
      onSelectRoi(hoveredRef.current);
    }
    isDraggingRef.current = false;
    mountRef.current.style.cursor = hoveredRef.current ? "pointer" : "grab";
  }, [onSelectRoi]);

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    mouseRef.current.set(-999, -999);
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (isDraggingRef.current && e.touches.length === 1) {
      const dx = e.touches[0].clientX - prevMouseRef.current.x;
      const dy = e.touches[0].clientY - prevMouseRef.current.y;
      rotationRef.current.y += dx * 0.008;
      rotationRef.current.x += dy * 0.006;
      rotationRef.current.x = Math.max(-1.0, Math.min(1.0, rotationRef.current.x));
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleDoubleClick = useCallback(() => {
    autoRotateRef.current = true;
  }, []);

  return (
    <div className="relative w-full" style={{ height: 400 }}>
      <div
        ref={mountRef}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f0ece4 0%, #e8e0d4 100%)", cursor: "grab" }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      />

      {/* Hover Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none bg-stone-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg z-10"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 30,
            transform: "translateY(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <span className="font-semibold">{tooltip.label}</span>
          <span className="ml-2 opacity-75">{tooltip.value}</span>
        </div>
      )}

      {/* Region legend overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {REGIONS_3D.map((r) => {
          const node = nodes.find((n) => n.roi === r.id);
          const val = node ? node[metric] : 0;
          const col = colorForValue(val);
          const isSelected = selectedRoi === r.id;
          const isHov = hoveredRoi === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRoi(r.id)}
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all ${
                isSelected
                  ? "bg-stone-900 text-white shadow-md"
                  : isHov
                  ? "bg-stone-800/80 text-white"
                  : "bg-white/70 text-stone-700 hover:bg-white/90"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/50"
                style={{ background: `rgb(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)})` }}
              />
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-2 right-3 text-xs text-stone-400 pointer-events-none">
        Drag to rotate · Click region to select · Double-click to resume auto-rotate
      </div>
    </div>
  );
}
