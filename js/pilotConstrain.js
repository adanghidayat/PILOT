

//constructor
function PilotConstrain() {

  this.astroLockout = null;
  this.basePath = location.href.slice(0,location.href.lastIndexOf('/'));
  this.imageDir = this.basePath+'/images/';
  this.container = 'sliderDiv';
  this.mappedSliders = ["starttime","solarlongitude","meangroundresolution","minimumphaseangle","maximumphaseangle","minimumincidenceangle","maximumincidenceangle","minimumemissionangle","maximumemissionangle"];
  this.unmappedSliders = ["starttime"];
  this.errorTypes = [{name:"runbrowsereduce",title:'Browse Reduce'},{name:"runbrowse2std",title:'Browse Isis2std'},{name:"runCaminfo",title:'Cam Info'},{name:"runCaminfoHeader",title:'Caminfo Header'},{name:"runcubeatt",title:'Cube ATT'},{name:"runfootprintinit",title:'Footprint Init'},{name:"convert2isis",title:'ISIS Ingest'},{name:"isistargeterror",title:'ISIS Target Error'},{name:"runspiceinit",title:'Spice Init'},{name:"runthumbreduce",title:'Thumbnail Reduce'},{name:"runthumb2std",title:'Thumbnail Isis2std'},{name:"upcXMLcreate",title:'UPC XML Creation'}];
  this.mapped = false;
  this.unmapped = false;
};



PilotConstrain.prototype.cleanId = function(oldId) {
  var newId = oldId.replace(/[^a-zA-Z0-9_]+/g ,'_');
  return(newId);
};


PilotConstrain.prototype.clear = function(id) {
  if (id) {
    var iDiv = '#iTab' + id;
    $(iDiv).html('');
    var limitCall=new pilotAJAX();
    limitCall.limits(id);
    this.searchAlertOn();
  } else {
    if ($('#constrainTabs').data("tabs")) {
      $('#constrainTabs').tabs("destroy");
    }
    $('#constrainTabs').html('');
  }
};


PilotConstrain.prototype.enable = function(limits)  {

  $('#missionList input:checked').each(function(i) {
					 $('constraintSelect').append('<option value="' + i + '" />');
				       });
};


PilotConstrain.prototype.errorPanel = function(id)  {

   var e = '#errorDiv' + id;
   if ($('#unmapped_' + id).is(':checked')) {
    if (($(e).length != 0) && ($(e).html() != '')) {
      return;
    }
    $('<div/>', {id: 'errorDiv' + id}).appendTo('#iTab' + id + 'R');
    $('<span/>', {html: '<h3 class="advTitleSelects" >Unmapped Error Types </h3><span class="orangeText smalltext">Select one or more. . . </span>'}).appendTo(e);
    $('<select/>', {id: 'errorType' + id, multiple: 'multiple', size: '8', 'class': 'filter', name: 'errorType' + id + '[]'}).appendTo(e);
     var timer;
     $('#errorType' + id).change(function(){
			  window.clearTimeout(timer);
			  timer=window.setTimeout(function() {
						    pilotConstrain.searchAlertOn();
				},1000);
				});
     $('#errorType' + id).append($("<option></option>").attr("value",'none').text('No selection'));

     for (var i=0; i< this.errorTypes.length; i++) {
      $('#errorType' + id).append($("<option></option>").attr("value", this.errorTypes[i]['name']).text(this.errorTypes[i]['title']));
    }
  } else {
    $(e).html('');
  }
};


