var xhrTimeout=1000;
var url='http://olar.esy.es/';
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

if (localStorage.getItem("user_id") == null || localStorage.getItem("user_id") == 'null') 
      carregar_login();
    else{
      document.getElementById('cupons').innerHTML = '';
      carregar_cupons(0,1,0,0,"");
    }

$$(document).on('pageInit', function (e) {
    var page = e.detail.page;

    if (localStorage.getItem("user_id") === null && page.name != "cadastro") {
      mainView.router.back();
      carregar_login();
    }else{
        if(page.name === 'opiniao'){
          document.getElementById('prod1').checked = true;
          document.getElementById('atend1').checked = true;
        }

        if(page.name === 'index'){
          setTimeout(function (){carregar_cupons(0,1,0,0,"");},150);     
        }

        if(page.name === 'meus_cupons'){
          carregar_meus_cupons();
        }

        if(page.name === 'oferta'){
          detalhes_cupom(page.query.id,page.query.titulo,page.query.desconto,page.query.preco_normal,page.query.preco_cupom,page.query.prazo,page.query.quantidade,page.query.nome_fantasia,page.query.caminho);
        }

        if(page.name === 'opiniao'){
          detalhes_opiniao(page.query.id,page.query.titulo,page.query.desconto,page.query.preco_normal,page.query.preco_cupom,page.query.prazo,page.query.nome_fantasia,page.query.caminho);
        }

        if (page.name === 'perfil') {
          carregar_perfil();
        }
    }

});

var ptrContent = $$('.pull-to-refresh-content');
 
// Add 'refresh' listener on it
ptrContent.on('refresh', function (e) {
    // Emulate 2s loading
    carregar_cupons(0,1,0,0,"");
    myApp.pullToRefreshDone();
});

$$('.infinite-scroll').on('infinite', function () {

});

function cadastro(){
  if(document.getElementById("cad_senha").value == document.getElementById("cad_senha2").value && document.getElementById("cad_nome").value.length > 2 && document.getElementById("cad_email").value.length > 2 && document.getElementById("cad_senha").value.length > 2 && document.getElementById("cad_senha2").value.length > 2  && document.getElementById("cad_telefone").value.length > 2 && document.getElementById("cad_nasc").value.length > 2 )
    {  
      myApp.showPreloader("Realizando cadastro...");
      setTimeout(function () {
        var adduser = ajax_method(false,'usuario.insert',document.getElementById("cad_nome").value,document.getElementById("cad_email").value,document.getElementById("cad_senha").value,document.getElementById("cad_telefone").value,document.getElementById("cad_genero").value,document.getElementById("cad_nasc").value);
        myApp.hidePreloader();
        if(adduser != 0)
        {
          localStorage.setItem("user_id",adduser);
          mainView.router.back();
          setTimeout(function () {
          location.reload();},50);
        }
        else{
          myApp.alert("Seu perfil não pôde ser criado, reveja suas informações ou sua conexão por favor.");
        }
        myApp.hidePreloader();
      },500);
    }
    else{
      myApp.alert("Senhas não correspondem ou campo deixado em branco!");
    }
}

function avaliar(id){
  json_dados = ajax_method(false,'usuario.avaliar',id,pegar_valor(document.getElementsByName('produto')),pegar_valor(document.getElementsByName('atendimento')),pegar_valor(document.getElementsByName('ambiente')),document.getElementById('comentario').value);
  if (json_dados){
    myApp.alert("Avaliação enviada com sucesso. Obrigado");
    mainView.router.back();
    setTimeout(function (){mainView.router.refreshPage();},150);
    
  }else{
    myApp.alert("Não foi possível enviar sua avaliação, tente novamente.");
  }
}

function pegar_valor(campo){
  for (var i = 0, length = campo.length; i < length; i++) {
      if (campo[i].checked) {
          return (campo[i].value);
      }
  }
}

