document.addEventListener('deviceready', function(){
    getRedirectResult();
    document.querySelector('#btn_google_login').addEventListener('click', function(){
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider).then(()=>{
            getRedirectResult();
        });
    });

    function getRedirectResult(){
        firebase.auth().getRedirectResult().then((result)=>{
            if(result.credential){
                document.querySelector('#page_asignaturas').style.display = 'none';
                document.querySelector('#page_añadir_clase').style.display = 'none';
                document.querySelector('#page_login').style.display = 'none';
                document.querySelector('#page_main').style.display = 'block';
                user = result.user;
                console.log(user);
                document.getElementById("nprof").innerHTML = "Profesor " + user.providerData[0].displayName;
            }
        }).catch((error)=>{
            console.log(error);
        });
    }

    n = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var monthname = new Array(12);
    monthname[0] = "January";
    monthname[1] = "February";
    monthname[2] = "March";
    monthname[3] = "April";
    monthname[4] = "May";
    monthname[5] = "June";
    monthname[6] = "July";
    monthname[7] = "August";
    monthname[8] = "September";
    monthname[9] = "October";
    monthname[10] = "November";
    monthname[11] = "December";
    m = n.getMonth();
    d = n.getDate();
    document.getElementById("date").innerHTML = d + ", " + weekday[d-1];
    document.getElementById("month").innerHTML = monthname[m];
    var slides = document.getElementsByClassName("calendar__number");
    for(var i = 0; i < slides.length; i++)
    {
        if(slides[i].innerHTML=="3"){
            slides[i].className = "calendar__number calendar__number--current";
        }
    }
    
/*
    document.querySelector('#btn_nueva_asig').addEventListener('click', function(){
        document.querySelector('#page_añadir_asign').style.display = 'block';
        document.querySelector('#page_main').style.display = 'none';
        document.querySelector('#page_asignaturas').style.display = 'none';
        document.querySelector('#page_añadir_clase').style.display = 'none';
    });
*/


})