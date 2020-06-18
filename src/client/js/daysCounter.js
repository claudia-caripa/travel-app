function getDaysLeft (date1){
    let d = new Date();
    let dateDiffMiliseconds = Math.abs(date1 - d);
    let dateDiffDays = (Math.floor((dateDiffMiliseconds / (60*60*24*1000))))+1;
    //console.log(dateDiffDays);    
    return dateDiffDays;
}

function getTripLenght (date2, date1){
    let tripDiffMiliseconds = Math.abs(date2 - date1);
    let tripDiffDays = (Math.floor((tripDiffMiliseconds / (60*60*24*1000))));
    return tripDiffDays;
}

export  { 
    getDaysLeft, 
    getTripLenght, };
