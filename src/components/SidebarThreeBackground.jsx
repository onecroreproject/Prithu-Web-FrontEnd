import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'three/examples/jsm/utils/BufferGeometryUtils.js'; // This might not be needed if we generate manually

const Particles = (props) => {
    const ref = useRef();

    // Generate random points
    const [positions, colors] = useMemo(() => {
        const count = 500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;     // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5;  // z

            // Vibrant colors (blue/purple/pink mix)
            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random() * 0.5;
            colors[i * 3 + 2] = 1;
        }
        return [positions, colors];
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#88adff"
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
};

const SidebarThreeBackground = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                {/* Ambient Light */}
                <ambientLight intensity={0.5} />
                <Particles />
            </Canvas>
        </div>
    );
};

export default SidebarThreeBackground;
