/*
 * Copyright (c) 2010, Christian Hartung
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Opera Software ASA nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY OPERA SOFTWARE ASA ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL OPERA SOFTWARE ASA BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Rotina utilitária para remover espaços do início e fim da string
 */
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

/**
 * Rotina utilitária para remover tags da string
 */
String.prototype.removeTags = function() {
	return this.replace(/<\/?[^>]+(>|$)/g, "");
}

/**
 * Simples API para pegar o cardápio do bandejão da FT/COTIL
 *
 * Versão 0.2
 *   Completa reestruturação, tornando-a mais independente
 * Versão 1.0
 *   Implementação inicial (e específica para o um widget http://widgets.opera.com/widget/10671/)
 *
 * Autor: Christian Hartung
 */
var CardapioBandeco = new function() {
	// Períodos possívels
	this.Periodos = {ALMOCO:1, JANTAR:2};

	this.Data = null;
	this.Periodo = 0;
	this.PratoPrincipal = "";
	this.Acompanhamento = "";
	this.Guarnicao = "";
	this.Salada = "";
	this.Sobremesa = "";

	this.LastError = "";

	// para não se confundir em funções internas
	var _self = this;

	function newEvent(name) {
		e = document.createEvent("Event");
		e.initEvent(name, true, false);
		document.dispatchEvent(e);
	}

	// Objeto para fazer as requisições
	var req = new XMLHttpRequest();

	/**
	 * Atualiza os valores
	 *
	 * Basicamente faz uma requisição ao site http://www.pfl.unicamp.br/cardapio.php e tenta parsear o resultado
	 *
	 * Se tudo correr bem, dispara um evento cardapioOk, senão, um evento cardapioFail
	 */
	this.refresh = function() {
		req.open("GET", "http://www.pfl.unicamp.br/cardapio.php", true);
		req.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
		req.send(null);
	}

	// A Data chega no formato "22 de Fevereiro de 2010"
	function ajustaData(text) {
		var meses = {janeiro:1,fevereiro:2,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12};
		var parts = text.split(' ');

		var dia = parts[0];
		var mes = meses[parts[2].toLowerCase().replace("ç", "c")];
		var ano = parts[4];

		_self.Data = new Date(ano + "/" + mes + "/" + dia);
	}

	function parse(texto) { 
		try {
			// Encontro o primeiro td, que é onde começa a data
			var tmp = texto.split("<td>")[1].trim();
			
			// Encontro onde fecha o td, que é onde termina o cardápio
			tmp = tmp.split("</td>")[0].trim();
			
			// Pega a data (está no meio de um div>
			var sep = tmp.split("</div>");
			ajustaData(sep[0].removeTags().trim());
			
			// Pega o período
			sep = sep[1].split("</center>");
			var per = sep[0].removeTags().replace(/#/g, "").trim();
			if(per.toLowerCase() == "jantar")
				_self.Periodo = _self.Periodos.JANTAR;
			else
				_self.Periodo = _self.Periodos.ALMOCO;
			
			// Pega outros valores
			sep = sep[1].split("<br>");
			sep.forEach(function(str) {
					var t = str.split("</strong>")
					var k = t[0].replace(/:/, "").removeTags().trim();
					var v = t[1].trim();
	
					if(k == "Acompanhamento")
						_self.Acompanhamento = v;
					else if(k == "Prato Principal")
						_self.PratoPrincipal = v;
					else if(k == "Guarnição")
						_self.Guarnicao = v;
					else if(k == "Salada")
						_self.Salada = v;
					else if(k == "Sobremesa")
						_self.Sobremesa = v;
					});
		} catch(e) {
			_self.LastError = e.message;
			return false;
		}

		return true;
	}

	// Incializa este objeto
	function init() {
		req.onreadystatechange = function() {
			if(req.readyState == 4) {
			       if(req.status == 200 && parse(req.responseText)) {
					newEvent("cardapioOk");
				}
				else {
					newEvent("cardapioFail");
				}
			}
		};
	}

	// Inicializa o objeto
	init();
} ();