PilotConstrain.prototype.histogram = function(e) {

  var pop='#pilotStats';
  var container='#pilotStatsContainer';
  $(pop).css('display', 'block');
  $(container).html('');
  $('#pilotStatsHeader').html('<h3>' + instruments[e.data.instrument]['name'] + ' Histogram </h3>');
  $('<span/>', {html: '<span class="statsTitle orangeText">' + e.data.title + '</span><br/><div class="popSparkDiv" ><span id="popSpark' + e.data.keyword + '"></span></div>'}).appendTo(container);
  $(container).css('height', 90);
  $(container).css('width', 300);
  $('#pilotStatsTable').css('width', 320);
  var leftPop = Number($('#statsButton_' + e.data.instrument + e.data.keyword).position().left) + 150;
  var topPop = Number($('#statsButton_' + e.data.instrument + e.data.keyword).position().top);
  $(pop).css('left', leftPop);
  $(pop).css('top', topPop);

  var pilotAjax=new pilotAJAX();
  pilotAjax.histogram(e.data.instrument, e.data.keyword);
};


PilotConstrain.prototype.missionStats = function(id, name) {

  var pop='#pilotStats';
  var container='#pilotStatsContainer';
  $(pop).css('display', 'block');
  $(container).html('');
  $('#pilotStatsHeader').html('<h3>' + name + ' Logbook</h3>');
  $(container).css('height', 300);
  $(container).css('width', 300);
  $(pop).css('width', 320);
  var leftPop = Number($('#missionStats' + id).position().left) + 175;
  //var topPop = Number($('#missionStats' + id).position().top);
  $(pop).css('left', leftPop);
  //$(pop).css('top', topPop);

  var pilotAjax=new pilotAJAX();
  pilotAjax.missionStats(id);
};


PilotConstrain.prototype.show = function(json)  {

  limits = json[0]; bands = json[1]; strings = json[2];
  var id = limits[0].instrumentid;
  var iDiv = 'iTab' + id;
  var eL = $('<div/>', {id: iDiv + 'L', "class": 'slideLeft'}).appendTo('#' + iDiv);
  var eR = $('<div/>', {id: iDiv + 'R', "class": 'slideRight'}).appendTo('#' + iDiv);
  var sliderE = '';
  var amountE = '';
  var minVal, maxVal = 0;
  //$('<span/>', {html: 'Id Search: '}).appendTo(eR);
  //$('<input/>', {type: 'text', size: '20', name: id + '__searchId', id: id + '__searchId'}).appendTo(eR);
  //$('#' + id + '__searchId').change(function() {pilotConstrain.searchAlertOn();});
  for (var main in this.mappedSliders) {
   for (var item in limits) {
    if (limits[item].typename == this.mappedSliders[main]) {
      if (limits[item].typename == 'meangroundresolution') {
	limits[item].displayname += ' (mpp)';
      }
      this.makeSlider(eL, id, limits[item], true);
      break;
    }
   }
  }

  var sLength = strings.length;
  if (sLength > 1) {
    $('<span/>', {'class': 'advText', id: "advText1", value: '', html: 'Identifier Text Match: '}).appendTo(eR);
    $('<select/>', {id: 'string' + id, 'class': 'advTextSearch'}).appendTo(eR);
    $('#string' + id).change(function(){
					if ($('#string' + id).val().length > 0) {
					  var strTail = ( ($('#string' + id).val().indexOf('searchId') > -1) || ($('#string' + id).val().indexOf('edr_source') > -1) ) ? '' : '_ST';
					  $('#' + id + '__searchText').attr('disabled',false);
					  $('#' + id + '__searchText').attr('name', id + '__' + $('#string' + id).val() + strTail);
					} else {
					  $('#' + id + '__searchText').val('');
					  $('#' + id + '__searchText').attr('disabled',true);
					  $('#' + id + '__searchText').attr('name','');
					}
    });
    $('#string' + id).append($("<option></option>").attr("value",'').text('<Select Keyword>'));
    $('#string' + id).append($("<option></option>").attr("value",'searchId').text('Product Id'));
    $('#string' + id).append($("<option></option>").attr("value",'edr_source').text('EDR'));
    $('<input/>', {type: 'text', disabled: "disabled", size: '20', name: id + '__searchText', id: id + '__searchText'}).appendTo(eR);
    var timer;
    $('#' + id + '__searchText').on('input',function() {
			  window.clearTimeout(timer);
			  timer=window.setTimeout(function() {
						    pilotConstrain.searchAlertOn();
						  },1000);
			  });
    var skipIds = ["347", "348", "596", "599","673"];
    for (var i=0; i< strings.length; i++) {
      if ((strings[i] !== undefined) && ($.inArray(strings[i]['typeid'], skipIds) < 0)) {
	$('#string' + id).append($("<option></option>").attr("value", strings[i]['typename']).text(strings[i]['displayname']));
      }
    }
  }

  var bLength = bands.length;
  if (bLength > 1) {
    $('<span/>', {html: '<h3 class="advTitleSelects">Filter (center wavelength) </h3><span class="orangeText">Select one or more. . . </span>'}).appendTo(eR);
    $('<select/>', {id: 'filter' + id, multiple: 'multiple', size: '10', 'class': 'filter', name: 'filter' + id + '[]'}).appendTo(eR);
    var timer;
    $('#filter' + id).change(function(){
			       window.clearTimeout(timer);
			       timer=window.setTimeout(function() {
							 pilotConstrain.searchAlertOn();
						       },1000);
			     });
    $('#filter' + id).append($("<option></option>").attr("value",'none').text('No selection'));
    for (var i=0; i< bands.length; i++) {
      $('#filter' + id).append($("<option></option>").attr("value",  bands[i]['filter']).text(bands[i]['filter'] + '  (' + bands[i]['centerwave'] + ')'));
    }
  }

  this.errorPanel(id);

  $('<input/>', {type: 'button', value: 'Clear Settings', id: 'advClearButton' + id, "class": 'advClearButton'}).appendTo(eR);
  $('#advClearButton' + id).click(function() {pilotConstrain.clear(id);});
};

