import * as THREE from 'three'
import Experience from '../Experience'


export default class Grid
{
    constructor()
    {
        this.experience = new Experience()
        this.debug = this.experience.debug

        this.grid = new THREE.GridHelper(30, 30)
        this.axes = new THREE.AxesHelper(15)

        // this.grid.visible = false
        // this.axes.visible = false

        this.experience.scene.add(this.grid)
        this.experience.scene.add(this.axes)

        this.visibility = {
            grid: this.grid.visible,
            axes: this.axes.visible
        }
        // this.setDebug()

    }

    setDebug()
    {
        const folder = this.debug.ui.addFolder({ 
            title: 'Grid and Axes',
            expanded: false,
        })

        folder
        .addBinding(this.visibility, 'grid')
        .on('change', (ev) => {
            this.grid.visible = ev.value
        })

        folder
        .addBinding(this.visibility, 'axes')
        .on('change', (ev) => {
            this.axes.visible = ev.value
        })
    }
}
