(function($){
  $(function(){
    if (!Modernizr.inputtypes.date) {
      var readDate = function(d_str) {
        if (/^\d{4,}-\d\d-\d\d$/.test(d_str)) {
          var matchData = /^(\d+)-(\d+)-(\d+)$/.exec(d_str),
            yearPart = parseInt(matchData[1], 10),
            monthPart = parseInt(matchData[2], 10),
            dayPart = parseInt(matchData[3], 10);
          var dateObj = new Date(yearPart, monthPart - 1, dayPart);
          return dateObj;
        } else throw "Invalid date string: " + d_str;
      };
      var makeDateString = function(date_obj) {
        var d_arr = [date_obj.getFullYear().toString()];
        d_arr.push('-');
        if (date_obj.getMonth() < 9) d_arr.push('0');
        d_arr.push((date_obj.getMonth() + 1).toString());
        d_arr.push('-');
        if (date_obj.getDate() < 10) d_arr.push('0');
        d_arr.push(date_obj.getDate().toString());
        return d_arr.join('');
      };
      var makeDateDisplayString = function(date_obj, elem) {
        var $elem = $(elem);
        var day_names = $elem.datepicker( "option", "dayNames" );
        var month_names = $elem.datepicker( "option", "monthNames" );
        var date_arr = [day_names[date_obj.getDay()]];
        date_arr.push(', ');
        date_arr.push(month_names[date_obj.getMonth()]);
        date_arr.push(' ');
        date_arr.push(date_obj.getDate().toString());
        date_arr.push(', ');
        date_arr.push(date_obj.getFullYear().toString());
        return date_arr.join('');
      };
      var increment = function(hiddenField, dateBtn, calendarDiv) {
        var $hiddenField = $(hiddenField);
        var value = readDate($hiddenField.val());
        var step = $hiddenField.data("step");
        var max = $hiddenField.data("max");
        if (step === undefined || step == 'any') value.setDate(value.getDate() + 1);
        else value.setDate(value.getDate() + step);
        if (max !== undefined && value > max) value.setTime(max.getTime());
        value = stepNormalize(value, hiddenField);
        $hiddenField.val(makeDateString(value)).change();
        $(dateBtn).text(makeDateDisplayString(value, calendarDiv));
        $(calendarDiv).datepicker("setDate", value);
      };
      var decrement = function(hiddenField, dateBtn, calendarDiv) {
        var $hiddenField = $(hiddenField);
        var value = readDate($hiddenField.val());
        var step = $hiddenField.data("step");
        var min = $hiddenField.data("min");
        if (step === undefined || step == 'any') value.setDate(value.getDate() - 1);
        else value.setDate(value.getDate() - step);
        if (min !== undefined && value < min) value.setTime(min.getTime());
        value = stepNormalize(value, hiddenField);
        $hiddenField.val(makeDateString(value)).change();
        $(dateBtn).text(makeDateDisplayString(value, calendarDiv));
        $(calendarDiv).datepicker("setDate", value);
      };
      var stepNormalize = function(inDate, hiddenField) {
        var $hiddenField = $(hiddenField);
        var step = $hiddenField.data("step");
        var min = $hiddenField.data("min");
        var max = $hiddenField.data("max");
        if (step !== undefined && step != 'any') {
          var kNum = inDate.getTime();
          var raisedStep = step * 86400000;
          if (min === undefined) min = new Date(1970, 0, 1);
          var minNum = min.getTime();
          var stepDiff = (kNum - minNum) % raisedStep;
          var stepDiff2 = raisedStep - stepDiff;
          if (stepDiff == 0) return inDate;
          else {
            if (stepDiff > stepDiff2) return new Date(inDate.getTime() + stepDiff2);
            else return new Date(inDate.getTime() - stepDiff);
          }
        } else return inDate;
      }
      $('input[type="date"]').each(function(index) {
        var $this = $(this), value, min, max, step;
        if ($this.attr('value') !== undefined && /^\d{4,}-\d\d-\d\d$/.test($this.attr('value'))) value = readDate($this.attr('value'));
        else value = new Date();
        if ($this.attr('min') !== undefined) {
          min = readDate($this.attr('min'));
          if (value < min) value.setTime(min.getTime());
        }
        if ($this.attr('max') !== undefined) {
          max = readDate($this.attr('max'));
          if (value > max) value.setTime(max.getTime());
        }
        if ($this.attr('step') == 'any') step = 'any';
        else if ($this.attr('step') !== undefined) step = parseInt($this.attr('step'), 10);
        var hiddenField = document.createElement('input');
        var $hiddenField = $(hiddenField);
        $hiddenField.attr({
          type: "hidden",
          name: $(this).attr('name'),
          value: makeDateString(value)
        });
        $hiddenField.data('min', min);
        $hiddenField.data('max', max);
        $hiddenField.data('step', step);

        value = stepNormalize(value, hiddenField);
        $hiddenField.attr('value', makeDateString(value));

        var calendarContainer = document.createElement('span');
        var $calendarContainer = $(calendarContainer);
        if ($this.attr('class') !== undefined) $calendarContainer.attr('class', $this.attr('class'));
        if ($this.attr('style') !== undefined) $calendarContainer.attr('style', $this.attr('style'));
        var calendarDiv = document.createElement('div');
        var $calendarDiv = $(calendarDiv);
        $calendarDiv.css({
          display: 'none',
          position: 'absolute'
        });
        var dateBtn = document.createElement('button');
        var $dateBtn = $(dateBtn);
        $dateBtn.addClass('date-datepicker-button');
        
        $this.replaceWith(hiddenField);
        $calendarContainer.insertAfter(hiddenField);
        $dateBtn.appendTo(calendarContainer);
        $calendarDiv.appendTo(calendarContainer);

        $calendarDiv.datepicker({
          dateFormat: 'MM dd, yy',
          showButtonPanel: true,
          beforeShowDay: function(dateObj) {
            if (step === undefined || step == 'any') return [true, ''];
            else {
              if (min === undefined) min = new Date(1970, 0, 1);
              var dateDays = Math.floor(dateObj.getTime() / 86400000);
              var minDays = Math.floor(min.getTime() / 86400000);
              return [((dateDays - minDays) % step == 0), ''];
            }
          }
        });

        $(dateBtn).text(makeDateDisplayString(value, calendarDiv));

        if (min !== undefined) $calendarDiv.datepicker("option", "minDate", min);
        if (max !== undefined) $calendarDiv.datepicker("option", "maxDate", max);
        var closeFunc;
        if (Modernizr.csstransitions) {
          calendarDiv.className = "date-calendar-dialog date-closed";
          $dateBtn.click(function () {
            $calendarDiv.unbind('transitionend oTransitionEnd webkitTransitionEnd MSTransitionEnd');
            calendarDiv.style.display = 'block';
            calendarDiv.className = "date-calendar-dialog date-open";
            return false;
          });
          closeFunc = function () {
            if (calendarDiv.className == "date-calendar-dialog date-open") {
              var transitionend_function = function(event, ui) {
                calendarDiv.style.display = 'none';
                $calendarDiv.unbind("transitionend oTransitionEnd webkitTransitionEnd MSTransitionEnd", transitionend_function);
              }
              $calendarDiv.bind("transitionend oTransitionEnd webkitTransitionEnd MSTransitionEnd", transitionend_function);
              calendarDiv.className = "date-calendar-dialog date-closed";
              return false;
            }
          }
        } else {
          $dateBtn.click(function(event) {
            event.preventDefault();
            $calendarDiv.fadeIn('fast');
          });
          closeFunc = function() {
            $calendarDiv.fadeOut('fast');
          };
        }
        $calendarDiv.mouseleave(closeFunc);
        $calendarDiv.datepicker( "option", "onSelect", function(dateText, inst) {
          var dateObj = $.datepicker.parseDate('MM dd, yy', dateText);
          $hiddenField.val(makeDateString(dateObj)).change();
          $dateBtn.text(makeDateDisplayString(dateObj, calendarDiv));
          closeFunc();
        });
        $calendarDiv.datepicker("setDate", value);
        $dateBtn.bind({
          DOMMouseScroll: function(event) {
            if (event.detail < 0) increment(hiddenField, dateBtn, calendarDiv);
            else decrement(hiddenField, dateBtn, calendarDiv);
            event.preventDefault();
          },
          mousewheel: function(event) {
            if (event.wheelDelta > 0) increment(hiddenField, dateBtn, calendarDiv);
            else decrement(hiddenField, dateBtn, calendarDiv);
            event.preventDefault();
          },
          keypress: function(event) {
            if (event.keyCode == 38) { // up arrow
              increment(hiddenField, dateBtn, calendarDiv);
              event.preventDefault();
            } else if (event.keyCode == 40) { // down arrow
              decrement(hiddenField, dateBtn, calendarDiv);
              event.preventDefault();
            }
          }
        });
      });
    }
  });
})(jQuery);