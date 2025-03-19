import Experience from '../Experience.js'
import Environment from './Environment.js'
import Physics from './Physics.js'
import PhysicsDebug from '../Utils/PhysicsDebug.js'
import Particles from './Particles.js'
import HandTracking from './Hand.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.physics = new Physics()

        this.initRapier()
        this.setDebug()

        this.dominoesCreated = false
        this.dominoesPushed = false

        this.texts = []


    }

    async initRapier() {
        try {
            await this.physics.setWorld()
            
            this.setup()
            this.physicsDebug = new PhysicsDebug(this.physics)

        } catch (error) {
            console.error("Error initializing physics world:", error)
        }
    }
    
    setup()
    {
        // this.floor = new Floor()
        this.environment = new Environment()

        this.hand = new HandTracking(this.physics)
        this.particles = new Particles()
    }

    setDebug()
    {
        
    }
    

    update() {
        if (this.particles) {
            this.particles.update()
        }

        if (this.hand) {
            this.hand.update()
        }

        if (this.physics) {
            this.physics.update()
        }

        if (this.physicsDebug) {
            this.physicsDebug.update()
        }
    }
}
