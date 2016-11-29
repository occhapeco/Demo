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

    if(page.name === 'perfil'){
      //alert("batatatatata");
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
  navigator.notification.confirm(
        'You are the winner!', // message
         onConfirm,            // callback to invoke with index of button pressed
        'Game Over',           // title
        ['Restart','Exit']         // buttonLabels
    );
});