$(document).ready(function() {

  $(document).ready(function(){
    $('.gradient').gradientCreator({
		height: 30,
		pointSize: 12,
		width: $('.range_group').first().width()

	});
  });



$('.social').click(function(e) {
    e.preventDefault();
    window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
    return false;
});

function renderImage(file) {
  var reader = new FileReader()
  reader.onload = function(event) {
    the_url = event.target.result
    $('#image .wrap').html("<img src='" + the_url + "' />")
  }
  reader.readAsDataURL(file)
}

$("#image_file").change(function() {
    renderImage(this.files[0])
});


$('.tabs li').on("click",function(e) {
	e.preventDefault()
	$('.tabs li.active').removeClass('active')
	$(this).addClass('active')

	$('.tabContent').hide()

	var activeTabContent = $('.tabs li.active a').attr('href').replace("#","");

	$('.tabContent#'+activeTabContent).show();

});


$('#complexFilters li input[type="checkbox"]').on("click", function() {

	console.log($(this).attr('checked'))
	//if(!$(this).prop('checked',true))
	//	$(this).parent().parent().trigger("click");

	 buildRule(); } );

$('.filter').on('input',function(){
	$(this).parent().find('.filterVal').val($(this).val());
	if($(this).val() != $(this).attr('data-default'))
		$(this).parent().find('a').show();
	else
		$(this).parent().find('a').hide();

	buildRule();
});


$('.filterVal').on('input',function(){
	$(this).parent().find('.filter').val($(this).val());
	buildRule();
});

$('#toggleURL').on('click',function(){
	$('#url').toggle();
});

$('#url').keydown(function(e){
    if(e.keyCode == 13)
    {
	   console.log("V"+$(this).val());
       $('#image img').attr('src',$(this).val());
    }
});

/* If performance test fails - bring back this feature.

$('.filter').on('change',function(){
	buildRule();
}); */

$('.filterVal').on('input',function(){

	var filter = $(this).parent().find('.filter');
	var max = filter.attr('max');
	var min = filter.attr('min');
	var val = parseInt($(this).val());

	console.log(min+"|"+max);
	console.log(val);

	if(val < min) { $(this).val(min); filter.val(min);  }
	if(val > max) { $(this).val(max); filter.val(max);  }

	buildRule();
});

$('#copy').on('click',function(e) {
	e.preventDefault();
    $("#code").select();
    if(document.execCommand('copy')) $('#copymsg').text('Copied to clipboard!');
});

$('#copyhtml').on('click',function(e) {
	e.preventDefault();
    $("#htmlcode").select();
    if(document.execCommand('copy')) $('#copyhtmlmsg').text('Copied to clipboard!');
});

$('#colors ul li a').on('click',function() {
	$('#image').css('background-color',$(this).attr('href'));
	return false;
});

$('.clearAll a').on('click',function() {
	$('.range_group a').each(function() {
		$(this).parent().find('input').val($(this).parent().find('.filter').attr('data-default'));
		$(this).hide();
	});
	buildRule();
	return false;
});


$('.range_group a').on('click',function() {
	$(this).parent().find('input').val($(this).parent().find('.filter').attr('data-default'));
	buildRule();
	$(this).hide();
});

$('#colors ul li a').each(function() {
	$(this).css('background-color',$(this).attr('href'));
});


$('#codepen').on("click",function(e){

	e.preventDefault();

	var data = new Object();

	data.css = "img {" + $('#code').val() + " }";
	data.html = $('#htmlcode').val() + "<img src='https://justcode.today/filters/brooke.jpg' width='800' />";

	json = JSON.stringify(data);
	$('#data').val(json);
	$(this).parents('form').submit();
})

$('#complexFilters > li > a').on("click",function(e){
		e.preventDefault();
		$(this).find('input').attr("checked",!$(this).find('input').attr("checked"));
		var id = $(this).attr('href');
		$(id).toggle();
		buildRule();

})

$('#complexFilters > li > a > input').on("click",function(e){
		e.stopPropagation();
		buildRule();
})

});


