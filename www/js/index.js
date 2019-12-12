
document.addEventListener('deviceready', function(){
    let user = null;
    let db = null;
    let asignatura_name = null;
    let asignatura = null;
    let text = null;
    let chosen_asignatura = null;
    let class_objects = [];

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

                    td.addEventListener('click',()=> {
                        console.log("Key tbl: " + td.id.split("_")[1]);
                        console.log("Key snapshot: " + child_snapshot.key);
                        toClassInterface(td.innerText, td.id.split("_")[1]);
                    });

                    btn_del.addEventListener('click', function(event){
                        console.log(event);
                        let asignatura_key = event.srcElement.value;
                        ref.child(asignatura_key).remove();
                    });
                });

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


    /**
     * Switches view to classInterface by collapsing the Aula Global elements
     * and showing the class elements
     *
     * @param classname
     * @param key
     */
    function toClassInterface(classname, key){
        chosen_asignatura = key;
        load_student_data(key);
        load_horario_data(key);

        document.getElementById("title").textContent = "Asignatura";
        document.getElementById("btn_nueva_asig").style.display ="none";
        document.getElementById("header_table").style.display ="none";
        document.getElementById("table").style.display ="none";
        document.getElementById("profesor").style.display ="none";

        class_name = document.getElementById("nombre_clase");
        class_name.style.display = "block";
        class_name.innerText = classname;


        document.getElementById("class_page").style.display ="block";
        let btn_class = document.getElementById("add_class");
        btn_class.style.display ="block";

        //Sets implementation for the add class popUp
        let submit_class = document.getElementById("form2submit");
        submit_class.addEventListener('click', add_class);

        document.querySelector('#page_main').style.display = 'block';
        document.querySelector('#page_login').style.display = 'none';

        let back_to_aula = document.getElementById("btn_to_aula");
        back_to_aula.addEventListener('click', () => {
            toAulaGlobalInterface();
        });
    }

    /**
     * Adds class to asignatura
     */
    function add_class() {
        ref = db.ref("users/" + user.uid + "/asignaturas/"+ chosen_asignatura + "/lista horarios/");
        console.log("Key add_class: " + chosen_asignatura);
        let date = document.getElementById("form2input1").value;
        let table = document.getElementById("table_classes_participants");
        let students = [];
        for(let i = 1; i < table.rows.length; i++){
            students.push({
                Alumno: table.rows[i].cells[1].innerHTML,
                Presentado: "NO"
            });
        }
        let clase = {
            Mes:  date.split("/")[0],
            Dia: date.split("/")[1],
            Hora: date.split("/")[2],
            Aula: document.getElementById("form2input2").value,
            QR: create_qr(),
            Presencia: students
        };
        console.log("Before push");
        ref.push(clase);

        //Updates the table by retrieving the entries, including the new one from the server
        //To prevent duplications the table will be emptied first
        let tempEmptyTable = document.getElementById("table_classes");
        let border = tempEmptyTable.rows.length;
        for(let i = 1; i < border; i++){
            document.getElementById("class_page").removeChild(class_objects[i-1]);
            tempEmptyTable.deleteRow(1);
        }
        class_objects = [];
        load_horario_data(chosen_asignatura);
    }

    function create_qr() {
        return "TODO";
    }

    /**
     * Loads the upper table with classes
     * Loads DB data
     * Adds each element and to show the attendance for each class a pop up window will be hardcoded for each one
     *
     * @param key
     * @returns {PromiseLike<any> | Promise<any>}
     */
    function load_horario_data(key){
        let ref = db.ref("users/" + user.uid + "/asignaturas/"+ key + "/lista horarios/");
        return ref.once('value').then(function (snapshot) {
            let entries = [];
            snapshot.forEach(function () {
                entries.push(snapshot.val());
            });

            let table = document.getElementById("table_classes");

            for(let i = 1; i <= Object.values(entries[0]).length; i++){
                let value = Object.values(entries[0])[i-1];
                let row = table.insertRow();
                let entry = row.insertCell(0);
                let mes = row.insertCell(1);
                let dia = row.insertCell(2);
                let hora = row.insertCell(3);
                let aula = row.insertCell(4);
                let codigo = row.insertCell(5);
                let alumnos = row.insertCell(6);

                entry.innerHTML = "" + i;
                mes.innerHTML = value.Mes;
                dia.innerHTML = value.Dia;
                hora.innerHTML = value.Hora;
                aula.innerHTML = value.Aula;
                codigo.innerHTML = "TODO Hyperlink or download";

                //Creation of PopUp Window
                let popUpContainer = document.createElement("div")
                popUpContainer.className = "overlay";
                popUpContainer.id = "alumnos_nr" + i;
                let divPopup = document.createElement("div");
                divPopup.className = "popupBody";
                let headline = document.createElement("h1");
                headline.textContent = "Participation";
                let cerrar = document.createElement("a");
                cerrar.href="#";
                cerrar.text="x";
                let popUpContent = document.createElement("div");
                popUpContent.className = "popupContent";
                let participationTable = document.createElement("table");
                let tableHeader = participationTable.insertRow();
                tableHeader.insertCell(0).textContent = "Entry";
                tableHeader.insertCell(1).textContent = "Alumno";
                tableHeader.insertCell(2).textContent = "Presentado";

                //Fill table of popUpWindow
                for(let i = 1; i <= value.Presencia.length; i++){
                    let row_participants = participationTable.insertRow();
                    let entry_alumnos = row_participants.insertCell(0);
                    entry_alumnos.innerHTML = ""+i;
                    row_participants.insertCell(1).innerHTML = value.Presencia[i-1].Alumno;
                    row_participants.insertCell(2).innerHTML = value.Presencia[i-1].Presentado;
                }
                popUpContent.appendChild(participationTable);
                divPopup.appendChild(headline);
                divPopup.appendChild(cerrar);
                divPopup.appendChild(popUpContent);
                popUpContainer.appendChild(divPopup);

                document.getElementById("class_page").appendChild(popUpContainer);
                class_objects.push(popUpContainer);
                let open_alumnos = document.createElement("a");
                open_alumnos.href = "#alumnos_nr" + i;
                open_alumnos.text = "Mostrar";
                alumnos.appendChild(open_alumnos);
            }
        })
    }

    /**
     * Loads data for the lower student table
     * Gets data from DB
     * And then inserts each element
     * @param key
     * @returns {PromiseLike<any> | Promise<any>}
     */
    function load_student_data(key) {
        let ref = db.ref("users/" + user.uid + "/asignaturas/"+ key + "/lista clase/");
        return ref.once('value').then(function (snapshot) {
            let entries = [];
            snapshot.forEach(function () {
                entries.push(snapshot.val());
            });

            //Loads data into table
            let table = document.getElementById("table_classes_participants");


            for (let i = 1; i < Object.values(entries[0]).length; i++) {
                let row = table.insertRow();
                let entry = row.insertCell(0)
                let nia = row.insertCell(1);
                let nombre = row.insertCell(2);
                let apellido = row.insertCell(3);
                let correo = row.insertCell(4);
                let ausencias = row.insertCell(5);

                entry.innerHTML = ""+i;
                nia.innerHTML = Object.values(entries[0])[i].NIU;
                nombre.innerHTML = Object.values(entries[0])[i].Nombre;
                apellido.innerHTML = Object.values(entries[0])[i].Apellidos;
                correo.innerHTML = Object.values(entries[0])[i].Correo;
                ausencias.innerHTML = Object.values(entries[0])[i].Ausencias;
            }
        })
    }

    /**
     * Resets view to Aula global
     * The table will only be collapsed,
     * so to be able to switch to other asignatura the rows of the table will be deleted
     */
    function toAulaGlobalInterface(){
        document.getElementById("class_page").style.display = "none";
        let submit_class = document.getElementById("form2submit");
        submit_class.removeEventListener('click', add_class);


        let table = document.getElementById("table_classes_participants");
        let border = table.rows.length;
        for(let i = 1; i < border; i++){
            table.deleteRow(1);
        }

        let table_part = document.getElementById("table_classes");
        border = table_part.rows.length;
        for(let i = 1; i < border; i++){
            document.getElementById("class_page").removeChild(class_objects[i-1]);
            table_part.deleteRow(1);
        }
        class_objects = [];

        document.getElementById("title").textContent = "Aula Global";
        document.getElementById("btn_nueva_asig").style.display ="block";
        document.getElementById("header_table").style.display ="block";
        document.getElementById("table").style.display ="block";
        document.getElementById("profesor").style.display ="block";
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