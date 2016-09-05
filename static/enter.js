// Client side functionality for enter invoice page

$(document).ready(function () {
  var $input = $('#invno');
  var $addinv = $('#btn_addinvoice');
  var $submit = $('#btn_submit');

  $input.on('keypress', function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $addinv.click();
    }
  });

  $addinv.on('click', function () {
    if ($input.val() === '') return;

    $.getJSON('/enter/' + $input.val(), function (data) {
      if (data.status === 1) {
        $('#good').append($(data.html));
      } else {
        $('#issues').append($(data.html));
      }
    }).fail(function (obj, text, err) {
      alert(err);
    });
    
    $input.val('');
  });

  $submit.on('click', submitForm);

  $('#invoices').on('click', '.remove-button', function (event) {
    $(this).parents('.invoice').remove();
  });
});

function submitForm () {
  var invoices = [];
  var problems = [];
  // Validate the data that was entered
  $('#issues .invoice').each(function () {
    var $this = $(this);
    var invoice = {
      number: $this.find('.number').text(),
      lastName: $this.find('.lastname input').val(),
      firstName: $this.find('.firstname input').val(),
      amount: +$this.find('.amount input').val(),
      tax: +$this.find('.tax input').val()
    };
    if (invoice.lastName === '') {
      problems.push('Invoice ' + invoice.number + ' has no last name.');
    }
    if (invoice.amount === 0 || isNaN(invoice.amount) || invoice.amount * 100 % 1 !== 0) {
      problems.push('Invoice ' + invoice.number + ' is missing an amount, or has an invalid amount.');
    }
    if (isNaN(invoice.tax) || invoice.tax * 100 % 1 !== 0) {
      problems.push('Invoice ' + invoice.number + ' has an invalid sales tax.');
    }
    invoices.push(invoice);
  });
  if (problems.length) {
    setErrors(problems);
    return false;
  }
  // Add the good invoices as well
  $('#good .invoice .number').each(function () {
    invoices.push({
      number: $(this).text()
    });
  });

  // Create the report
  $.post('/enter', {
    month: $('#monthctl').val(),
    year: $('#yearctl').val(),
    invoices: invoices
  }, function (data) {
    if (data.issues && data.issues.length !== 0) {
      setErrors(data.issues);
      return;
    }
    window.location.assign('/report/' + data.report);
  });
}

function setErrors (problems) {
  if ($('#error').length === 0) {
    $('#text').append($('<div id="error"></div>'));
  }
  $('#error').html('<ul></ul>');
  $.each(problems, function (idx, issue) {
    $('#error ul').append($('<li>' + issue + '</li>'));
  });
}
