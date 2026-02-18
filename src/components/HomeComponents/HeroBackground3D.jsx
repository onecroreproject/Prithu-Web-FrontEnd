import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Floating Icon Component - for emojis in 3D space
function FloatingIcon({ emoji, position, speed, scale = 1 }) {
    const mesh = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (mesh.current) {
            mesh.current.position.y = position[1] + Math.sin(time * speed) * 0.5;
            mesh.current.rotation.z = Math.sin(time * 0.5) * 0.2;
        }
    });

    return (
        <Text
            ref={mesh}
            position={position}
            fontSize={scale}
            color="white"
            anchorX="center"
            anchorY="middle"
        >
            {emoji}
        </Text>
    );
}

// Floating Orb Component
function FloatingOrb({ color, position, speed, size = 0.12 }) {
    const mesh = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (mesh.current) {
            mesh.current.position.y = position[1] + Math.sin(time * speed) * 0.3;
            mesh.current.position.x = position[0] + Math.cos(time * speed * 0.5) * 0.2;
        }
    });

    return (
        <mesh ref={mesh} position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
            />
        </mesh>
    );
}

// Particle Field Component with different colors
function ParticleField() {
    const particlesRef = useRef();
    // Further reduced count for maximum stability
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 400 : 800;

    const positions = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;
        }
        return positions;
    }, [count]);

    const colors = useMemo(() => {
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            const hue = Math.random();
            if (hue < 0.33) {
                colors[i] = 0.9; colors[i + 1] = 0.6; colors[i + 2] = 0.1;
            } else if (hue < 0.66) {
                colors[i] = 0.1; colors[i + 1] = 0.4; colors[i + 2] = 0.9;
            } else {
                colors[i] = 0.9; colors[i + 1] = 0.2; colors[i + 2] = 0.5;
            }
        }
        return colors;
    }, [count]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (particlesRef.current) {
            particlesRef.current.rotation.y = time * 0.02;
            particlesRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                vertexColors
                transparent
                opacity={0.7}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

const HeroBackground3D = () => {
    const happyIcons = ["😊", "🥰", "😍", "🤩", "🎉", "✨", "🌟", "💫"];
    const [isRendererActive, setIsRendererActive] = React.useState(true);

    const handleContextLost = (event) => {
        event.preventDefault();
        console.warn("WebGL Context Lost! Falling back to static background.");
        setIsRendererActive(false);
    };

    return (
        <div className="fixed inset-0 z-0 bg-[#fef5d5] pointer-events-none">
            {isRendererActive && (
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 75 }}
                    gl={{
                        alpha: true,
                        antialias: false, // Antialias: false for better performance
                        powerPreference: "high-performance",
                        preserveDrawingBuffer: false
                    }}
                    dpr={[1, 1.5]} // Performance: limit even more to 1.5x dpr
                    onCreated={({ gl }) => {
                        gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
                    }}
                >
                    {/* Use CSS background instead of Three.js background for resilience */}

                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1.2} color="#fbbf24" />
                    <pointLight position={[-10, -10, 5]} intensity={0.6} color="#3b82f6" />

                    <ParticleField />

                    <FloatingOrb color="#f59e0b" position={[-3, 2, 0]} speed={0.4} size={0.15} />
                    <FloatingOrb color="#3b82f6" position={[3, -1, 0]} speed={0.6} size={0.12} />
                    <FloatingOrb color="#ef4444" position={[-2, -2, 0]} speed={0.5} size={0.1} />
                    <FloatingOrb color="#10b981" position={[2, 1, 0]} speed={0.7} size={0.13} />

                    {happyIcons.map((icon, index) => (
                        <FloatingIcon
                            key={index}
                            emoji={icon}
                            position={[
                                (Math.random() - 0.5) * 8,
                                (Math.random() - 0.5) * 6,
                                (Math.random() - 0.5) * 4
                            ]}
                            speed={0.3 + Math.random() * 0.4}
                            scale={0.4 + Math.random() * 0.6}
                        />
                    ))}

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate
                        autoRotateSpeed={0.2}
                    />
                </Canvas>
            )}
        </div>
    );
};

export default HeroBackground3D;
