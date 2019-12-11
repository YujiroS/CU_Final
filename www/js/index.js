
document.addEventListener('deviceready', function(){
    let user = null;
    let db = null;
    let asignatura_name = null;
    let asignatura = null;
    let text = null;

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
                document.querySelector('#page_login').style.display = 'none';
                document.querySelector('#page_main').style.display = 'block';
                user = result.user;
                console.log(user);
                document.getElementById("nprof").innerHTML = "Profesor " + user.providerData[0].displayName;

                db = firebase.database();
                var ref = db.ref("users/"+user.uid +"/asignaturas/");

                //CUIDADO PORQUE SE NOS METE EN ESTA FUNCION SIEMPRE QUE AÑADIMOS CUALQUIER COSA A LA BASE DE DATOS
                ref.on('child_added', function(child_snapshot, prev_child_key){

                    let data = child_snapshot.val();

                    console.log(child_snapshot);

                    asignatura = child_snapshot.key;

                    //Crear Elementos
                    let tr = document.createElement('tr');
                    let td = document.createElement('td');
                    let btn_del = document.createElement('button');
                    let dl = document.createElement('a');
                    td.id = "asignatura_" + child_snapshot.key;
                    //Añadimos id para que nos encuentre el boton que queremos borrar
                    btn_del.id = child_snapshot.key;
                    btn_del.value = child_snapshot.key;
                    td.innerHTML = data.name;
                    btn_del.innerHTML = "Borrar";
                    btn_del.style.float = "right";
                    dl.innerHTML = "Descargar";
                    

                    
                    cordova.plugins.qrcodejs.encode('TEXT_TYPE', asignatura, (base64EncodedQRImage) => {
                        console.info('QRCodeJS response is ' + base64EncodedQRImage);
                        dl.download = "qr.png"
                        dl.href = base64EncodedQRImage;
                        dl.id = "descarga_" + child_snapshot.key;

                        var tabla = document.querySelector('#table');
                        tabla.appendChild(tr);
                        tr.appendChild(td);
                        tr.appendChild(btn_del);
                        tr.appendChild(dl);
                        
    
                        btn_del.addEventListener('click', function(event){
                            console.log(event);
                            let asignatura_key = event.srcElement.value;
                            ref.child(asignatura_key).remove();
                        });
                        //TODO: use your base64EncodedQRImage
            
            
                        /*
                        var storage_ref = firebase.storage().ref();
                        var image_ref = storage_ref.child('images/' + texto + ".jpg");
                        image_ref.putString(base64EncodedQRImage, 'data_url').then(function(snapshot) {
                            console.log('Exito subiendo la imagen');
                        });
                        */
                    }, (err) => {
                        console.error('QRCodeJS error is ' + JSON.stringify(err));
                    });
                    

                    var tabla = document.querySelector('#table');
                    tabla.appendChild(tr);
                    tr.appendChild(td);
                    tr.appendChild(btn_del);
                    tr.appendChild(dl);


                    btn_del.addEventListener('click', function(event){
                        console.log(event);
                        let asignatura_key = event.srcElement.value;
                        ref.child(asignatura_key).remove();
                    });
                })

                ref.on('child_removed', function(child_snapshot) {
                    document.getElementById("asignatura_" + child_snapshot.key).remove();
                    document.getElementById(child_snapshot.key).remove();
                    document.getElementById("descarga_" + child_snapshot.key).remove();
                });
            }
        }).catch((error)=>{
            console.log(error);
        });
    }

    const n = new Date();
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
    document.getElementById("date").innerHTML = d + ", " + weekday[n.getDay()];
    document.getElementById("month").innerHTML = monthname[m];
    var slides = document.getElementsByClassName("calendar__number");
    for(var i = 0; i < slides.length; i++)
    {
        if(slides[i].innerHTML==d){
            slides[i].className = "calendar__number calendar__number--current";
        }
    }
    /*
    document.querySelector('#computacion_ubicua').addEventListener('click', function(){
        document.querySelector('#page_main').style.display = 'none';
        document.querySelector('#page_computacion_ubicua').style.display = 'block';
    });
    */

    document.querySelector('#form1submit').addEventListener('click', function(event){
        var ref = db.ref("users/" + user.uid + "/asignaturas/");
        var asignatura_name = document.querySelector('#form1input1').value;
        ref.push().set({name:asignatura_name});
        ref = db.ref("users/" + user.uid + "/asignaturas/"+ asignatura + "/lista clase/");
        for(let i=0; i< text.length-1;i++){
            var alumnos = {
                NIU: text[i].split(";")[0],
                Apellidos: text[i].split(";")[1],
                Nombre: text[i].split(";")[2],
                Correo: text[i].split(";")[3].replace('\r', ''),
                Ausencias: 0
            }
            ref.push(alumnos);
        }
        document.querySelector('#page_main').style.display = 'block';
        document.querySelector('#page_login').style.display = 'none';
        
        
    });

    document.querySelector('#form1input2').addEventListener('change', function(event){
        var input = event.target;
        var reader = new FileReader();
        reader.onload = function(){
          text = reader.result;
          text = text.split("\n");
        };
        reader.readAsText(input.files[0]);
    });
        /*
        var alumno = {
            nombre:,
            nia:,
            tipo:,
            asistencia:
        }
        
        
        var input = event.target;
        var ref = db.ref("users/" + user.uid + "/" + asignatura);
        var reader = new FileReader();
        reader.onload = function(){
          var text = reader.result;
          console.log(text);
          //console.log(text.split("\n"));
          ref.push().set({name:"Guillermo"});
          var newRef = db.ref("users/" + user.uid + "/" + asignatura + "/Guillermo")
          newRef.push().set({tipo:"alumno"});
          newRef.push().set({NIA:"100346189"});
        };
        reader.readAsText(input.files[0]);
      
      
        document.querySelector().addEventListener('click', function(event){


    });
    function mifuncion(key, name){
        ref

    }*/


      
})