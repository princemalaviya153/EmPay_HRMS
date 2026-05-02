import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Box, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

function Particles({ count = 120 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);
  useFrame(({ clock }) => {
    if (mesh.current) mesh.current.rotation.y = clock.getElapsedTime() * 0.03;
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a78bfa" transparent opacity={0.7} />
    </points>
  );
}

function FloatingSphere({ position, color, scale = 1, speed = 1, distort = 0.4 }) {
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5} position={position}>
      <Sphere args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial color={color} distort={distort} speed={2} transparent opacity={0.15} roughness={0} metalness={0.8} />
      </Sphere>
    </Float>
  );
}

function FloatingTorus({ position, color, scale = 1, speed = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.4 * speed;
      ref.current.rotation.y = clock.getElapsedTime() * 0.3 * speed;
    }
  });
  return (
    <Float speed={speed} floatIntensity={1} position={position}>
      <Torus ref={ref} args={[1, 0.3, 16, 100]} scale={scale}>
        <meshStandardMaterial color={color} transparent opacity={0.2} roughness={0.1} metalness={0.9} wireframe />
      </Torus>
    </Float>
  );
}

function FloatingOcta({ position, color, scale = 1, speed = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.5 * speed;
      ref.current.rotation.z = clock.getElapsedTime() * 0.3 * speed;
    }
  });
  return (
    <Float speed={speed} floatIntensity={2} position={position}>
      <Octahedron ref={ref} args={[1, 0]} scale={scale}>
        <meshStandardMaterial color={color} transparent opacity={0.25} roughness={0} metalness={1} wireframe />
      </Octahedron>
    </Float>
  );
}

function FloatingBox({ position, color, scale = 1, speed = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.3 * speed;
      ref.current.rotation.y = clock.getElapsedTime() * 0.4 * speed;
    }
  });
  return (
    <Float speed={speed} floatIntensity={1.5} position={position}>
      <Box ref={ref} args={[1, 1, 1]} scale={scale}>
        <meshStandardMaterial color={color} transparent opacity={0.2} roughness={0} metalness={0.8} wireframe />
      </Box>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#7c3aed" />
      <pointLight position={[-5, -5, -5]} intensity={1.5} color="#4f46e5" />
      <pointLight position={[0, 5, -5]} intensity={1} color="#a855f7" />

      <Particles />

      <FloatingSphere position={[-4, 2, -3]} color="#7c3aed" scale={1.8} speed={0.8} distort={0.5} />
      <FloatingSphere position={[4, -2, -4]} color="#4f46e5" scale={1.4} speed={1.2} distort={0.3} />
      <FloatingSphere position={[2, 3, -5]} color="#a855f7" scale={1} speed={0.6} distort={0.6} />

      <FloatingTorus position={[-3, -2, -3]} color="#818cf8" scale={0.9} speed={0.7} />
      <FloatingTorus position={[5, 1, -5]} color="#c084fc" scale={0.7} speed={1.1} />

      <FloatingOcta position={[3, -3, -3]} color="#7c3aed" scale={0.8} speed={0.9} />
      <FloatingOcta position={[-5, 1, -6]} color="#a78bfa" scale={1.1} speed={0.6} />

      <FloatingBox position={[0, -4, -4]} color="#6366f1" scale={0.7} speed={0.8} />
      <FloatingBox position={[-2, 4, -5]} color="#8b5cf6" scale={0.6} speed={1.3} />
    </>
  );
}

export default function AuthBackground3D() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, #0a0118 0%, #0d0221 30%, #0f0527 60%, #080115 100%)' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