function carregar_cupons(ultimo_carregado, cidade_id, delivery,pagamento,tipo_id){
  myApp.showPreloader();
  if (ultimo_carregado == 0) 
    document.getElementById('cupons').innerHTML = ' ';
  setTimeout(function () {
    json_dados = ajax_method(false,'usuario.select_cupons',localStorage.getItem("user_id"),cidade_id,delivery,pagamento,tipo_id,ultimo_carregado);
    var cupons = JSON.parse(json_dados);

    for (i = 0; i < cupons.length ; i++) {

      desconto = Math.round(100 - (cupons[i].preco_cupom * 100 / cupons[i].preco_normal));

      cupons[i].preco_cupom  =  parseFloat(cupons[i].preco_cupom).toFixed(2);

      cupons[i].preco_normal  =  parseFloat(cupons[i].preco_normal).toFixed(2);

      document.getElementById('cupons').innerHTML += '<div class="card facebook-card" style="margin:0; margin-top:10px;">'+
                                                        '<div class="card-header no-border" style="padding-bottom: 1px;">'+
                                                          '<div class="facebook-name" style="font-size: 18px; color: black; font-family: tahoma;font-weight: bold">'+cupons[i].titulo+'</div>'+
                                                       ' </div>'+
                                                           '<div class="facebook-name" style="margin-left: 15px;">'+cupons[i].nome_fantasia+'</div>'+
                                                        '<div class="card-content"><a href="oferta.html?id='+cupons[i].id+'&titulo='+cupons[i].titulo+'&desconto='+desconto+'&preco_normal='+cupons[i].preco_normal+'&preco_cupom='+cupons[i].preco_cupom+'&prazo='+cupons[i].prazo+'&quantidade='+cupons[i].quantidade+'&nome_fantasia='+cupons[i].nome_fantasia+'&caminho=http://www.olar.esy.es/'+cupons[i].caminho+'"><img src="http://www.olar.esy.es/'+cupons[i].caminho+'" width="100%">'+
                                                          '<div style="position:absolute; right: 20px; z-index: 999999;top: 10px;color: white; background-color: rgba(255, 0, 0,0.85); padding: 10px; border-radius: 5px; font-weight: bold; ">'+
                                                            '<i class="fa fa-ticket"></i> '+cupons[i].quantidade+
                                                            '</div>'+
                                                            '</a>'+
                                                      '  </div>'+
                                                        '<div class="card-footer no-border">'+
                                                         ' <p style="font-size: 15px;color: coral;">'+desconto+'% off</p>'+
                                                          '<center><diva style="font-size: 20px;color: #007aff;">R$'+cupons[i].preco_cupom+'</diva><br><s>R$'+cupons[i].preco_normal+'</s></center>'+
                                                          '<a href="oferta.html?id='+cupons[i].id+'" class="link" style="font-size: 23px;"><i class="fa fa-cart-arrow-down"></i></a>'+
                                                        '</div>'+
                                                     ' </div>';
      }    

      myApp.hidePreloader();
  },100);
}

function carregar_meus_cupons(){
  myApp.showPreloader();
  setTimeout(function () {
    json_dados = ajax_method(false,'usuario.select_historico',localStorage.getItem("user_id"));
    var cupons = JSON.parse(json_dados);
    document.getElementById('meus_cupons_historico').innerHTML = ' ';
    var batatinea = ' ';
    var last = ' ';
    var lucro = 0;

    for (i = 0;i < cupons.length ; i++) {

      if (cupons[i].data_resgate != last) {
          last = cupons[i].data_resgate;
          dat = NData(cupons[i].data_resgate);
          batatinea +=  '<div class="content-block-title" ><i class="fa fa-calendar"></i> '+dat+'</div>';
      }

      desconto = Math.round(100 - (cupons[i].preco_cupom * 100 / cupons[i].preco_normal));

      batatinea +=   '<div class="card">'+
                                                                       '<div class="card-content">'+
                                                                         '<div class="list-block media-list">'+
                                                                            '<ul>'+
                                                                              '<li>';
      if (cupons[i].estado == -1)
        batatinea += '<a href="#" class="item-content item-link" style="border-left: thick solid #FF0000;">'; 
      if (cupons[i].estado == 0) 
        batatinea += '<a href="#" class="item-content item-link" style="border-left: thick solid #007aff;">';
      if (cupons[i].estado == 1) {
        batatinea += '<a href="opiniao.html?id='+cupons[i].id+'&titulo='+cupons[i].titulo+'&desconto='+desconto+'&preco_normal='+cupons[i].preco_normal+'&preco_cupom='+cupons[i].preco_cupom+'&prazo='+cupons[i].prazo+'&nome_fantasia='+cupons[i].nome_fantasia+'&caminho=http://www.olar.esy.es/'+cupons[i].caminho+'" class="item-content item-link" style="border-left: thick solid #FFa500;">';
        lucro += cupons[i].preco_normal - cupons[i].preco_cupom;
      }
      if (cupons[i].estado == 2) {
        batatinea += '<a href="#" class="item-content item-link" style="border-left: thick solid #00FF00;">';
        lucro += cupons[i].preco_normal - cupons[i].preco_cupom;
      }

      batatinea +=                                                     '<div class="item-inner">'+
                                                                        '<div class="item-title-row">'+
                                                                          '<div class="item-title">'+cupons[i].titulo+'</div>'+
                                                                        '</div>'+
                                                                        '<div class="item-subtitle">'+cupons[i].nome_fantasia+'</div>'+
                                                                      '</div>'+
                                                                    '</a>'+
                                                                  '</li>'+
                                                                '</ul>'+
                                                              '</div>'+
                                                           ' </div>'+
                                                            '<div class="card-footer">'+
                                                              '<span>'+desconto+'% Off</span>';
      if (cupons[i].estado == -1)
        batatinea += '<span>Cupom Não utilizado</span>';
      if (cupons[i].estado == 0)
        batatinea += '<span>Cupom aguardando resgate</span>';
      if (cupons[i].estado == 1)
        batatinea += '<span>Avaliação pendente</span>';
      if (cupons[i].estado == 2)
        batatinea += '<span>Cupom Finalizado</span>';

      batatinea +=                                                       '</div>'+
                                                                       '</div>';
    }   
    document.getElementById('meus_cupons_historico').innerHTML = batatinea;
    document.getElementById('economia').innerHTML = 'Você já economizou R$'+parseFloat(lucro).toFixed(2);
  myApp.hidePreloader();
},100);
}