// element - div
// id - instrument id
// limit - json array
// histogram - boolean
//
PilotConstrain.prototype.makeSlider = function(element, id, limit, histogram, alertFunction)  {

  var amountE = '';
  var minVal, maxVal = 0;
  var sliderE = limit.typename;
  var rangeVal = false;
  var valuesVal = [];
  var valueVal = null;
  var fixed = (limit.fixed) ? limit.fixed : false;
  var aFunction = (typeof(alertFunction)=== "function") ? alertFunction : pilotConstrain.searchAlertOn;

  amountMin = id + '__' + limit.typename + 'AmountMin';
  amountMax = id + '__' + limit.typename + 'AmountMax';
  $('<span/>', {html: limit.displayname + ': ', "class": 'smallishText'}).appendTo(element);
  if (!fixed) {
    $('<input/>', {type: 'text', "class": 'sliderInputs', id: amountMin}).appendTo(element);
    $('<span/>', {html: ' to '}).appendTo(element);
  }
  $('<input/>', {type: 'text', "class": 'sliderInputs', id: amountMax}).appendTo(element);
  var timer;
  $('#' + amountMax).on('input', {id: amountMax , name: id + '__' + limit.typename + '_LT'}, function(e){
			  var e_ = e;
			  var aFX = aFunction;
			  window.clearTimeout(timer);
			  timer=window.setTimeout(function() {
						    pilotConstrain.sliderInputChanged(e_);
						    aFX();						    						  },1000);

			});
  $('#' + amountMin).on('input', {id: amountMin , name: id + '__' + limit.typename + '_GT'}, function(e){
			  var e_ = e;
			  var aFX = aFunction;
			  window.clearTimeout(timer);
			  timer=window.setTimeout(function() {
						    pilotConstrain.sliderInputChanged(e_);
						    aFX();						    						  },1000);
			});
  if (histogram) {
    $('<img/>', {src: 'images/stats.gif', id: 'statsButton_' + id + sliderE, "class": 'statsIcon', title: 'Histogram', alt: 'Histogram'}).appendTo(element);
    $('#statsButton_' + id + sliderE).click({instrument: id, keyword: sliderE, title: limit.displayname}, pilotConstrain.histogram);
  }
  $('<div/>', {id: id + '__' + sliderE}).appendTo(element);
    $('#' + id + '__' + sliderE).addClass('sliderDiv');
    if (sliderE == 'starttime') {
      maxVal = Math.floor(Number(new Date($.datepicker.parseDate('yy-mm-dd', limit.maximum)).getTime()) + 86400000);
      minVal = Math.floor(new Date($.datepicker.parseDate('yy-mm-dd', limit.minimum)).getTime());
      $('#' + id + '__' + sliderE).slider({
	range: true,
	min: minVal,
	max: maxVal,
	values: [minVal, maxVal],
	slide: function( event, ui ) {
	  var minE = '#' + $(this).attr('id') + 'AmountMin';
	  var maxE = '#' + $(this).attr('id') + 'AmountMax';
	  var minD = new Date(ui.values[0]);
	  var maxD = new Date(ui.values[1]);
	  $(minE).val( $.datepicker.formatDate('yy-mm-dd',minD));
	  $(maxE).val( $.datepicker.formatDate('yy-mm-dd',maxD));
	  $(minE).attr( 'name', $(this).attr('id') + '_GT');
	  $(maxE).attr( 'name', $(this).attr('id') + '_LT');
	},
	stop: function( event, ui ) {
	  aFunction();
	}
      });
      $( '#' + amountMin).val(limit.minimum.slice(0,10));
      $( '#' + amountMax).val(limit.maximum.slice(0,10));
    } else {
      maxVal = Math.floor(limit.maximum) + 1;
      minVal = Math.floor(limit.minimum);
      rangeVal = (fixed) ? "min" : true;
      $('#' + id + '__' + sliderE).slider({
	  range: rangeVal,
	  min: minVal,
	  max: maxVal,
	  slide: function( event, ui ) {
	    var minE = '#' + $(this).attr('id') + 'AmountMin';
	    var maxE = '#' + $(this).attr('id') + 'AmountMax';
	    if (ui.values) {
	      $(minE).val( ui.values[0]);
	      $(maxE).val( ui.values[1]);
	    } else {
	      $(maxE).val( ui.value);
	    }
	    $(minE).attr( 'name', $(this).attr('id') + '_GT');
	    $(maxE).attr( 'name', $(this).attr('id') + '_LT');
	  },
	  stop: function( event, ui ) {
	    aFunction();
	  }
	});
      if (fixed) {
	$('#' + id + '__' + sliderE).slider("value", maxVal);
      } else {
	$('#' + id + '__' + sliderE).slider("values", [minVal,maxVal]);
      }
      if (limit.step) {
	$('#' + id + '__' + sliderE).slider("option", "step", limit.step);
      }
      $( '#' + amountMin).val(minVal);
      $( '#' + amountMax).val(maxVal);
    }
};


