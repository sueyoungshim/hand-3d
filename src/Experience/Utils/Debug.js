import { Pane } from 'tweakpane';

export default class Debug
{
    constructor()
    {
        this.ui = new Pane()

        this.setUI()
    }

    setUI()
    {
        this.ui.title = 'drag here to move'

        const parentElement = this.ui.element.parentElement
        parentElement.style.top = '20px'
        parentElement.style.left = '20px'

        this.ui.element.style.position = 'absolute'
        this.ui.element.style.minWidth = '360px'

        const titleBar = this.ui.element.children[0]
        titleBar.style.cursor = 'grab'
        
        let isDragging = false
        let offsetX, offsetY
        
        titleBar.addEventListener('mousedown', (event) => {
            isDragging = true
            offsetX = event.clientX - this.ui.element.offsetLeft
            offsetY = event.clientY - this.ui.element.offsetTop
            titleBar.style.cursor = 'grabbing'
        })
        
        titleBar.addEventListener('mouseup', (event) => {
            this.ui.expanded = !this.ui.expanded
        })
        
        window.addEventListener('mousemove', (event) => {
            if (!isDragging) return
            this.ui.element.style.left = `${event.clientX - offsetX}px`
            this.ui.element.style.top = `${event.clientY - offsetY}px`
        })
        
        window.addEventListener('mouseup', () => {
            isDragging = false
            titleBar.style.cursor = 'grab'
        })
    }
}
