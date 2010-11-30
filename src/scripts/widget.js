// Onde inserir o conteúdo principal
var mainContent = null;
var loading = null;
var Data = null;
var Periodo = null;
var PratoPrincipal = null;
var Acompanhamento = null;
var Guarnicao = null;
var Salada = null;
var Sobremesa = null;

// Exibe a tela de loading
function showLoading() {
	window.status = "Obtendo informações";

	mainContent.style.display = "none";
	loading.style.display = "block";
}

// Exibe o conteúdo principal
function showMainContent() {
	window.status = null;

	mainContent.style.display = "block";
	loading.style.display = "none";
}

function dateToString(d) {
	ano = new String(d.getFullYear());

	mes = new String(d.getMonth() + 1);
	if(mes.length == 1) mes = "0" + mes;

	dia =new String(d.getDate());
	if(dia.length == 1) dia = "0" + dia;

	return dia + "/" + mes + "/" + ano;
}

function periodoToString(p) {
	if(p == CardapioBandeco.Periodos.JANTAR)
		return "Jantar";
	else
		return "Almoço";
}

// Tenta Carregar o cardápio
function getCardapio() {
	showLoading();

	if(CardapioBandeco == null)
		showError("Ops");

	try {
		CardapioBandeco.refresh();
	} catch(e) {
		showError(e.message);
	}
}

function showError(msg) {
	var s = "Erro ao obter informações:" + msg;
	window.status = s;
	widget.showNotification(s, callUserAttention);
}

function callUserAttention() {
	widget.getAttention();
}

window.addEventListener("load", function() {
		mainContent = document.getElementById("MainContent");
		loading = document.getElementById("Loading");
		Data = document.getElementById("Data");
		Periodo = document.getElementById("Periodo");
		PratoPrincipal = document.getElementById("PratoPrincipal");
		Acompanhamento = document.getElementById("Acompanhamento");
		Guarnicao = document.getElementById("Guarnicao");
		Salada = document.getElementById("Salada");
		Sobremesa = document.getElementById("Sobremesa");

		getCardapio();
		}, true);

window.addEventListener("cardapioOk", function() {
		Data.innerHTML = dateToString(CardapioBandeco.Data);
		Periodo.innerHTML = periodoToString(CardapioBandeco.Periodo);
		PratoPrincipal.ihnerText = CardapioBandeco.PratoPrincipal;
		Acompanhamento.innerHTML = CardapioBandeco.Acompanhamento;
		Guarnicao.innerHTML = CardapioBandeco.Guarnicao;
		Salada.innerHTML = CardapioBandeco.Salada;
		Sobremesa.innerHTML = CardapioBandeco.Sobremesa;

	       	showMainContent();
		
		widget.showNotification(dateToString(CardapioBandeco.Data) + " - " + periodoToString(CardapioBandeco.Periodo), callUserAttention);
		}, true);

window.addEventListener("cardapioFail", function() {
		showError(CardapioBandeco.LastError);
		}, true);