function novaData(n) {
  this.length = n
  return this
}
NMes = new novaData(12)
NMes[1] = "Janeiro"
NMes[2] = "Fevereiro"
NMes[3] = "Março"
NMes[4] = "Abril"
NMes[5] = "Maio"
NMes[6] = "Junho"
NMes[7] = "Julho"
NMes[8] = "Agosto"
NMes[9] = "Setembro"
NMes[10] = "Outubro"
NMes[11] = "Novembro"
NMes[12] = "Dezembro"
DDias = new novaData(7)
DDias[1] = "Domingo"
DDias[2] = "Segunda"
DDias[3] = "Terça"
DDias[4] = "Quarta"
DDias[5] = "Quinta"
DDias[6] = "Sexta"
DDias[7] = "Sábado"

function NData(data) {
  cDate = new Date(data)
  var Dia = DDias[cDate.getDay() + 1]
  var Mes = NMes[cDate.getMonth() + 1]
  msie4 = ((navigator.appName == "Microsoft Internet Explorer")
        && (parseInt(navigator.appVersion) >= 4 ));
  if (msie4) {
      var ano = cDate.getYear()
  }
  else {
       var ano = cDate.getYear() +1900
  }
  return Dia + ", " + cDate.getDate() + " de " + Mes + " " +  " de " + ano
}

function carregar_login(){
  $$("#ba").hide();
  document.getElementById('peige').innerHTML = '<div data-page="login-screen" class="page no-navbar">'+
                                                '<div class="page-content login-screen-content" style="background-image:url(\'img/pancue.jpg\');background-size: 100%">'+
                                                '<div style="padding-bottom: 5px; max-width: 480px; margin: auto;">'+
                                                  '<div class="login-screen-title" style="margin: 25px auto; "><img src="img/logo.png" width="150px"></div>'+
                                                    '<div class="list-block">'+
                                                      '<ul>'+
                                                        '<li class="item-content" style="padding-right: 15px;">'+
                                                          '<div class="item-inner" style="padding-right: 0;">'+
                                                              '<div class="item-input transp">'+
                                                                '<input type="email" name="login_email" id="login_email" placeholder="Email" required style="padding-left: 10px; color: white">'+
                                                              '</div>'+
                                                          '</div>'+
                                                        '</li>'+
                                                        '<li class="item-content" style="padding-right: 15px;">'+
                                                          '<div class="item-inner" style="padding-right: 0;">'+
                                                              '<div class="item-input transp">'+
                                                                '<input type="password" name="login_senha" id="login_senha" placeholder="Senha" required style="padding-left: 10px; color: white">'+
                                                              '</div>'+
                                                          '</div>'+
                                                        '</li>'+
                                                      '</ul>'+
                                                    '</div>'+
                                                    '<div class="list-block-label" style="padding-left:15px;padding-right:15px;">'+
                                                        '<p><a onclick="login();" class="button button-fill color-orange">Entrar</a></p>'+
                                                        '<p><a href="cadastrar.html" class="">Não possui cadastro? Clique aqui</a></p>'+
                                                        '<p><a href="#" class="link">Esqueceu sua senha?</a></p>'+
                                                    '</div>'+
                                                    '</div>'+
                                                  '</div>'+
                                                '</div>'+
                                                '</div>'+
                                              '</div>';
}

