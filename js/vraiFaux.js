
// - - - - - - V A R I A B L E S - - - - - - - - 

var etat = 'accueil';
var datacop ;
var nbRepVrai = 0;
var nbRepFausses = 0;
var nbRepVMax = 0;
var moyenne = 0;
// Variable d'état de l'application.
// Peut prendre les valeurs : 'accueil', 'chargement', 'info', 'jeu', 'resultats', 'correction', 'fin'.
// Elle détermine ce qui doit être affiché ou pas (voir le template)

var stats = {loc: {}, theme: {}, glob : {} }; // différentes contextes de stats

// pour les bonus:
var combo = 0; // barre de combo : nb de réponses correctes depuis la dernière faute
var bonus = {total:0,liste:[],html:""}; // infos sur les bonus

var nbQuestions = 1; // nb de questions à afficher dans chaque partie
var data = []; // le pointeur vers l'objet courant contenant les questions, 
var themes = []; // le tableau qui contient les thèmes
var t = {"nom":"","info":"","data":[]}; // le thème choisi
var c = "loc"; // contexte actuel d'affichage de stats, peut aussi valoir "theme"

var liste = []; // longueur nbQuestions, la liste des numéros des questions posées à chaque partie
var resultatsLoc = []; // longueur idem, valeurs 1, 0 ou -1 suivant le résultat 


// - - - - - - F O N C T I O N S - - - - - - - - 


function choisirTheme(nom){ // lorsqu'on clique sur un thème dans le menu

	nbQuestions=1; // si ça a changé à la fin du thème précédent
	if(themes[nom]==undefined){// le thème n'est pas encore chargé
		etat="chargement";
		actualiserAffichage(); // afficher l'écran de chargement
		$.get('data/' + nom + '.json', function (d) {
			// création et affectation d'un objet 'theme' vide:
			themes[nom]= {"nom":nom, "info":"", "data":{}};
			if($.type(d[0]) === "string")
				themes[nom].info=d.splice(0,1);
			themes[nom].data=d;//remplissage avec les données:
			demarrerTheme(nom);
		},"json"); //getJSON ne marche pas, pb de callback  ?... 
		
	} else {// le thème est déjà chargé
		demarrerTheme(nom);
	}
	
	
}


function demarrerTheme(nom){
	t = JSON.parse(JSON.stringify(themes[nom])); //duplication du thème
	data=t.data; //data contient les données
	datacop = data;
	for (let index = 0; index < data.length; index++) {
		data[0].answers
		for (let k = 0; k < data[index].answers.length; k++) {
			if (data[index].answers[k].correct) {
				nbRepVMax++
			}
		}
	}
	console.log(nbRepVMax);
	console.log("Le thème "+nom+" contient "+data.length+" questions");
	liste=[]; // nettoyer la liste d'un éventuel thème précédent
	reinitialiser(stats['theme']);
	if(t.info!=""){
		etat="info";
		actualiserAffichage();
		actualiserMathJax(); // au cas où il y a des maths dans un exemple ou dans les consignes
	}else{
		nouvellePartie();
	}
}
function test(index){
	
	if( $('#rep'+index).is(':checked') ){
		$('#rep'+index).prop('checked', false);
		
	}else{
		$('#rep'+index).prop('checked', true);
	}


	console.log($('#rep'+index).is(':checked'))
	if( $('#rep'+index).is(':checked') ){
		console.log("oui")
		$('.card-'+index).css("background-color", "yellow");

	}else{
		$('.card-'+index).css("background-color", "white");
	}


	

}

function nouvellePartie(){
		
		$( ".card" ).remove("");
		
		
	c="loc";
	reinitialiser(stats['loc']);
	if(nbQuestions>data.length){ // s'il reste trop peu de questions
		nbQuestions=data.length;
	}
	liste=sousListe(nbQuestions,data.length); // choisir les questions de cette partie dans le thème
	console.log('il reste '+data.length+'questions. Choix : '+liste);
	
	$('#vf tr').each(function(){ if($(this).attr('id')!='tr-modele') $(this).remove();}); // vide tout sauf le modèle
	
	var quest=$('#tr-modele').clone().insertAfter('#tr-modele').toggle(true);
	quest.find('.question').html(data[liste[0]].question); // lier du latex ne passe pas bien avec l'eval
	if(data[liste[0]].comment != undefined){
		quest.find('.commentaire').html(data[liste[0]].comment);
	} else{
		quest.find('.affichageCommentaire').remove();
	}
	quest.find('input').attr('name','q'+0);
	quest.find("*[id]").andSelf().each(function() { $(this).attr("id", $(this).attr("id") + 0); });
		

	etat="jeu";
	var rep ='';
		var textrep = '';
		for (let index = 0; index < data[liste[0]].answers.length; index++) {
			textrep = ' ' + data[liste[0]].answers[index].value
			//var info = (typeof data[liste[0]].type == 'undefined' ? 'checkbox' : 'radio');
			rep = rep + '<div class="card card-'+index+'" ><label><div class="card-body" id="' + index + '" >' + textrep + '<input class="secondary-content" style="opacity:0" type="checkbox" id="rep'+ index +'" onclick="test('+index+')"></label></div> </div>' ;
			
		}

		
		$( ".card-flex" ).append(rep);
	
	actualiserAffichage();
	actualiserMathJax();
}

