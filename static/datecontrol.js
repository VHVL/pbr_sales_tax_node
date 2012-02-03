$('document').ready( function () {
  var now, thismonth, thisyear, monthctl, tmp, i, yearctl, months;
  months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "November", "December"];
  now = new Date();
  thismonth = now.getMonth();
  thisyear = now.getFullYear();
  // Setup month control
  monthctl = $('#monthctl');
  for (i = 0; i < months.length; i += 1) {
    tmp = $('<option value="' + i + '">' + months[i] + '</option>');
    if (thismonth === i) {
      tmp.attr('selected', true);
    }
    monthctl.append(tmp);
  }
  // Setup year control
  yearctl = $('#yearctl');
  for (i = thisyear - 4; i < thisyear + 4; i += 1) {
    tmp = $('<option value="' + i + '">' + i + '</option>');
    if (thisyear === i) {
      tmp.attr('selected', true);
    }
    yearctl.append(tmp);
  }
});