function detalhes_opiniao(id,nome,desconto,preco_ini,preco_desc,prazo,empresa,imagem){
 myApp.showPreloader();
  setTimeout(function () {
    json_dados = ajax_method(false,'usuario.select_detalhes_cupom',id);
    if(json_dados){
      var cupom = JSON.parse(json_dados);
      set_inner("opiniao_empresa",empresa);
       document.getElementById('opiniao_imagem').setAttribute("src", imagem);
       set_inner("opiniao_desconto",'<i class="fa fa-cart-arrow-down" style="font-size: 20px;"></i> &nbsp&nbsp'+desconto+'% off');
       set_inner("opiniao_titulo",nome);
       set_inner("opiniao_precos",'Por: R$'+parseFloat(preco_desc).toFixed(2)+' &nbsp<s style="color:gray">De: R$'+parseFloat(preco_ini).toFixed(2)+'</s>');
       document.getElementById('botao_avaliar').setAttribute("onclick", "avaliar("+id+")");
    }else{
      myApp.alert("Não foi possível carregar os detalhes do cupom. Tente novamente.");
    }
    myApp.hidePreloader();
  },100);
}

function detalhes_cupom(id,nome,desconto,preco_ini,preco_desc,prazo,quantidade,empresa,imagem){
  myApp.showPreloader();
  setTimeout(function () {
    json_dados = ajax_method(false,'usuario.select_detalhes_cupom',id);
    if(json_dados){
      var cupom = JSON.parse(json_dados);
            for (i = 0; i < cupom.tipos.length; i++) {
              //document.getElementById('tipos').innerHTML += '<div class="chip"><div class="chip-label">'+cupom.tipos[i].nome+'</div></div>';
            }
      set_inner("empresa_oferta",empresa);
       document.getElementById('img_oferta').setAttribute("src", imagem);
       set_inner("desconto_cupom",desconto+'% off');
       set_inner("nome_cupom",nome);
       set_inner("precos_cupom",'Por: R$'+preco_desc+' &nbsp<s style="color:gray">De: R$'+preco_ini+'</s>');
       set_inner("info_cupom",'<i class="fa fa-ticket"></i> '+quantidade+' Restantes<br><i class="fa fa-calendar"></i> Válido até'+prazo);
       set_inner("desc_cupom",'<p>'+cupom.detalhes.descricao+'</p>');
       set_inner("regras_cupom",'<p>'+cupom.detalhes.regras+'</p>');
       set_inner("empresa_cupom",empresa); 
       document.getElementById('telefone_cupom').setAttribute("onclick", "window.open('tel:"+cupom.detalhes.telefone+"', '_system');");
       document.getElementById("endereco_cupom").setAttribute("onclick", "window.open('http://maps.apple.com/?q=loc:"+cupom.detalhes.latitude+","+cupom.detalhes.longitude+"', '_system');");

       json_dados = ajax_method(false,'usuario.select_historico',localStorage.getItem("user_id"));
       var permite = JSON.parse(json_dados);

       var ok = true;
       for (i = 0; i < permite.length; i++) {
         if (permite[i].cupom_id == id)
            ok = false;
       }

     if (ok) {
      if (cupom.detalhes.estado == 0) {
        document.getElementById('botao_cupom').setAttribute('onclick',"pegar_cupom("+id+");");
       }else{
        document.getElementById('botao_cupom').innerHTML = '<i class="fa fa-delete" style="font-size: 20px;"></i> &nbsp&nbspCupom Fora de Aquisição';
        document.getElementById('botao_cupom').setAttribute('disabled'," ");
        document.getElementById('botao_cupom').setAttribute('class',"button button-fill color-red bttnb");
       }
     }else{
      document.getElementById('botao_cupom').innerHTML = '<i class="fa fa-cart-arrow-down" style="font-size: 20px;"></i> &nbsp&nbspCupom Adquirido';
      document.getElementById('botao_cupom').setAttribute('disabled'," ");
      document.getElementById('botao_cupom').setAttribute('class',"button button-fill color-orange bttnb");
     }

    }else{
      myApp.alert("Não foi possível carregar os detalhes do cupom. Tente novamente.");
    }
    myApp.hidePreloader();
  },100);
}

