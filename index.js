const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []



const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  const maxPages = 5;
  const startPage = Math.max(currentPage - 2, 1);
  const endPage = Math.min(startPage + maxPages - 1, numPages);
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-info page numberedButtons" value="${currentPage - 1}">
        Previous
      </button>
    `);
  }

  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-info page numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">
        ${i}
      </button>
    `);
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-info page numberedButtons" value="${currentPage + 1}">
        Next
      </button>
    `);
  }
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  const pokemonTypeFilters = Array.from($('.pokemonFilter:checked')).map((checkbox) => checkbox.value);

  // filter pokemons by selected types
  let filtered_pokemons = pokemons;
  if (pokemonTypeFilters.length > 0) {
    filtered_pokemons = await Promise.all(pokemons.map(async (pokemon) => {
      const res = await axios.get(pokemon.url);
      const types = res.data.types.map((type) => type.type.name);
      if (pokemonTypeFilters.every((filter) => types.includes(filter))) {
        return pokemon;
      }
      return null;
    }));
    filtered_pokemons = filtered_pokemons.filter((pokemon) => pokemon !== null);
  }

  const totalCount = filtered_pokemons.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, filtered_pokemons.length);
  $('#pokemonCount').text(`Displaying ${startIndex} - ${endIndex} of ${totalCount} Pokémons`);

  const selected_pokemons = filtered_pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  $('#pokeCards').empty()
  for (const pokemon of selected_pokemons) {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-info" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `)
  }
}


const setup = async () => {
  // test out poke api using axios here

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  });

  const responseF = await axios.get('https://pokeapi.co/api/v2/type');
  const types = responseF.data.results;


  $('body').on('change', '.pokemonFilter', async function (e) {
    currentPage = 1;
    paginate(currentPage, PAGE_SIZE, pokemons);

    // update pagination buttons
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  });

}

$(document).ready(setup)