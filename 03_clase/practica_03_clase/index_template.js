console.log("Hola mundo desde el script")
console.log(saludar("Anderson"));


// functions --> 
// console.log( saludarExpressiva("Anderson"))

function saludar(nombre){
    return `Hola ${nombre} declarativa` //backticks usar --> template strings --> literal strings --> formatting string
}


const saludarExpressiva = function(nombre){
    return `Hola ${nombre}, con expressiva`
}


const sumador = (acc, number) => acc + number
const potenciador = (acc, number) =>{ 
    const totalAcumulado = acc ** number
    console.log(`es el valor : ${totalAcumulado}`)
    return totalAcumulado
    
}

function sumarNumbers(...numbers){
    const sumatoriaTotal = numbers.reduce(
        // function(accumulador, number){
        //     return accumulador + number
        // }

        // (accumulador,number) => accumulador + number
        // sumador
        potenciador
        , 10
    )

    console.log(sumatoriaTotal);
    return sumatoriaTotal
}



sumarNumbers(1,2,3,4,5,6)


class Persona{
    // decalarar atrinbutos de class se declaran antes del constructor
    #dni

    constructor(nombre,edad,dni){
        this.nombre = nombre
        this.edad = edad
        this.#dni = dni
    }

    saludar(){
        return `Hola, me llamo: ${this.nombre} y tengo ${this.edad}`
    }


    get documento(){
        return this.#dni
    }


    static checkMayorDeEdad(edad){
        return edad >= 18 
    }

}


console.log(Persona.checkMayorDeEdad(10))

//JS-  objeto  --> golang - struct
const pepeStruct = {
    nombre: "Jose Argento",
    edad: 29,
    dni: 888888888
}

// deconstructuring
const {nombre,edad,dni} = pepeStruct
const pepe = new  Persona(nombre,edad,dni)

console.log(pepe.saludar())


// Herencia

class Empleado extends Persona{
    constructor(nombre,edad,dni,puesto="zapatero"){
        super(nombre,edad,dni)
        this.puest = puesto
    }

    saludar(){
        return `${super.saludar()} , trabajo muy duro, paguenme mucho, por que soy: ${this.puesto}`
    }

}


const pepeZapateria = new Empleado(nombre,edad,dni)

console.log(pepeZapateria.saludar())



// callback 
const processingMongo = nombre => {console.log(`Estoy procesando los datos con Monguito: ${nombre}`);}
const processingMySQl =  nombre => {console.log(`Estoy procesando los datos con MySQL: ${nombre}`);}
const processingQdrant =  nombre => {console.log(`Estoy procesando los datos con Qdrant: ${nombre}`);}

function procesarDataUsuarios(nombre, callbackProcesamiento){
    console.log("Ma que si, vamo' a procesar datos ...")
    callbackProcesamiento(nombre)
}



procesarDataUsuarios("Marcelo",  processingMongo)
procesarDataUsuarios("Gervasio", processingMySQl )
procesarDataUsuarios("Inocencio", processingQdrant )


// // bardo con los callbacks

// getUser( 1, funtcion(usuario) {
//     getPedido(usuario.id, function(pedidos){
//         getPedidoDetail(pedido[0].id, function(detalle){
//             transaccPayment(detalle){
//                 console.log("Pago procesado", detalle);  
//             }, manejarError
//         },manejarError)
//     },manejarError)
// },manejarError)

// // Promesas

// getUser(1)
//     .then(usuario => getPedido(usuario.id))
//     .then(pedidos => getPedidoDetail(pedido[0].id))
//     .then(detalle => transaccPayment(detalle))
//     .then(transaccion => console.log(transaccion.SUCCESS))
//     .catch(error => console.error(error.msg))

// // const getUSer = new Promise( )

// // Async/Await

// async function executeTransaccion(){
//     try{
//         Promise.all()
//         const usuario = await getPedido(usuario.id)
//         const pedidos = await getPedidoDetail(pedido[0].id)
//         const detalle = await transaccPayment(detalle)
//         console.log(transaccion.SUCCESS)
//     }catch(e){
//         console.error(Error);
        
//     }
// }

const endpoint = "https://dragonball-api.com/api/characters"

// event loop ->  async
// fetch(endpoint)
//     .then(response => response.json())
//     .then(data => console.log(data))
//     .catch(e => console.log(e.message))


// console.log(data);


async function getDataFetch(){
    try{
        const res = await fetch(endpoint)

        if(!res.ok) throw new Error('Esto es un error')
        
        const data = await res.json()
        
        localStorage.setItem('dragonBall', JSON.stringify(data))

        return data
    }catch(e){
        console.log(e);
        
    }
}

getDataFetch()

