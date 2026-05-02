import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, Torus } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere({ position, color, speed = 1, distort = 0.4, scale = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.15}
        />
      </Sphere>
    </Float>
  );
}

function FloatingRing({ position, color, scale = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });
  return (
    <Float speed={1.5} floatIntensity={0.5}>
      <Torus ref={meshRef} args={[1, 0.15, 16, 60]} position={position} scale={scale}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.12}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Torus>
    </Float>
  );
}

function ParticleField() {
  const count = 120;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#818cf8" size={0.06} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function Background3D({ intensity = 'full' }) {
  const isLight = intensity === 'light';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[0, 10, -10]} intensity={0.4} color="#06b6d4" />

        <AnimatedSphere position={[-4, 2, -3]} color="#6366f1" speed={0.8} distort={0.5} scale={2.5} />
        <AnimatedSphere position={[4, -2, -4]} color="#8b5cf6" speed={0.6} distort={0.3} scale={2} />
        <AnimatedSphere position={[0, -3, -5]} color="#06b6d4" speed={1} distort={0.6} scale={1.5} />

        {!isLight && (
          <>
            <FloatingRing position={[3, 3, -3]} color="#818cf8" scale={1.5} />
            <FloatingRing position={[-3, -3, -2]} color="#c084fc" scale={1} />
            <ParticleField />
            <Stars radius={80} depth={50} count={800} factor={3} saturation={0.5} fade speed={0.5} />
          </>
        )}
      </Canvas>
    </div>
  );
}
