// DOM -> OMAR
const btnCarga = document.getElementById("btnCargar")
const personajes = document.getElementById("personasDbz")


const renderPersonaje = character => {
    return `
    <div class="card">

        <div class="card-content">
            <h2>${character.name}</h2>

            <p><strong>Raza:</strong> ${character.race}</p>
            <p><strong>Género:</strong> ${character.gender}</p>
            <p><strong>Ki:</strong> ${character.ki}</p>
            <p><strong>Ki máximo:</strong> ${character.maxKi}</p>
            <p><strong>Afiliación:</strong> ${character.affiliation}</p>
        </div>
    </div>
`
}


const handleBtnAction = async () =>{
    personajes.textContent = "Estoy cargando la data ..."
    const endpoint= "https://dragonball-api.com/api/characters"
    try{
        const response = await fetch(endpoint)
        
        if(!response.ok) throw new Error('Me pa que algo malio sal!')
        
        const { items, _ } = await response.json()

        const concatenateText = items.reduce((accu,personaje) => accu + '\n' + renderPersonaje(personaje), '')
        
        personajes.innerHTML = concatenateText

    }catch(error){
        personajes.textContent("data not available")
    }

}


btnCarga.addEventListener('click', handleBtnAction)
