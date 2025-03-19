import * as THREE from 'three'
import Experience from '../Experience'

export default class HandTracking {
    constructor(physics) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.physics = physics

        this.fingerColors = [
            '#ffffff', // Wrist (0)
            '#ff0000', '#ff0000', '#ff0000', '#ff0000', // Thumb (1-4)
            '#00ff00', '#00ff00', '#00ff00', '#00ff00', // Index (5-8)
            '#0000ff', '#0000ff', '#0000ff', '#0000ff', // Middle (9-12)
            '#ffff00', '#ffff00', '#ffff00', '#ffff00', // Ring (13-16)
            '#ff00ff', '#ff00ff', '#ff00ff', '#ff00ff'  // Pinky (17-20)
        ]

        this.landmarks = []
        this.middleKnuckleX = null
        this.middleKnuckleY = null
        this.depthToCamera = null

        this.SMOOTHING_FACTOR = 0.1
        this.previousPositions = new Map()

        // expose saveLandmarks globally
        window.saveLandmarks = this.saveLandmarks.bind(this)

        this.setGeometry()
        this.setMaterial()
        this.initLandmarks()
    }

    initLandmarks() {
        for (let i = 0; i < 21; i++) {
            const landmark = {}

            // create three.js mesh
            landmark.mesh = this.createSphere(0.01, new THREE.Vector3(i, i, i), 0.1)

            // create dynamic physics collider
            this.physics.setBodyFromThree(landmark, true)

            // change finger colors
            landmark.mesh.material.color = new THREE.Color(this.fingerColors[i])

            this.landmarks.push(landmark)
        }
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(1, 10, 10)
    }

    setMaterial()
    {
        this.material = new THREE.MeshStandardMaterial({
            metalness: 0.3,
            roughness: 0.4,
            envMapIntensity: 0.5
        })
    }

    createSphere(radius, position) {
        const mesh = new THREE.Mesh(this.geometry, this.material.clone())
        mesh.position.copy(position)
        mesh.scale.setScalar(radius)
        this.scene.add(mesh)
        return mesh
    }

    saveLandmarks(canvasLandmarks, worldLandmarks) {
        this.landmarkPositions = worldLandmarks

        this.middleKnuckleX = canvasLandmarks[9].x
        this.middleKnuckleY = canvasLandmarks[9].y

        const canvasDistance = this.getDistance(canvasLandmarks[0], canvasLandmarks[1])
        const worldDistance = this.getDistance(worldLandmarks[0], worldLandmarks[1])

        this.depthToCamera = worldDistance / canvasDistance
    }

    getDistance(pointA, pointB) {
        return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2)
    }


    smoothPosition(index, newPos) {
        if (!this.previousPositions.has(index)) {
            this.previousPositions.set(index, new THREE.Vector3().copy(newPos))
        }
        const smoothedPos = this.previousPositions.get(index).lerp(newPos, this.SMOOTHING_FACTOR)
        this.previousPositions.set(index, smoothedPos.clone())
        return smoothedPos
    }


    update()
    {
        for (let i = 0; i < this.landmarks.length; i++) {
            if (this.landmarkPositions && this.middleKnuckleX) {
                const landmark = this.landmarks[i]
                const position = new THREE.Vector3(
                    this.landmarkPositions[i].x + (this.middleKnuckleX - 0.5) * this.depthToCamera, 
                    -this.landmarkPositions[i].y - (this.middleKnuckleY - 0.5) * this.depthToCamera,
                    this.landmarkPositions[i].z + (-1 + this.depthToCamera * 1.7), // 1.7 = scale factor for accurate sizing to 2d canvas, -1 = initial camera.position.z
                )
        
                const smoothedPosition = this.smoothPosition(i, position)
                landmark.mesh.position.copy(smoothedPosition)
                landmark.rigidBody.setTranslation(smoothedPosition)
            }
        }
    }
}
