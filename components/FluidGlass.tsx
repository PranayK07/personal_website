/* eslint-disable react/no-unknown-property */
'use client';

import * as THREE from 'three';
import { useRef, useEffect, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

interface NavItem {
  label: string;
  link: string;
}

interface FluidGlassProps {
  navItems?: NavItem[];
}

export default function FluidGlass({ navItems = [] }: FluidGlassProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 15 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#0a0a0f']} />
      <ambientLight intensity={0.5} />
      <NavBar navItems={navItems} />
    </Canvas>
  );
}

function NavBar({ navItems }: { navItems: NavItem[] }) {
  const { nodes } = useGLTF('/assets/3d/bar.glb');
  const meshRef = useRef<THREE.Mesh>(null!);
  const buffer = useFBO();
  const { viewport, camera } = useThree();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const { gl } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    // Position at bottom
    const destY = -v.height / 2 + 0.2;
    easing.damp3(meshRef.current.position, [0, destY, 15], 0.15, delta);

    // Auto-scale to fit width
    const geoWidth = 10; // approximate width of bar model
    const maxWorld = v.width * 0.9;
    const desired = maxWorld / geoWidth;
    meshRef.current.scale.setScalar(Math.min(0.15, desired));

    gl.setRenderTarget(buffer);
    gl.render(state.scene, camera);
    gl.setRenderTarget(null);
  });

  const geometry = (nodes.Cube as THREE.Mesh)?.geometry;

  if (!geometry) {
    console.error('Bar geometry not found in GLB file');
    return null;
  }

  return (
    <group>
      {/* Background plane */}
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>

      {/* Glass bar */}
      <mesh
        ref={meshRef}
        scale={0.15}
        rotation-x={Math.PI / 2}
        geometry={geometry}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={1.15}
          transmission={1}
          roughness={0}
          thickness={10}
          chromaticAberration={0.1}
          anisotropy={0.01}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={0.25}
        />
      </mesh>

      {/* Navigation text */}
      <NavItems items={navItems} />
    </group>
  );
}

function NavItems({ items }: { items: NavItem[] }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport, camera } = useThree();

  const getDevice = () => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const DEVICE = {
    mobile: { spacing: 0.2, fontSize: 0.035 },
    tablet: { spacing: 0.24, fontSize: 0.045 },
    desktop: { spacing: 0.3, fontSize: 0.045 }
  };

  const device = getDevice();
  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link: string) => {
    if (!link) return;
    if (link.startsWith('#')) {
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = link;
    }
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          renderOrder={10}
          onClick={e => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

// Preload the model
useGLTF.preload('/assets/3d/bar.glb');
