var xhrTimeout=1000;
var url='http://noxgames.com.br/service/';
var urn = 'urn:service';

var myApp = new Framework7({
  pushState: true,
  animatePages: true,
  swipeBackPage: true,
  modalTitle: "Demo",
  modalButtonCancel: "Cancelar",
  modalPreloaderTitle: "Carregando...",
  smartSelectBackText: 'Voltar',
  smartSelectPopupCloseText: 'Fechar',
  smartSelectPickerCloseText: 'Definir',
  preloadPreviousPage : false,
  uniqueHistory : true,
  modalCloseByOutside : true,
  popupCloseByOutside : true,
  actionsCloseByOutside : true
});
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

$$(document).on('pageInit', function (e) {
    var page = e.detail.page;

    if(page.name === 'opiniao'){
      document.getElementById('geral1').checked = true;
      document.getElementById('prod1').checked = true;
      document.getElementById('atend1').checked = true;
    }

});

var ptrContent = $$('.pull-to-refresh-content');
 
// Add 'refresh' listener on it
ptrContent.on('refresh', function (e) {
    // Emulate 2s loading
    setTimeout(function () {
      myApp.pullToRefreshDone();
    },2000);
});

$$('.infinite-scroll').on('infinite', function () {

});

function carregar_cupons(ultimo_carregado, cidade_id, delivery,pagamento,tipo_id){
    json_dados = ajax_method(false,'usuario.select_cupons',localStorage.getItem("user_id"),cidade_id,delivery,pagamento,tipo_id);
    var cupons = JSON.parse(json_dados);

    for (i = 0;cupons.length ; i++) {

      desconto = Math.round(100 - (cupons[i].preco_cupom * 100 / cupons[i].preco_normal));

      document.getElementById('cupons').innerHTML += '<div class="card facebook-card">'+
                                                        '<div class="card-header no-border" style="padding-bottom: 1px;">'+
                                                          '<div class="facebook-name" style="font-size: 18px; color: black; font-family: tahoma;font-weight: bold">Pizza grande + potatos</div>'+
                                                       ' </div>'+
                                                           '<div class="facebook-name" style="margin-left: 15px;">'+cupons[i].nome_fantasia+'</div>'+
                                                        '<div class="card-content"><a href="oferta.html"><img src="img/pizza.jpg" width="100%">'+
                                                          '<div style="position:absolute; right: 20px; z-index: 999999;top: 10px;color: white; background-color: rgba(255, 0, 0,0.85); padding: 10px; border-radius: 5px; font-weight: bold; ">'+
                                                            '<i class="fa fa-ticket"></i> '+cupons[i].quantidade+
                                                            '</div>'+
                                                            '</a>'+
                                                      '  </div>'+
                                                        '<div class="card-footer no-border">'+
                                                         ' <p style="font-size: 15px;color: coral;">'+desconto+'% off</p>'+
                                                          '<center><diva style="font-size: 20px;color: #007aff;">R$'+cupons[i].preco_cupom +'</diva><br><s>R$'+cupons[i].preco_normal+'</s></center>'+
                                                          '<a href="oferta.html?id='+cupons[i].id+'" class="link" style="font-size: 23px;"><i class="fa fa-cart-arrow-down"></i></a>'+
                                                        '</div>'+
                                                     ' </div>';
      }    
}

function ajax_method()
{
  var method = arguments[1];
  var sync = arguments[0];

  var retorno = null;

  var soapMessage ='<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:tns="'+urn+'"> <SOAP-ENV:Body><tns:'+method+' xmlns:tns="'+urn+'">';
  for (var i = 2; i < arguments.length; i++)
    soapMessage += '<input'+i+' xsi:type="xsd:string">'+arguments[i]+'</input'+i+'>';
  
  soapMessage += '</tns:'+method+'></SOAP-ENV:Body></SOAP-ENV:Envelope>';

  if(window.XMLHttpRequest) {
      httpRequest = new XMLHttpRequest();
  }
  else if (window.ActiveXObject) { 
    httpRequest = new ActiveXObject("Microsoft.XMLHTTP"); 
  }
  httpRequest.open("POST",url,sync);
  httpRequest.withCredentials = true;
  if (httpRequest.overrideMimeType) { 
    httpRequest.overrideMimeType("text/xml"); 
  }

  httpRequest.onreadystatechange = function (){
    if((httpRequest.readyState == 4) && (httpRequest.status==200))
    {
      clearTimeout(xhrTimeout);

      var parser = new DOMParser();
      var responseDoc = parser.parseFromString(httpRequest.responseText, "text/html");
      var json_dados = responseDoc.getElementsByTagName("return")[0].childNodes[0].nodeValue;
      retorno = json_dados;
    }
  };

  httpRequest.setRequestHeader("Man","POST "+url+" HTTP/1.1")       

  httpRequest.setRequestHeader("MessageType", "CALL");

  httpRequest.setRequestHeader("Content-Type", "text/xml");

  httpRequest.send(soapMessage);

  return retorno;
}

function login()
{
  var email = document.getElementById("login_email").value;
  var senha = document.getElementById("login_senha").value;
  var id = null;

  myApp.showPreloader();
  setTimeout(function () {
    id = ajax_method(false,'login',email,senha);

    if (id != 0)
    {
      localStorage.setItem("user_id",id);
    }
    else
    {
        myApp.alert("Email ou senha não correspondem!");
    }
    myApp.hidePreloader();
    mainView.refreshPage();
  },100);
}

function logout() {
  localStorage.removeItem("login_id");
  mainView.router.back();
}
