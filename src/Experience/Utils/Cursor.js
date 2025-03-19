import Experience from "../Experience"

export default class Cursor
{
    constructor() 
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes

        this.x = 0
        this.y = 0

        window.addEventListener('mousemove', (event) => {
            this.x = event.clientX
            this.y = event.clientY

            this.normalX = this.x / this.sizes.width - 0.5
            this.normalY = this.y / this.sizes.height - 0.5
        })
    }
}
