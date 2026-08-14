import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollSystem } from '../lib/scrollSystem'

const PARTICLE_COUNT = 90

function buildParticles() {
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)
  const warm = new THREE.Color('#e0b253')
  const cool = new THREE.Color('#9db3c9')
  const paper = new THREE.Color('#f2ede2')

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 14
    positions[i3 + 1] = (Math.random() - 0.5) * 9
    positions[i3 + 2] = (Math.random() - 0.5) * 6 - 1

    const r = Math.random()
    const c = r < 0.62 ? paper : r < 0.88 ? warm : cool
    colors[i3] = c.r
    colors[i3 + 1] = c.g
    colors[i3 + 2] = c.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

function AmbientParticles() {
  const geometry = useMemo(() => buildParticles(), [])
  const pointsRef = useRef<THREE.Points>(null)
  const seed = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const attr = geometry.attributes.position as THREE.BufferAttribute
    const pos = attr.array as Float32Array
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      const s = seed[i]
      pos[i3] += Math.sin(t * 0.12 + s) * 0.0016
      pos[i3 + 1] += Math.cos(t * 0.1 + s * 1.7) * 0.0011
    }
    attr.needsUpdate = true

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.008
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.4}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

/** Vertical journey line that grows as the visitor scrolls. */
function JourneyLine() {
  const lineRef = useRef<THREE.Line>(null)
  const tipRef = useRef<THREE.Points>(null)
  const progress = useRef(0)

  useEffect(
    () =>
      scrollSystem.registerFrame(() => {
        progress.current = scrollSystem.state.progress
      }),
    [],
  )

  const { geometry, line } = useMemo(() => {
    const COUNT = 96
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < COUNT; i++) {
      const v = i / (COUNT - 1)
      const y = 4.2 - v * 8.4
      const x = Math.sin(v * Math.PI) * 0.5 - 0.35
      const z = -0.4
      pts.push(new THREE.Vector3(x, y, z))
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(pts)
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: '#e0b253',
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
    )
    return { geometry, line }
  }, [])

  const tipGeom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3))
    return g
  }, [])

  useFrame(() => {
    const p = progress.current
    const count = geometry.attributes.position.count
    if (lineRef.current) {
      lineRef.current.geometry.setDrawRange(0, Math.max(1, Math.floor(count * p)))
    }
    if (tipRef.current) {
      const idx = Math.max(0, Math.floor((count - 1) * p))
      const a = geometry.attributes.position.array as Float32Array
      tipRef.current.position.set(a[idx * 3], a[idx * 3 + 1], a[idx * 3 + 2])
    }
  })

  return (
    <group>
      <primitive ref={lineRef} object={line} />
      <points ref={tipRef} geometry={tipGeom}>
        <pointsMaterial
          color="#e0b253"
          size={0.14}
          transparent
          opacity={0.8}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

export function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 6], fov: 55 }}
      style={{ background: 'transparent' }}
    >
      <AmbientParticles />
      <JourneyLine />
    </Canvas>
  )
}