function login()
{
  var email = document.getElementById("login_email").value;
  var senha = document.getElementById("login_senha").value;
  var id = 0 ;

  myApp.showPreloader();
  setTimeout(function () {
    id = ajax_method(false,'usuario.login',email,senha);

    if (id != 0 && id != null && id != 'null')
    {
      localStorage.setItem("user_id",id);
      $$("#ba").show();
      location.reload();
    }
    else
    {
        myApp.alert("Email ou senha não correspondem!");
    }
    myApp.hidePreloader();
  },100);
}

function logout() {
  localStorage.removeItem("user_id");
  mainView.router.back();
  carregar_login();
}

function alterar_senha(){
  myApp.showPreloader();
  setTimeout(function () {
    if (document.getElementById('usuario_senha1').value == document.getElementById('usuario_senha2').value){
      json_dados = ajax_method(false,'usuario.update_senha',localStorage.getItem("user_id"),document.getElementById('usuario_senha_antiga').value,document.getElementById('usuario_senha1').value);
      if (!json_dados){
        myApp.hidePreloader();
        myApp.alert("Não foi possível alterar sua senha, verifique os dados e tente novamente");
      }
      else{
        myApp.hidePreloader();
        myApp.alert("Senha alterada com sucesso!");
      }
    }
    else{
      myApp.hidePreloader();
      myApp.alert("Senhas não conferem");
    }
  },100);
}

function carregar_perfil(){
  myApp.showPreloader();
  setTimeout(function () {
      if (localStorage.getItem("user_id") == null) {
        myApp.hidePreloader();
        myApp.alert("Você nao realizou login, por favor, faça-o");
      }else{
        json_dados = ajax_method(false,'usuario.select_perfil',localStorage.getItem("user_id"));
        if (!json_dados) {
          myApp.hidePreloader();
          myApp.alert("Não foi possível carregar o seu perfil, por favor, tente novamente.");
        }else{
          var perfil = JSON.parse(json_dados);
          document.getElementById("user_nome").value = perfil.nome;
          document.getElementById("user_email").value = perfil.email;
          document.getElementById("user_telefone").value = perfil.celular;
          document.getElementById("user_genero").value = perfil.genero;
          document.getElementById("user_nasc").value = perfil.nascimento;
          myApp.hidePreloader();
        }
      }
  },100);
}

function alterar_perfil(){
  myApp.showPreloader();
  setTimeout(function () {
      if (localStorage.getItem("user_id") == null) {
        myApp.hidePreloader();
        myApp.alert("Você nao realizou login, por favor, faça-o");
      }else{
        json_dados = ajax_method(false,'usuario.update_perfil',localStorage.getItem("user_id"),document.getElementById("user_nome").value,document.getElementById("user_telefone").value,document.getElementById("user_genero").value,document.getElementById("user_nasc").value);
        if (!json_dados) {
          myApp.hidePreloader();
          myApp.alert("Não foi possível alterar o seu perfil, por favor, tente novamente.");
        }else{
          myApp.alert("Seu perfil foi alterado com sucesso.");
          myApp.hidePreloader();
        }
      }
  },100);
}

function get_elemento(id){
    return document.getElementById(id);
}

function get_value(id){
    return document.getElementById(id).value;
}

function set_value(id,valor){
   document.getElementById(id).value = valor;
}

function set_inner(id,valor){
   document.getElementById(id).innerHTML = valor;
}

function pegar_cupom(id){
    json_dados = ajax_method(false,'usuario.pegar_cupom',localStorage.getItem("user_id"),id);
    if (json_dados) {
      myApp.alert("Cupom ativado, boas compras!");
      mainView.router.back();
    }else{
      myApp.alert("Não foi possível pegar este cupom, tente novamente.");
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
