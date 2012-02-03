// Client side functionality for enter invoice page
$(document).ready(function () {
  var input, addinv, submit;

  input = $('#invno');
  addinv = $('#btn_addinvoice');
  submit = $('#btn_submit');
  input.on('keypress', function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#btn_addinvoice').click();
    }
  });
  $('#btn_addinvoice').on('click', function () {
    $.post('/enter/post', {invno: input.val()}, function (data) {
      alert(data);
    }).error(function (obj,text,err) {alert(err);});
    input.val("");
  });
});