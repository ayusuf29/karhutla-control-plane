"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface PeatDomeVisualizer3DProps {
  peatDepthMeters: number;
  gwlCm: number;
  riskCategory: string;
}

export default function PeatDomeVisualizer3D({
  peatDepthMeters,
  gwlCm,
  riskCategory,
}: PeatDomeVisualizer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = 180;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d121f");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.5, 2.8, 4.2);
    camera.lookAt(0, -0.2, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 3. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(5, 8, 4);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    // 4. Layer 2: Organic Peat Dome Subsurface (Dark Peat Layer)
    // Scale height based on peat depth (0.8m to 5.0m normalized to 0.4 to 1.5 height)
    const normalizedPeatHeight = Math.max(0.4, Math.min(1.6, (peatDepthMeters / 4.0) * 1.2));
    const peatGeo = new THREE.BoxGeometry(2.4, normalizedPeatHeight, 2.4);
    const peatMat = new THREE.MeshStandardMaterial({
      color: 0x271911, // Dark organic peat
      roughness: 0.85,
      metalness: 0.1,
    });
    const peatMesh = new THREE.Mesh(peatGeo, peatMat);
    peatMesh.position.y = -normalizedPeatHeight / 2;
    group.add(peatMesh);

    // Peat layer wireframe edges for high-tech HUD feeling
    const peatEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(peatGeo),
      new THREE.LineBasicMaterial({ color: 0x4a3224, linewidth: 1 })
    );
    peatMesh.add(peatEdges);

    // 5. Layer 1: Surface Vegetation / Canopy Grid
    const surfaceGeo = new THREE.PlaneGeometry(2.4, 2.4, 8, 8);
    const surfaceMat = new THREE.MeshBasicMaterial({
      color: riskCategory === "EXTREME" ? 0xef4444 : riskCategory === "HIGH" ? 0xf97316 : 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.rotation.x = -Math.PI / 2;
    surfaceMesh.position.y = 0.01;
    group.add(surfaceMesh);

    // 6. Layer 3: Ground Water Table Plane (GWL cm)
    // Position depends on gwlCm (-15cm to -65cm normalized into peat layer)
    // Surface is at y=0, bottom of peat is at -normalizedPeatHeight
    const gwlRatio = Math.max(0.05, Math.min(0.95, Math.abs(gwlCm) / 70.0));
    const waterY = -(gwlRatio * normalizedPeatHeight);

    const waterGeo = new THREE.PlaneGeometry(2.42, 2.42);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan-blue water plane
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = waterY;
    group.add(waterMesh);

    // Subtle water perimeter contour
    const waterEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.42, 0.02, 2.42));
    const waterEdgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
    const waterEdge = new THREE.LineSegments(waterEdgeGeo, waterEdgeMat);
    waterEdge.position.y = waterY;
    group.add(waterEdge);

    // Subtle Grid Base for Command Center Reference
    const gridHelper = new THREE.GridHelper(3.6, 12, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -normalizedPeatHeight - 0.1;
    group.add(gridHelper);

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      group.rotation.y += 0.005; // Slow ambient orbit
      renderer.render(scene, camera);
    };
    animate();

    // 8. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      peatGeo.dispose();
      peatMat.dispose();
      surfaceGeo.dispose();
      surfaceMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [peatDepthMeters, gwlCm, riskCategory]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-sentinel-border bg-obsidian-surface/60">
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-obsidian/80 backdrop-blur border border-white/10 text-[10px] font-mono text-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan animate-pulse" />
        PROFIL 3D KUBAH GAMBUT & GWL
      </div>
      <div className="absolute bottom-2 right-2 z-10 flex flex-col items-end gap-0.5 text-[9px] font-mono text-slate-400 bg-obsidian/75 px-1.5 py-1 rounded border border-white/5">
        <div>Muka Air (GWL): <span className="text-sentinel-cyan tabular-nums font-semibold">{gwlCm} cm</span></div>
        <div>Kedalaman Gambut: <span className="text-amber-400 tabular-nums font-semibold">{peatDepthMeters} m</span></div>
      </div>
      <div ref={containerRef} className="w-full h-[180px]" />
    </div>
  );
}
