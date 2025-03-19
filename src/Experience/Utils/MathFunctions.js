export default class MathFunctions
{
    constructor()
    {

    }

    f(x) 
    {
        return (Math.sin(0.5 * x) + Math.sin(0.1 * x) + Math.sin(0.25 * x)) * 0.5
    }

    fPrime(x) 
    {
        return 0.5 * (
            0.5 * Math.cos(0.5 * x) + 
            0.1 * Math.cos(0.1 * x) + 
            0.25 * Math.cos(0.25 * x)
        )
    }

    normal(x)
    {
        return Math.atan(this.fPrime(x)) - Math.PI * 0.5
    }
}
