import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.time = this.experience.time
        this.cursor = this.experience.cursor

        this.setInstance()
        this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(25, this.sizes.width / this.sizes.height, 0.1, 100)
        this.instance.position.set(0, 0, -1)
        this.scene.add(this.instance)
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true

        this.controls.target = new THREE.Vector3(0, 0.0, -0.5)
    }


    clamp(value, min, max) 
    {
        return Math.max(min, Math.min(max, value))
    }


    // setParallax(x, y, centerX, centerY)
    // {
    //     if (this.cursor) {
    //         const parallaxX = this.cursor.normalX * 0.5 + centerX 
    //         const parallaxY = - this.cursor.normalY * 0.5 +centerY

    //         if (!isNaN(parallaxX) && !isNaN(parallaxY)) {
    //             this.instance.position[x] += (parallaxX - this.instance.position[x]) * 5 * this.time.delta * 0.001
    //             this.instance.position[y] += (parallaxY - this.instance.position[y]) * 5 * this.time.delta * 0.001

    //         }
    //     }
    // }


    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        if (this.controls) {
            this.controls.update()
        }
    }
}