PilotConstrain.prototype.paramAlert = function() {
  var empty = $('#constrainTabs :input').filter(function() {
    return ((this.name !== "") && (this.value !== "") && (this.value !== 'none'));
  });
  if (empty.length) {
    $('#constrainTabImg').attr('src', 'images/wrench-set.gif');
  } else {
    $('#constrainTabImg').attr('src', 'images/wrench.gif');
  }
};


PilotConstrain.prototype.mapParamAlert = function() {
  if($('#astroBBWKT').val() === '') {
    $('#mapTabImg').attr('src', 'images/globe.gif');
  } else {
      $('#mapTabImg').attr('src', 'images/globe-set.gif');
  }
};


PilotConstrain.prototype.sliderInputChanged = function(e) {
  $('#' + e.data.id).attr('name', e.data.name);
};


PilotConstrain.prototype.searchAlertOn = function() {
  pilotConstrain.paramAlert();
  pilotSearch.search(true);
};


PilotConstrain.prototype.mapSearch = function() {
  this.mapParamAlert();
  pilotSearch.search(true);
};


// globals: instrument[]
//
PilotConstrain.prototype.showMissionStats = function(stats) {

  var container='#pilotStatsContainer';
  var statsShown = false;
  for (j=0; j <= stats.length; j++){
    if ((stats[j] != null) && (stats[j]['spark'].length > 0)) {
      statsShown = true;
      $('<span/>', {html: '<span class="statsTitle orangeText">' + stats[j].displayname + '</span><br/><div class="popSparkDiv" ><span id="popSpark' + stats[j].keyword + '"></span></div></br>'}).appendTo(container);
      this.showHistogram(stats[j]);
    }
  }
  if (!statsShown) {
    $(container).html('<p><span style="margin:10px;" class="orangeText">No stats available. . .</span></p>');
  }
};


