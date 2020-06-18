/* Global Variables */
const button = document.getElementById('generate');

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();


/* Function to GET GeoNames Web API Data*/
const getGeoNamesData = async(inputLocation)=>{ 
    
    const response = await fetch(
        '/getTravelInfo?' + new URLSearchParams({inputLocation: inputLocation}), 
        {
            method: 'GET',
            credentials: 'same-origin',
            headers:{
                'Content-Type': 'application/json',
            },
        }
    );

    try{
        const newData = await response.json();

        if(newData.error){
            alert(newData.error);
            return null;
        }
        //console.log(newData);
        return newData;
    }catch(error){
        console.log('error', error);
    }
}


/* Function to POST data */
const postData = async (url= '', data = {}) =>{
    //console.log(data);

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    try{
        const newData = await response.json();
        //console.log(newData);
        return newData;
    }catch(error){
        console.log('error', error);
    }
}


/* Function to GET Project Data */
const updateUI = async() =>{
    const request = await fetch('/all');

    try{
        const allData = await request.json();
        //console.log(allData);
        document.getElementById('city').innerHTML = `<h2>My trip to: ${allData.inputLocation}, ${allData.country}</h2>`;
        document.getElementById('departing').innerHTML = `<h3>Departing: ${allData.inputDate}</h3>`;
        document.getElementById('daysAway').innerHTML = `<p>Your trip is ${allData.daysLeft} days away and it'll be ${allData.tripLenght} days long</p>`;
        document.getElementById('weather').innerHTML = `<h3>Forecast (for the next 16 days):</h3><p>High temp: ${allData.highTemp}°C | Low temp:${allData.lowTemp}°C</p><p>${allData.description}</p>`;
        document.getElementById('image').innerHTML = `<img src=${allData.image} alt=${allData.inputLocation} class="responsive">`
    }catch(error){
        console.log("error", error);
    }
}


// Event listener to add function to existing HTML DOM element
button.addEventListener('click', performAction);

/* Function called by event listener */
function performAction(e){
    const inputDate = document.getElementById('date').value;
    const inputLocation = document.getElementById('location').value;
    const inputEndDate = document.getElementById('endDate').value; 

    if(!inputLocation){
        alert('Please enter Location');
    } else if (!inputDate || !inputEndDate || inputEndDate < inputDate) {
        alert('Please enter valid Date');
    } else {
        let date1 = new Date(inputDate);
        let date2 = new Date(inputEndDate);
        //console.log(date1);

        const daysLeft = Client.getDaysLeft(date1);
        //console.log(inputLocation, inputDate,daysLeft);

        const tripLenght = Client.getTripLenght(date2, date1);

        //Call getData with geoNamesUrl
        getGeoNamesData(inputLocation)
        .then (function (tripData){
            if (!tripData){
                return
            }
            postData('/addInfo', {
                inputLocation: tripData.inputLocation, 
                country: tripData.country, 
                inputDate: inputDate, 
                daysLeft: daysLeft, 
                tripLenght: tripLenght,
                highTemp: tripData.highTemp, 
                lowTemp: tripData.lowTemp, 
                description: tripData.description,
                image: tripData.image
            })
            .then(updateUI());
        })
    }
}

export { performAction };


