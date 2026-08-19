console.log("Estoy vinculado con este html index.html")

console.log(typeof 11);
console.log(typeof 'Ola k ase?');
console.log(typeof {});
console.log(typeof [1,2,3,4]); // un array es un objeto (prototipao)
console.log(typeof new Array()); 
console.log(typeof function(){}); 

// sin mostrar que tipo es
console.log({});
console.log([1,2,3,4]); // un array es un objeto (prototipao)
console.log(new Array()); 
console.log(function(){}); 



// operacion
console.log("Operando");
console.log(1 + "1");
console.log(1 / "1");
console.log(1 / -0); // division sobre cero
 
// mi primer objeto

console.log({
    nombre: "Pancho",
    saludar: function(){console.log("Hola soy Pancho I");
    }
}.saludar()) // metodo


// const | var | let --> ES 6 ---> const | let

// camelCase
// var jugadorDeFootball = "Messi" 
var JugadorDeFootball = "Messi" 
var JUGADORDEFOOTBALL = "Messi" 
// snake case
var jugador_de_football = "Messi" 

console.log(jugadorDeFootball);
{
    
    var jugadorDeFootball  = 10
    
}
jugadorDeFootball = "Pele"
console.log(jugadorDeFootball);


// {

//     let vivoAca = 10

// }

// console.log(vivoAca)


// const  --> 

const nombres = [1,2,3]
nombres.push("Messi")


console.log(nombres);

// nombres = "Ola k ase?"

// DOM -_> VON DOM 
// Array | Object  | Functions

// Arrays --> almacenamientos de datos en ::memory
// Java 
// string[] pirulo ;
// JS

let nombresList = []

nombresList.push("Messi")
nombresList.push("CR7")
nombresList.push("Neymar")
nombresList.push(["Rosario","Thomas","Dali"])
nombresList.push({nombre:"pirulo"})
nombresList.push(()=> "pepe")
nombresList.push(()=> new Symbol())

console.log("Iteracion con ciclo for");

for (nombre of nombresList){
    console.log(typeof nombre);
}

console.log("iteracion por medio de un metodo de arrays");

nombresList.forEach(
    function(nombre){ console.log( nombre );
    }
)

let notStrings = nombresList.map(
    function(nombre){
        //operador ternario
        return typeof nombre == "string" ? nombre : null // diciendo que me cumpla una condicion --> retorne 
    }
)


console.log(notStrings);


let filtradoNombres =  nombresList.filter(
    function(nombre) { return typeof nombre === 'string'}
)

console.log(filtradoNombres);


// calculadora de arrays -> 

let numerosAlAzar = Array.from(
    {length :100},
    () => Math.floor(Math.random() * 100) + 1
)

console.log(numerosAlAzar);

function suma(a , b ) {return a+b}
function resta(a , b ) {return a-b}
function division(a , b ) {return a/b}
function multiplicacion(a , b ) {return a*b}


// funciones flecha

let newNumbersSuma = numerosAlAzar.map( numero => suma(numero , 10) )
let newNumbersResta = numerosAlAzar.map( function (numero) {return resta(numero , 10)}  )
let newNumbersDivision = numerosAlAzar.map( numero => division(numero,0)  )
// syntatic sugar
let newNumbersMultiplicacion = numerosAlAzar.map( numero => multiplicacion(numero, -1)   )


console.log(newNumbersSuma)
console.log(newNumbersResta)
console.log(newNumbersDivision)
console.log(newNumbersMultiplicacion)


// never nesting type -->  guard clauses | early returns

function classification( item) {
    // mala practica
    if (typeof item == 'string'){
        return 'es un string' 
    } else if (typeof item == 'number'){
        return 'es un number'
    } else{
        return 'no tengo ni idea'
    }
}

// refactorizacion

/**
 * params 
 * return
 * 
*/
function classificationInterna( item) {
// switch

    if (typeof item !== 'string' || typeof item !== 'number'  ) {
        return 'no tengo idea'
    }

    if (typeof item == 'string' ){
        return 'es un string' 
    }

    if (typeof item == 'number' ){
        return 'es un number' 
    }

    return 'es un objeto'
}


// les voy una tarea
 //realicen una funcion que me permita determinar si un año es bisiesto 

 /**
  * 
  * @param {*} year int
  * @return bool 
  */
 //function leapYear

// let years = Array.from(...) genera una lista aleatoria de n years -> y la funcion que van a hacer va a validar cuales son bisiestos

