// globals: instrument[]
//
PilotConstrain.prototype.showHistogram = function(data) {

  var container='#pilotStatsContainer';

  if (data == null) {
    $(container).html('<p><span style="margin:10px;" class="orangeText">No histogram available. . .</span></p>');
    return;
  }

  var sparkSpan = '#popSpark' + data['keyword'];
  var sparkTitle1 = '[';
  if ((data['keyword'] == 'starttime') || (data['keyword'] == 'processdate')) {
    var sparkTitle2 = '[';
    for (y= data['start']; y <= data['end']; y++) {
      for (m=1;m <=12; m++){
	sparkTitle1 += (sparkTitle1 != '[') ? ',' : '';
	sparkTitle1 += y;
	sparkTitle2 += (sparkTitle2 != '[') ? ',' : '';
	sparkTitle2 += m;
      }
    }
    sparkTitle1 += ']';
    sparkTitle2 += ']';
    $(sparkSpan).sparkline(eval(sparkTitle2),
    { type: 'bar', barWidth: 6, barSpacing: 2, chartRangeMax: 10000, zeroColor: '#aaaaaa', barColor: '#aaaaaa', numberDigitGroupCount: 6, tooltipFormat: '{{value:month}}', tooltipValueLookups: { month: {'1':'January','2':'February','3':'March','4':'April','5':'May','6':'June','7':'July','8':'August','9':'September','10':'October','11':'November','12':'December'}}});
    $(sparkSpan).sparkline(eval(sparkTitle1),
    { type: 'bar', composite:true, barWidth: 6, barSpacing: 2, chartRangeMax: 10000, zeroColor: '#aaaaaa', barColor: '#aaaaaa', numberDigitGroupCount: 6, tooltipFormat: '{{value}}' });
  } else {
//    for (y= data['start']; y <= data['end']; y++) {
   // for (y= data['start']; y <= data['end']; y++) {
   //   sparkTitle1 += (sparkTitle1 != '[') ? ',' : '';
   //   sparkTitle1 += y;
   // }
   // sparkTitle1 += ']';
    $(sparkSpan).sparkline(eval(data['sparkt']),
    { type: 'bar', barWidth: 6, barSpacing: 2, chartRangeMax: 10000, zeroColor: '#aaaaaa', barColor: '#aaaaaa', numberDigitGroupCount: 6, tooltipFormat: '{{value}}' });
  }
  var sparkOut = eval(data['spark']);
  if (sparkOut.length > 0) {
    $(sparkSpan).sparkline(sparkOut,
    { type: 'bar', composite: true, barWidth: 6, chartRangeMin: 0, chartRangeMax: eval(data['max']), barSpacing: 2, nullColor: '#aaaaaa', zeroColor: '#aaaaaa', barColor: '#9999cc', toolTipSkipNull: true, tooltipFormat: '{{value}} mapped images' });
  }

  var sparkeOut = eval(data['sparke']);
  if (sparkeOut.length > 0) {
    $(sparkSpan).sparkline(sparkeOut,
			   { type: 'bar', composite: true, barWidth: 6, chartRangeMin: 0, barSpacing: 2, chartRangeMax: eval(data['max']), nullColor: '#aaaaaa', zeroColor: '#aaaaaa', barColor: '#cc99cc', toolTipSkipNull: true, tooltipFormat: '{{value}} unmapped images' });

  }

};


var pilotConstrain = new PilotConstrain();