function resultats(){
	var tabRep = [];
	for (let index = 0; index < data[liste[0]].answers.length; index++) {
		if( $('#rep'+index).is(':checked') ){
			tabRep.push('#rep'+index)
		}
	}

	
	for (let index = 0; index < data[liste[0]].answers.length; index++) {
		if(data[liste[0]].answers[index].correct){
			for(var i=0; i<tabRep.length; i++) {
				if('#rep'+index === tabRep[i]) {
					console.log('Il a bon');
					nbRepVrai++;
				}
			}
		}else{
			for(var i=0; i<tabRep.length; i++) {
				if('#rep'+index === tabRep[i]) {
					console.log('Il a faux');
					nbRepFausses++;
				}
			}
		}
	}
	moyenne = ((nbRepVrai - nbRepFausses) / nbRepVMax) * 20; 
	moyenne = Math.round(moyenne);
	if (moyenne < 0) {
		moyenne = 0;
	}
	// CODER L'Affichage du résultat


	data.splice(liste[0], 1);
	etat="resultats";
	resultatsLoc=[];

	actualiserStats();


	actualiserBonus();
	if (data.length == 0){
		actualiserAffichage();
	}else{
		nouvellePartie();
	}
}

function modifier(){
	etat="jeu";
	reinitialiser(stats['loc']);
	actualiserAffichage();
}

function correction(){
	actualiserAffichage();
	actualiserMathJax();
}

function fin(){ // Calcul des bonus de fin et affichage des stats de fin :
	actualiserBonus();
	actualiserAffichage();
}
// - - - -   A C T U A L I S A T I O N   A F F I C H A G E - - - - 

function actualiserAffichage(){
	actualiserStats(); //d'abord, et ensuite, l'affichage:
	$(".sync").each(function(){
		if(typeof($(this)[$(this).data('action')])=='function'){
			$(this)[$(this).data('action')](eval($(this).data('param')));
		}// l'eval est un peu moche mais bon
	});
}
function actualiserMathJax(){
	if(typeof(MathJax)!= 'undefined') {// si MathJax est chargé, on relance le rendu
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	} else { // sinon, on le recharge et on relance le rendu en callback
		$.getScript('https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML', function() {
    	MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
		});
	}
}
function basculerStatsGlobales(){// afficher/masquer la boite de dialogue de stats globales
	actualiserStats();
	actualiserAffichage(); // l'affichage
	$('#modalStats').modal('toggle');
}
// - - - -   A C T U A L I S A T I O N   D E   D O N N E E S  - - - - 

function actualiserStats(){

}

function actualiserBonus(){

}

function reinitialiser(pp){
		pp.debut=new Date(),
		pp.repJustes=0;
		pp.repFausses=0;
		pp.repNeutres=0;
		pp.rep=0;
		pp.note=0;
		pp.points=0;
		pp.temps=0;
		pp.efficacite=0;
}
// - - - - - - - - - - - - - - - - - - - - - - - - -

function sousListe(a,b){
	// retourne un tableau de longueur a
	//contenant des nombres entre 0 et b-1 différents
	// (ordonnés aléatoirement)
	var r=[]; //tableau à retourner
	var tab=[]; //tableau contenant les nombres de 0 à b dans l'ordre.
	for(var i=0;i<b;i++){
		tab[i]=i;
	}
	while(r.length<a){
		r.push(tab.splice(Math.floor(Math.random()*tab.length),1)[0]);
	}
	return r;
}
// - - - - - - - - - - - - - - - - - - - - - - - - -

function demarrage(){
	
	for(var c in stats) { // initialisation
		reinitialiser(stats[c]);
	}
	// --- FONT-AWESOME
  	$("head").append($("<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css' type='text/css' media='screen' />"));
	// --- MATHJAX
	$('#accueil').append('<span id="secret" style="visibility:hidden">Test MathJax: $\\int_{\\mathbb R} e^{-x^2} dx = \\sqrt\\pi$.<br></span>'); // formule mathématique invisible
	actualiserMathJax(); //chargement et rendu du test invisible
	// --- compteur (masqué) :
	$('#secret').append('<img src="compteur.php" width="2" height="2">');
}
