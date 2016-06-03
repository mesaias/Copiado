// JavaScript Document

/* 
* sistema de logs 
*/
var i_log = 0;
function mkLog(text){
	var date = new Date();
	var txt = i_log + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": " + text;
	i_log++;
	console.log(txt);
	//$("#log").append(txt  + "<br>");
}

/* 
* variables de la aplicación
*/
	var existe_db
	var db
	
/* 
* carga inicial de la app
*/
function onBodyLoad() {    
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady(){
	mkLog("Aplicación cargada y lista");
    //navigator.notification.alert("PhoneGap is working");
	
	existe_db = window.localStorage.getItem("existe_db");
	db = window.openDatabase("articulos", "1.0", "El proyecto de Monica", 200000);
	if(existe_db == null){
		creaDB();
	}else{
		cargaDatos();
	}
	
	
	$("#b_guardar").click(function(e){
		if($.id != -1){
		 	saveEditForm();
		 }else{
			saveNewForm();
		 }
	 });

	$("#b_guardar2").click(function(e){
		if($.id != -1){
		 	saveEditForm();
		 }else{
			saveNewForm();
		 }
	 });

	
	$("#b_eliminar").click(function(e){
		
		 	deleteItem();
		 
	 });
}


/* 
* creación de ña base de datos
*/
function creaDB(){
	db.transaction(creaNuevaDB, errorDB, creaSuccess);
	
}

function creaNuevaDB(tx){
	mkLog("Creando base de datos");
	
	tx.executeSql('DROP TABLE IF EXISTS articulos');
	
	var sql = "CREATE TABLE IF NOT EXISTS articulos ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"nombre VARCHAR(255), " +
		"foto VARCHAR(255), " +
		"descripcion VARCHAR(50), " +
		"precio INTEGER, " +
		"stock INTEGER, " +
		"categoria VARCHAR(50), " + 
		"fecha VARCHAR(30) )";
		
	tx.executeSql(sql);
	
	tx.executeSql("INSERT INTO articulos (nombre,descripcion,precio,stock,categoria,fecha) VALUES ('GTX 960','Tiene 2 GB de VRAM','4500','15','TDV','12/12/2016')");
}


function creaSuccess(){
	window.localStorage.setItem("existe_db", 1);
	cargaDatos();
}

function errorDB(err){
	mkLog("Error procesando SQL " + err.code);
	navigator.notification.alert("Error procesando SQL " + err.code);
}



/* 
* carga de datos desde la base de datos
*/
function cargaDatos(){
	db.transaction(cargaRegistros, errorDB);
}

function cargaRegistros(tx){
	mkLog("Cargando registros de la base de datos");
	tx.executeSql('SELECT * FROM articulos', [], cargaDatosSuccess, errorDB);
}

function cargaDatosSuccess(tx, results){
	mkLog("Recibidos de la DB " + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros");
		navigator.notification.alert("No hay clientes en la base de datos");
	}
	
	for(var i=0; i<results.rows.length; i++){
		var producto = results.rows.item(i);
		var selector = $("#lista_" + producto.categoria + " ul");
		var foto;
		if(producto.categoria=="TM")
		{
		foto = "images/mother.jpg";
		}

		if(producto.categoria=="TDV")
		{
		foto = "images/tarjetavideo.png";
		}

		if(producto.categoria=="Almacenamiento")
		{
		foto = "images/drive.png";
		}

		if(producto.categoria=="memorias")
		{
		foto = "images/ram.png";
		}
		if(producto.categoria=="monitores")
		{
		foto = "images/monitor.png";
		}

		selector.append('<li id="li_'+producto.id+'"><a href="#detalle" data-uid='+producto.id+' class="linkDetalles"><div class="interior_lista"><img src="'+ foto +'" class="img_peq"/><span>' + producto.nombre + '</span></div></a><a href="#form2"  data-theme="a" data-uid='+producto.id+'  class="linkForm">Predet.</a></li>').listview('refresh');
	}
	
	$(".linkDetalles").click(function(e){
		$.id = $(this).data("uid");
	});
	
	$(".linkForm").click(function(e){
		$.id = $(this).data("uid");
	});
}


/*
* vista detalle
*/

$(document).on("pagebeforeshow", "#detalle", function(){
	if(db != null){
		db.transaction(queryDBFindByID, errorDB);
	}
});


function queryDBFindByID(tx) {
    tx.executeSql('SELECT * FROM articulos WHERE id='+$.id, [], queryDetalleSuccess, errorDB);
}

function queryDetalleSuccess(tx, results) {
	mkLog("Recibidos de la DB en vista detalle" + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros para la vista detalle");
		navigator.notification.alert("No hay detalles para ese elemento");
	}
	
	$.registro = results.rows.item(0);
	var _foto;
	
		if ($.registro.categoria=="TDV")
		{
			$("#categoria").html("Tarjeta de vídeo");
			_foto = "images/tarjetavideo.png";
		}

		if ($.registro.categoria=="TM")
		{
			$("#categoria").html("Tarjeta madre");
			_foto = "images/mother.jpg";
		}
		if ($.registro.categoria=="monitores")
		{
			$("#categoria").html("Pantallas o Monitores");
			_foto = "images/monitor.png";
		}

		if ($.registro.categoria=="memorias")
		{
			$("#categoria").html("Memorias");
			_foto = "images/ram.png";
		}

		if ($.registro.categoria=="Almacenamiento")
		{
			$("#categoria").html("Almacenamiento");
			_foto = "images/drive.png";
		}

		
		

		
		
		
		
		$("#foto_img").attr("src", _foto);
		
		
		$("#nombre").html($.registro.nombre);
		$("#descripcion").html($.registro.descripcion);
		$("#precio").html($.registro.precio);
		$("#existencia").html($.registro.stock);
		$("#fecha").html($.registro.fecha);
	
}

/*
* vista detalle
*/
//vista de la página de edición
$(document).on('pagebeforeshow', '#form2', function(){ 
	mkLog('ID recuperado en vista form: ' + $.id);
	
	initForm();
	if(db != null && $.id != -1){
		db.transaction(queryDBFindByIDForm, errorDB);
	}
});

function queryDBFindByIDForm(tx) {
    tx.executeSql('SELECT * FROM articulos WHERE id='+$.id, [], queryFormSuccess, errorDB);
}

function queryFormSuccess(tx, results) {
	mkLog("Recibidos de la DB en vista Form" + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros para la vista form");
		navigator.notification.alert("No hay detalles para ese elemento");
	}
	
	$.registro = results.rows.item(0);
	
		$.imageURL = $.registro.foto;
		if($.imageURL == ""){
			$.imageURL = "assets/no_foto.png";
		}
		$("#fotoEdit_img2").attr("src", $.imageURL);
		$("#campoNombre2").val($.registro.nombre);
		$("#campoDescripcion2").val($.registro.descripcion);
		$("#campoPrecio2").val($.registro.precio);
		$("#campoStock2").val($.registro.stock);
		$("#campoFecha2").val($.registro.fecha);
		
		//$("#cat_"+$.registro.categoria).trigger("click").trigger("click");	

			$('#seleccionCategorias2').val($.registro.categoria)
		
}
$(document).on('pagebeforeshow', '#home', function(){ 
	$.id = -1;
});
function initForm(){
	$.imageURL = "assets/no_foto.png";
	
	$("#fotoEdit_img2").attr("src", $.imageURL);
	$("#campoNombre2").val("");
	$("#campoDescripcion2").val("");
	$("#campoPrecio2").val("");
	$("#campoStock2").val("");
		
	
}


/*
* modificando registros
*/
function saveEditForm(){
	if(db != null){
		db.transaction(queryDBUpdateForm, errorDB, updateFormSuccess);
	}
}

function queryDBUpdateForm(tx){
	var cat= $('#seleccionCategorias2').val();
	tx.executeSql('UPDATE articulos SET nombre="'+$("#campoNombre2").val()+'", descripcion="'+$("#campoDescripcion2").val()+'",precio="'+$("#campoPrecio2").val()+'",stock="'+$("#campoStock2").val()+'",categoria="'+cat+'", fecha="'+$("#campoFecha2").val()+'" WHERE id='+$.id);
}
function updateFormSuccess(tx) {
	var selector = $("#li_"+$.id);
	
	var selector = $("#li_"+$.id).clone(true);

	var cat= $('#seleccionCategorias2').val();
	var lista = $("#lista_" + cat + " ul")
	if (cat=="TDV")
	{
		selector.find("img").attr("src", "images/tarjetavideo.png");
	}
	

	if (cat=="TM")
	{
		selector.find("img").attr("src", "images/mother.jpg");
	}

	if (cat=="monitores")
	{
		selector.find("img").attr("src", "images/monitor.png");
	}

	if (cat=="Almacenamiento")
	{
		selector.find("img").attr("src", "images/drive.png");
	}

	if (cat=="memorias")
	{
		selector.find("img").attr("src", "images/ram.png");
	}

	selector.find("a:first").find("span").html($("#campoNombre2").val());
	
	
	$("#li_"+$.id).remove();
	
	
	lista.append(selector).listview('refresh');
	
	
	$.mobile.changePage("#home");
}


function deleteItem(){
	if(db != null){
		db.transaction(queryDBDetele, errorDB, updateFormSuccess2);
	}
}

function queryDBDetele(tx){
	
	tx.executeSql('DELETE FROM articulos WHERE id='+$.id);
}
function updateFormSuccess2(tx) {
	
	
	
	$.mobile.changePage("#home");
}



/*
* creando registros
*/
function saveNewForm(){
	if(db != null){
		db.transaction(queryDBInsertForm, errorDB);
	}
}

function queryDBInsertForm(tx){
	/*
	var cat=  $("#seleccionCategorias :selected").text() //the text content of the selected option
		$("#seleccionCategorias").val() 

		var e = document.getElementById("seleccionCategorias");
		var value = e.options[e.selectedIndex].value;
		var cat = e.options[e.selectedIndex].text;*/

	//var cat = $("#cajaCategorias").find("input:checked").val();
	var cat= $('#seleccionCategorias').val();
	tx.executeSql("INSERT INTO articulos (nombre,descripcion,precio,categoria, stock, fecha) VALUES ('"+$("#campoNombre").val()+"','"+$("#campoDescripcion").val()+"','"+$("#campoPrecio").val()+"','"+cat+"','"+$("#campoStock").val()+"', '"+$("#campoFecha").val()+"')", [], newFormSuccess, errorDB);
}
function newFormSuccess(tx, results) {
	/*var e = document.getElementById("seleccionCategorias");
		var value = e.options[e.selectedIndex].value;
		var cat = e.options[e.selectedIndex].text;*/
	//var cat = $("#cajaCategorias").find("input:checked").val();

	var cat= $('#seleccionCategorias').val();
	var lista = $("#lista_" + cat + " ul")
	var foto;

	if (cat=="TDV")
	{
		foto="images/tarjetavideo.png";
	}
	

	if (cat=="TM")
	{
		foto="images/mother.jpg";
	}

	if (cat=="monitores")
	{
		foto="images/monitor.png";
	}

	if (cat=="Almacenamiento")
	{
		foto="images/drive.png";
	}

	if (cat=="memorias")
	{
		foto="images/ram.png";
	}
	
	var obj = $('<li id="li_'+results.insertId+'"><a href="#detalle" data-uid='+results.insertId+' class="linkDetalles"><div class="interior_lista"><img src="'+ foto +'" class="img_peq"/><span>' + $("#campoNombre").val() + '</span></div></a><a href="#form2"  data-theme="a" data-uid='+results.insertId+'  class="linkForm">Predet.</a></li>');
	obj.find('.linkDetalles').bind('click', function(e){
		$.id = $(this).data('uid');
	});
	
	obj.find('.linkForm').bind('click', function(e){
		$.id = $(this).data('uid');
	});
	lista.append(obj).listview('refresh');
	
	
	$.mobile.changePage("#home");
}
