$(document).ready(function () {
  var input, addinv, submit;
  input = $('#invno');
  addinv = $('#btn_addinvoice');
  submit = $('#btn_submit');
  input.on('keypress', function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#btn_addinvoice').click()
    }
  });
  $('#btn_addinvoice').on('click', function (event) {
    alert('Adding invoice ' + input.val());
    input.val('');
  });
});