function buildRule()
{
	var rule = '';
	var htmlcode = '';

	$('#basic .filter').each(function() {
		if($(this).val() != $(this).attr('data-default'))
		rule += $(this).attr('name') + '(' + $(this).val() + $(this).attr('data-unit') + ') '
	});

	if(rule||1) rule = 'filter: ' + rule;


	/* Colorize filter */

	if($('#colorizeBox').is(':checked'))
	{
		var colors = hslToRgb($("#colorize .h").val()/360,$("#colorize .s").val()/100,$("#colorize .l").val()/100);
		var tint = svgTint(colors[0],colors[1],colors[2]);

		rule += tint.rule;
		htmlcode += tint.pagehtml;
	}

	/* Sharpen filter */

	if($('#sharpenBox').is(':checked'))
	{
		var radius = $('#sharpenRadius').val();
		var power = $('#sharpenPower').val();

		var sharpen = svgSharpen(3,power);

		rule += " " + sharpen.rule;
		htmlcode += sharpen.pagehtml;
	}

	if($('#gradientMapBox').is(':checked'))
	{

		var gradientMap = svgGradientMap();

		rule += " " + gradientMap.rule;
		htmlcode += gradientMap.pagehtml;
	}

	if($('#thresholdBox').is(':checked'))
	{
		var power = $('#thresholdPower').val();
		var grayscale = $('#thresholdGrayscale').is(':checked');
		var threshold = svgThreshold(power, grayscale);

		rule += " " + threshold.rule;
		htmlcode += threshold.pagehtml;
	}

	$('#code').val(rule);
	$('#htmlcode').val(htmlcode);
	$('#image img').attr('style',rule)
}


 /** SVG Filters */

 function svgTint(r,g,b)
 {
	var filter = new Object();
	r = r / 255;
	b = b / 255;
	g = g / 255;

	filter.pagehtml = '' +
	'<svg xmlns="http://www.w3.org/2000/svg"><filter id="svgTint">' +
	'<feColorMatrix type="matrix" values="' + r + ' ' + r + ' ' + r + ' ' +' 0 0 ' + g + ' ' + g + ' ' + g + ' ' + ' 0 0 ' + b + ' ' + b + ' ' + b + ' ' + ' 0 0 ' +' 0 0 0 1 0" />' +
	'</filter></svg>';


	/* CodePen Values */
	// filter.css = "img { filter: url(#svgTint); }";
	// filter.html = filter.pagehtml + " <img src='http://filters.guru.dev/brooke.jpg' width='800' />";

	filter.rule = "url(#svgTint)";

	$('#svgTint').parent().remove();
	$('html').append(filter.pagehtml);

	return filter;
 }

 function svgSharpen(radius, power)
 {
	var kernelMatrix = new Array(radius);
	var filter = new Object();
	var halfRadius = Math.floor(radius/2);

	//console.log(defMatrix);

	 for(i=0; i<radius; i++)
	 {
		kernelMatrix[i] = new Array(radius);
		for(j=0; j<radius; j++)
			{
				kernelMatrix[i][j] = -1
			}
	 }


	 kernelMatrix[halfRadius][halfRadius] = 9;


	 filter.pagehtml = '<svg xmlns="http://www.w3.org/2000/svg"><filter id="svgSharpen"><feConvolveMatrix order="'+radius +' '+ radius +'" preserveAlpha="true" divisor="1" bias="'+power+'" kernelMatrix="'+ kernelMatrix.join(' ') +'"/></filter></svg>';

	 filter.rule = "url(#svgSharpen)";

	$('#svgSharpen').parent().remove();
	$('html').append(filter.pagehtml);

	return filter;
 }

 function svgGradientMap()
 {
	var filter = new Object();

	var g = $(".gradient").data("gradientCreator");
	s = g.getFullStringGradient();

	filter.pagehtml = 	'<svg xmlns="http://www.w3.org/2000/svg"><filter id="svgGradientMap">'+
						'<fecolormatrix type="saturate" values="0" />' +
						'<feComponentTransfer color-interpolation-filters="sRGB">'+
						'<feFuncR type="table" tableValues="'+s.r+'"/>'+
						'<feFuncG type="table" tableValues="'+s.g+'"/>'+
						'<feFuncB type="table" tableValues="'+s.b+'"/>'+
						'</feComponentTransfer></filter></svg>';
	 filter.rule = "url(#svgGradientMap)";

	$('#svgGradientMap').parent().remove();
	$('html').append(filter.pagehtml);



	return filter;
 }

 function svgThreshold(power, grayscale)
 {
	var filter = new Object();
	var steps = 100 / gcd(power,100);
	var stepLength = 100 / steps;
	var tableValues = new Array();
	var grayscaleFilter;

	for(i = 1; i <= steps; i++)
	{
		if(i * stepLength > power)
			tableValues += ' 1';
		else
			tableValues += ' 0';
	}

	if(grayscale)
		grayscaleFilter = '<feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"/>';
	else
		grayscaleFilter = '';



	filter.pagehtml = 	'<svg xmlns="http://www.w3.org/2000/svg"><filter id="svgThreshold">'+
						grayscaleFilter +
						'<feComponentTransfer>'+
							'<feFuncR type="discrete" tableValues="' + tableValues + '"/>'+
							'<feFuncG type="discrete" tableValues="' + tableValues + '"/>'+
							'<feFuncB type="discrete" tableValues="' + tableValues + '"/>'+
						  '</feComponentTransfer>'+
						'</filter></svg>';
	filter.rule = "url(#svgThreshold)";

	$('#svgThreshold').parent().remove();
	$('html').append(filter.pagehtml);

	return filter;
 }



	 /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

/*
$(window).resize(function() {

	var g = $(".gradient").data("gradientCreator");
	s = g.getStringGradient();

	$('.gcGradientCreator').remove();
	$('.gradient').unbind().removeData();


	 $('.gradient').gradientCreator({
		height: 30,
		pointSize: 12,
		width: $('.range_group').first().width()
	});

});
 */

/** Color converter */

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


/** Greatest common divisor */

function gcd(a,b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {var temp = a; a = b; b = temp;}
    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}
