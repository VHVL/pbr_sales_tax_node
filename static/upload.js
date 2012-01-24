$(document).ready(function () {
  now.addInvoice = function (msg) {
    $('#invoices').append('<br>' + msg);
  };

  now.addStatus = function (msg) {
    $('#status').append('<br>' + msg);
  };

  // put in a little delay here to make sure everything gets synced up.
  setTimeout(function () {
    now.parseFile($('#xmlfile').val());
  }, 200);
});