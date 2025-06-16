const wretch = require('wretch');
    
const endpoint = wretch(document.URL);
    
window.addEventListener('DOMContentLoaded', event => {

    const nombre = document.getElementById('inputName');
    let dataList = document.getElementById('listaSuplentes')
    
    nombre.addEventListener('keyup', async (fecha_event) => { // Cuando cambia la fecha filtrar por fecha y estado
        tabla.clear();
        // Pedir datos de asistencias de la fecha a app
        let new_content = (await endpoint.post({ filtro: nombre.value })
            .res(async response => { 
                return (response.headers.get('Content-Type').includes('application/json')) ? response.json() : response.text();
            })).asistencias;
        console.log(new_content);
        
        dataList.innerHTML = '';
        if (data.length === 0) {
          dataList.style.display = 'none';
          return;
        }

        data.forEach(nombre => {
          const option = document.createElement('option');
          option.textContent = nombre;
          option.style.padding = '5px';
          option.style.cursor = 'pointer';

          option.addEventListener('click', () => {
            input.value = nombre;
            dataList.style.display = 'none';
          });

          dataList.appendChild(option);
        });

        dataList.style.display = 'block';
    });
    
})