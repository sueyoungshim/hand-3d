import * as THREE from 'three'
import { gsap } from 'gsap'
import { createNoise2D } from 'simplex-noise'

import Experience from '../Experience.js'

export default class Domino
{
    static hasDebug = false

    constructor(position, angle, physics)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        
        this.position = position
        this.angle = angle
        this.physics = physics
        this.isPushed = false

        this.geometryParam = {
            width: 1,
            height: 2, 
            depth: 0.1,
            radius: 0.1,
            smoothness: 1
        }

        this.noise2D = createNoise2D()

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
        this.setPhysics()
        this.setDebug()
    }

    setGeometry()
    {
        const width = this.geometryParam.width
        const height = this.geometryParam.height
        const depth = this.geometryParam.depth
        const radius0 = this.geometryParam.radius
        const smoothness = this.geometryParam.smoothness

        let shape = new THREE.Shape()
        let eps = 0.00001
        let radius = radius0 - eps

        shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true )
        shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true )
        shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true )
        shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true )
        
        this.geometry = new THREE.ExtrudeGeometry( shape, {
          depth: depth - radius0 * 2,
          bevelEnabled: true,
          bevelSegments: smoothness * 2,
          steps: 1,
          bevelSize: radius,
          bevelThickness: radius0,
          curveSegments: smoothness
        })

        this.geometry.center()
    }

    updateGeometry() {
        this.geometry.dispose()
        this.setGeometry()
        this.mesh.geometry = this.geometry
    }

    setTextures()
    {
        this.textures = {
            
        }
    }

    setMaterial()
    {
        // this.material = new THREE.MeshStandardMaterial({
        //     color: '#ffffff',
        //     // wireframe: true,
        // })

        // this.material = new THREE.MeshNormalMaterial({
        //     wireframe: false
        // })

        this.material = new THREE.MeshBasicMaterial()
        this.color = this.material.color
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(this.position.x, this.position.y, this.position.z)
        this.scene.add(this.mesh)
    }

    setColor(color)
    {
        this.material.color = color
        this.color = color
    }

    setWaveWhite()
    {   
        this.position = this.mesh.position
        const noise = this.noise2D(this.position.x, this.position.z)  * 0.5
        

        const originalColor = this.color.clone()

        gsap.to(this.color, {
            r: 1.0,
            g: 1.0,
            b: 1.0,
            duration: Math.random(),
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(this.color, {
                        r: originalColor.r,
                        g: originalColor.g,
                        b: originalColor.b, 
                        duration: 1.0 + Math.random(),
                        // onComplete: () => {
                        //     this.setVaryingColor()
                        // }
                    })
                }, 1000)
            }
        })
    }

    setWaveVarying()
    {
        const originalColor = this.color.clone()

        gsap.to(this.color, {
            r: originalColor.r,
            g: originalColor.g - (1 + Math.random()) * 0.1,
            // b: this.clamp(originalColor.b + Math.random() * 0.1, 0.5, 0.8),
            b: originalColor.b,
            // b: 0.0,
            duration: Math.random(),
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(this.color, {
                        r: originalColor.r,
                        g: originalColor.g,
                        b: originalColor.b,
                        duration: 1.0 + Math.random(),
                    })
                }, 1000)
            }
        })
    }


    clamp(value, min, max) 
    {
        return Math.max(min, Math.min(max, value))
    }

    setVaryingColor()
    {
        const originalColor = this.color.clone()

        gsap.to(this.color, {
            r: originalColor.r,
            g: this.clamp(originalColor.g + (Math.random() - 0.5) * 0.1, 0.0, 0.1),
            b: this.clamp(originalColor.b + (Math.random() - 0.5) * 0.1, 0.5, 0.7),
            duration: 0.5,
            onComplete: () => {
                this.setVaryingColor()
            }
        })
        
    }

    setFadeIn(opacity)
    {
        this.material.transparent = true 
        this.material.opacity = opacity 

        const fadeInSpeed = 0.01 

        const fade = () => {
            opacity += fadeInSpeed
            this.material.opacity = Math.min(opacity, 1) 

            if (opacity < 1) {
                requestAnimationFrame(fade) 
            }
        }
        fade()
    }

    setPhysics() {
        this.physics.setBodyFromThree(this, this.angle)
    }

    setDebug()
    {
        if(!Domino.hasDebug && this.debug.active)
        {
            Domino.hasDebug = true
            // DOMINO FOLDER
            this.debugFolder = this.debug.ui.addFolder({
                title: 'domino',
                expanded: false,
            })

            for (var item in this.geometryParam) {
                const range = { min: 1, max: 5, step: 0.01 }

                range.min = (item === 'depth' || item === 'radius') ? 0 : 1
                range.step = (item === 'smoothness') ? 1 : 0.01
                range.max = (item === 'radius') ? 1 : 5

                this.debugFolder
                .addBinding(this.geometryParam, String(item), range)
                .on('change', (ev) => {
                    this.geometryParam.item = ev.value
                    this.updateGeometry()
                })
            }

            // MATERIAL FOLDER
            this.debugMaterialFolder = this.debugFolder.addFolder({
                title: 'material',
                expanded: true
            })

            this.debugMaterialFolder
            .addBinding(this.material, 'wireframe')
            .on('change', (ev) => {
                this.material.wireframe = ev.value
            })
        }
    }



    pushAll()
    {
        this.physics.pushAll()
    }

    getSize()
    {
        return this.geometryParam
    }
}
