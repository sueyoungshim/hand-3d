import * as THREE from 'three'

import Experience from "../Experience"

export default class Particles
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        
        this.particlesPARAM = {
            attractionRadius: 0.1,
            repulsionStrength: 0.03,
            dampingFactor: 1.0
        }

        this.loadTexture()
        this.setParticles()
        this.setDebug()
    }

    loadTexture()
    {
        const textureLoader = new THREE.TextureLoader()
        this.particleTexture = textureLoader.load('/particle.png')
    }

    setParticles()
    {
        this.particlesGeometry = new THREE.BufferGeometry()
        this.count = 5000
        
        this.positions = new Float32Array(this.count * 3)
        this.velocities = new Float32Array(this.count * 3)
        this.colors = new Float32Array(this.count * 3)
        
        for (let i = 0; i < this.count * 3; i++) {
           this.positions[i] = (i % 3 != 2 ? (Math.random() - 0.5) : -Math.random()) * 0.5
           this.colors[i] = Math.random()
           this.velocities[i] = 0
        }
        
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
        this.particlesGeometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
        
        this.particlesMaterial = new THREE.PointsMaterial({
           size: 0.05,
           sizeAttenuation: true,
           alphaMap: this.particleTexture,
           transparent: true,
           depthWrite: false,
           blending: THREE.AdditiveBlending,
           vertexColors: true
        })
        
        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial)
    }

    update()
    {
        const positionsArray = this.particlesGeometry.attributes.position.array
        const velocitiesArray = this.velocities

        if (landmarkPositions) {
            for (let i = 0; i < count; i++) {
                const px = positionsArray[i * 3]
                const py = positionsArray[i * 3 + 1]
                const pz = positionsArray[i * 3 + 2]

                for (let j = 0; j < landmarks.length; j++) {
                    const landmark = landmarks[j]
                    const lx = landmark.mesh.position.x
                    const ly = landmark.mesh.position.y
                    const lz = landmark.mesh.position.z

                    const dx = px - lx
                    const dy = py - ly
                    const dz = pz - lz
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

                    if (distance < this.particlesPARAM.attractionRadius) {
                        const factor = (this.particlesPARAM.attractionRadius - distance) * this.particlesPARAM.repulsionStrength

                        velocitiesArray[i * 3] += dx * factor
                        velocitiesArray[i * 3 + 1] += dy * factor
                        velocitiesArray[i * 3 + 2] += dz * factor
                    }
                }

                // Apply velocity
                positionsArray[i * 3] += velocitiesArray[i * 3]
                positionsArray[i * 3 + 1] += velocitiesArray[i * 3 + 1]
                positionsArray[i * 3 + 2] += velocitiesArray[i * 3 + 2]

                // Damping to slow down particles
                velocitiesArray[i * 3] *= this.particlesPARAM.dampingFactor
                velocitiesArray[i * 3 + 1] *= this.particlesPARAM.dampingFactor
                velocitiesArray[i * 3 + 2] *= this.particlesPARAM.dampingFactor
            }
        }

        particlesGeometry.attributes.position.needsUpdate = true
    }

    setDebug()
    {
        const particlesFolder = this.debug.ui.addFolder({ title: 'particles' })

        const addParticlesButton = particlesFolder.addButton({
            title: 'add particles'
        })

        addParticlesButton.add = true

        addParticlesButton.on('click', () => {
            addParticlesButton.add = !addParticlesButton.add
            if (addParticlesButton.add) {
                scene.remove(particles)
                addParticlesButton.title = 'add particles'
            } else {
                scene.add(particles)
                addParticlesButton.title = 'remove particles'
            }
        })

        particlesFolder.addButton({
            title: 'reset particles'
        }).on('click', () => {
            const positions = this.particlesGeometry.attributes.position.array
            for (let i = 0; i < count * 3; i++) {
                positions[i] = (i % 3 != 2 ? (Math.random() - 0.5) : -Math.random()) * 0.5
            }
        })

        particlesFolder.addBinding(this.particlesPARAM, 'attractionRadius', {
            min: 0, 
            max: 1,
            step: 0.1
        })

        particlesFolder.addBinding(this.particlesPARAM, 'repulsionStrength', {
            min: 0, 
            max: 0.1,
            step: 0.01
        })

        particlesFolder.addBinding(this.particlesPARAM, 'dampingFactor', {
            min: 0, 
            max: 3,
            step: 0.1
        })

    }
}
