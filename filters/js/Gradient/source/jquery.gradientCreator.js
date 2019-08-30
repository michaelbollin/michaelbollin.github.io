/*
 * jQuery Gradient Creator v1.0
 * 
 * Created by Charly Biscay : http://www.biscay-charly.com
 * Using this plugin requires a license : http://codecanyon.net/item/jquery-gradient-creator/2054676
 * This is the plugin source. If you modify it, thank you minimize it before putting it on your site
 */

(function($) {
    $.gradientCreator = function(element, options) {
      
        var defaults = {            
            gradient: '0% #02CDE8,100% #000000',
            width: 200,
            height: 18,
            pointSize: 8,
            orientation: 'vertical',
            target: '',
            tooltipGradient: '0% #feffff,100% #ededed',
            onChange: function(){},
            onInit: function(){},
            noSupport: function(){
                alert("Sorry, your browser doesn't support HTML5. Please upgrade it.");
            }
        };
      
        var plugin = this;
        plugin.settings = {};                              
        var $element = $(element), element = element;
        var $container, $canvasGradient,$pointsContainer,$pointsInfos,$pointsInfosContent;
        var $pointColor, $pointPosition, $spanPointPositionRes, $btnPointDelete;
        var gradientCtx, gradientSelectedPoint, gradientPoints = new Array(), tooltipGradient;
          
        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);  
            if (isCanvasSupported())
            {                        
                plugin.update();
                plugin.settings.onInit();
            }
            else
            {
                plugin.settings.noSupport();
            }
        };
        plugin.update = function() {                    
            createGradientPoints();
            createDom();
            renderGradient();
        };
        plugin.getCssGradient = function()
        {
            var cssGradient = '';            
            var svgX = '0%';
            var svgY = '100%';
            var webkitDir = 'left bottom';
            var defDir = 'top';
            var ieDir = '0';
            if (plugin.settings.orientation == 'horizontal'){
                svgX = '100%';
                svgY = '0%';
                webkitDir = 'right top';
                defDir = 'left';
                ieDir = '1';
            }            
            var svg = '<svg xmlns="http://www.w3.org/2000/svg">'+
            '<defs>' +
            '<linearGradient id="gradient" x1="0%" y1="0%" x2="'+svgX+'" y2="'+svgY+'">';         
            var ieFilter = "progid:DXImageTransform.Microsoft.gradient( startColorstr='" + gradientPoints[0][1] + "', endColorstr='" + gradientPoints[gradientPoints.length-1][1] + "',GradientType="+ieDir+")";
            var webkitCss = '-webkit-gradient(linear, left top, '+webkitDir;
            var defCss = '';
            $.each(gradientPoints, function(i, el) {
                webkitCss += ', color-stop(' + el[0] + ', ' + el[1] + ')';  
                defCss += ',' + el[1] + ' ' + el[0] + '';
                svg += '<stop offset="'+el[0]+'" style="stop-color:'+ el[1]  + ';" />';
            });
            webkitCss += ')';
            defCss = defCss.substr(1); 
            svg += '</linearGradient>' +
            '</defs>' +
            '<rect fill="url(#gradient)" height="100%" width="100%" />' +
            '</svg>';        
            svg = encode64(svg);
            cssGradient += 'background: url(data:image/svg+xml;base64,'+ svg+ ');'+'\n';
            cssGradient += 'background: '+ webkitCss+ ';\n';
            cssGradient += 'background: '+'-moz-linear-gradient('+defDir+',' + defCss + ');'+'\n';
            cssGradient += 'background: '+'-webkit-linear-gradient('+defDir+',' + defCss + ');'+'\n';
            cssGradient += 'background: '+'-o-linear-gradient('+defDir+',' + defCss + ');'+'\n';
            cssGradient += 'background: '+'-ms-linear-gradient('+defDir+',' + defCss + ');'+'\n';
            cssGradient += 'background: '+'linear-gradient('+defDir+',' + defCss + ');';
            return cssGradient;            
        };
        plugin.getArrayGradient = function() {
            return gradientPoints;  
        };
		
		plugin.getFullStringGradient = function()
		{
			var gradientR = new Array(100);
			var gradientG = new Array(100);
			var gradientB = new Array(100);
			var positions = new Array();
			
			var gradientFull = new Object();

			$.each(gradientPoints,function(i,el){
                pos = parseInt(el[0].replace('%',''));
				positions.push(pos);
				colors = hexToRgb(el[1]);
				
				gradientR[pos] = colors.r;
				gradientG[pos] = colors.g;
				gradientB[pos] = colors.b;
				
				if(positions.length > 1)
				{
					var far = positions[positions.length-1];
					var near = positions[positions.length-2];
					var distance = 1/(far - near);
					
					for(i = far; i > near; i--)
					{
						//console.log('Eq: Math.abs('+gradientR[far]+'- ('+far+'-'+i+')*'+distance+'*('+gradientR[far]+'-'+gradientR[near]+')'+') = '+Math.abs(gradientR[far] - (far-i)*distance*(gradientR[far]-gradientR[near])));
						gradientR[i] = Math.abs(gradientR[far] - (far-i)*distance*(gradientR[far]-gradientR[near]));
						gradientG[i] = Math.abs(gradientG[far] - (far-i)*distance*(gradientG[far]-gradientG[near]));
						gradientB[i] = Math.abs(gradientB[far] - (far-i)*distance*(gradientB[far]-gradientB[near]));
					}
				}
				
            });
			
			if(positions[0] > 0)
					for(i = 0; i < positions[0]; i++)
					{
						gradientR[i] = gradientR[positions[0]];
						gradientG[i] = gradientG[positions[0]];
						gradientB[i] = gradientB[positions[0]];
					}
			
			if(positions[positions.length-1] < 100)
					for(i = positions[positions.length-1]; i < 100; i++)
					{
						gradientR[i] = gradientR[positions[positions.length-1]];
						gradientG[i] = gradientG[positions[positions.length-1]];
						gradientB[i] = gradientB[positions[positions.length-1]];
					}

			for(i=0; i<100; i++)
			{
				gradientR[i] = Math.round((gradientR[i]/255)*100)/100;
				gradientG[i] = Math.round((gradientG[i]/255)*100)/100;
				gradientB[i] = Math.round((gradientB[i]/255)*100)/100;
			}				
			
			
			
			gradientFull.r = gradientR;
			gradientFull.g = gradientG;
			gradientFull.b = gradientB;
			
			return gradientFull;
		}
		
        plugin.getStringGradient = function() {
            var gradientString = '';
            $.each(gradientPoints,function(i,el){
                gradientString += el[0]+' '+el[1]+',';
            });
            gradientString = gradientString.substr(0,gradientString.length-1);
            return gradientString;  
        };
        plugin.setOrientation = function (orientation) {
            plugin.settings.orientation = orientation;
            renderToTarget();
        };
        
        var createGradientPoints = function ()
        {
            gradientPoints = new Array();
            if ($.isArray(plugin.settings.gradient))
            {
                gradientPoints = plugin.settings.gradient;
            }
            else
            {
                gradientPoints = getGradientFromString(plugin.settings.gradient);                
            }            
        };        
        var createDom = function() {
            $element.html('');
            $container = $('<div class="gcGradientCreator"></div>');
            $canvasGradient = $('<canvas class="gcGradient" width="'+plugin.settings.width+'" height="'+plugin.settings.height+'"></canvas>');
            $container.append($canvasGradient);
            gradientCtx = $canvasGradient.get(0).getContext('2d');
            $pointsContainer = $('<div class="gcPoints"></div>');
            $pointsContainer.css('width',plugin.settings.width+'px');            
            var tmpPoint = $('<div class="gcPoint"></div>');
            $pointsContainer.css('width',(plugin.settings.width)+'px');
            $container.append($pointsContainer);
            $pointsInfos = $('<div class="gcPointsInfos"></div>');            
            $pointsInfos.append('<div class="gcPointsInfosArrow"></div>');
            $container.append($pointsInfos);
            $pointsInfosContent = $('<div class="gcPointsInfosContent"></div>');
            $pointsInfos.append($pointsInfosContent);
            tooltipGradient = getGradientFromString(plugin.settings.tooltipGradient);
            renderToElement($pointsInfosContent,tooltipGradient);
            $pointsInfosContent.css('color',plugin.settings.tooltipTextColor);
            $pointsInfos.find('.gcPointsInfosArrow').css('borderColor','transparent transparent '+tooltipGradient[0][1]+' transparent');
            $element.hover(function(){
                $element.addClass('hover');
            },function(){
                $element.removeClass('hover');                
            });
            $pointColor = $('<div class="gcPointColor"><div style="background-color: #00ff00"></div></div>');
            $pointPosition = $('<span class="gcPointPosition">%</span>');
            $btnPointDelete = $('<a href="javascript:" class="gcBtnPointDel"></a>');
            $pointsInfosContent.append($pointColor,$pointPosition,$btnPointDelete);
            $element.append($container);
            $pointColor.ColorPicker({
                color: '#00ff00',
                onSubmit: function(hsb, hex, rgb) {
                    $element.find('.gcPointColor div').css('backgroundColor', '#' + hex);
                    gradientSelectedPoint.css('backgroundColor', '#' + hex);
                    renderGradientCanvas();
                    renderToTarget();
                }, 
                onChange: function(hsb, hex, rgb) {
                    $element.find('.gcPointColor div').css('backgroundColor', '#' + hex);
                    gradientSelectedPoint.css('backgroundColor', '#' + hex);
                    renderGradientCanvas();
                    renderToTarget();
                }
            });
            $(document).bind('click',function(){
                if (!$element.is('.hover')) 
                {
                    $pointsInfos.hide('fast');
                }
            });
            $canvasGradient.unbind('click');
            $canvasGradient.bind('click',function(e) {
                var offset = $canvasGradient.offset();
                var clickPosition = e.pageX - offset.left;
                clickPosition = Math.round((clickPosition * 100) / plugin.settings.width);
                var defaultColor = '#000000';                
                var minDist = 9999999999999;              
                $.each( gradientPoints ,function (i,el){
                    if ((parseInt(el[0]) < clickPosition) && (clickPosition - parseInt(el[0]) < minDist ))
                    {
                        minDist = clickPosition - parseInt(el[0]);
                        defaultColor = el[1];
                    }
                    else if ((parseInt(el[0]) > clickPosition) && (parseInt(el[0])-clickPosition  < minDist )){
                        minDist = parseInt(el[0])-clickPosition ;
                        defaultColor = el[1];
                    }
                });                
                gradientPoints.push([clickPosition+'%', defaultColor]);
                gradientPoints.sort(sortByPosition);
                renderGradient();
                $.each( gradientPoints ,function (i,el){
                    if (el[0] == clickPosition+'%')
                    {
                        selectGradientPoint($pointsContainer.find('.gcPoint:eq('+i+')'));
                    }
                });
            });
        };        
        var renderGradient = function ()
        {
            initGradientPoints();
            renderGradientCanvas();
            renderToTarget();
        };
        var initGradientPoints = function() {            
            $pointsContainer.html('');
            $.each(gradientPoints, function(i, el) {
                $pointsContainer .append('<div class="gcPoint" style="background-color: ' + el[1] + '; left:' + (parseInt(el[0]) * plugin.settings.width) / 100 + 'px; top:-'+(i*(plugin.settings.pointSize+2))+'px"><div class="gcPointArrow"></div></div>');
            });
            $pointsContainer.find('.gcPoint').css('width', plugin.settings.pointSize+'px');
            $pointsContainer.find('.gcPoint').css('height', plugin.settings.pointSize+'px');
            $pointsContainer.find('.gcPoint').mouseup(function() {
                selectGradientPoint(this);
            });
            $pointsContainer.find('.gcPoint').draggable({
                axis : "x",
                containment : "parent",
                drag : function() {
                    selectGradientPoint(this);
                    renderGradientCanvas();
                    renderToTarget();
					
                }
            });
        };        
        var selectGradientPoint = function(el) {
            gradientSelectedPoint = $(el);    
            var color = $(el).css('backgroundColor');
            var position = parseInt($(el).css('left'));    
            position = Math.round((position / plugin.settings.width) * 100);
            color = color.substr(4,color.length);
            color = color.substr(0,color.length-1);
            $pointColor.ColorPickerSetColor(rgbToHex(color.split(',')));          
            $pointColor.find('div').css('backgroundColor',rgbToHex(color.split(',')));
            $pointPosition.html('Position: ' + position+'%');
            $btnPointDelete.unbind('click');
            $btnPointDelete.bind('click', function() {
                if (gradientPoints.length > 1)
                {
                    gradientPoints.splice(gradientSelectedPoint.index(),1);
                    renderGradient();
                    $element.find('.gcPointsInfos').hide('fast');
                }
            });            
            var posLeft = parseInt($(el).css('left'))-30;
            $element.find('.gcPointsInfos').css('marginLeft',posLeft+'px');
            $element.find('.gcPointsInfos').show('fast');
        };            
        var renderGradientCanvas = function () {
            gradientPoints = new Array();            
            $element.find('.gcPoint').each(function(i, el) {
                var position = Math.round((parseInt($(el).css('left')) / plugin.settings.width) * 100);
                var color = $(el).css('backgroundColor').substr(4, $(el).css('backgroundColor').length - 5);
                color = rgbToHex(color.split(','));
                gradientPoints.push([position+'%',color]);
            });
            gradientPoints.sort(sortByPosition);
            renderToCanvas();
            plugin.settings.onChange(plugin.getStringGradient(),plugin.getCssGradient(),plugin.getArrayGradient());
			buildRule();
        };        
        var renderToElement = function($target,gradient){            
            var svgX = '0%';
            var svgY = '100%';
            var webkitDir = 'left bottom';
            var defDir = 'top';
            var ieDir = '0';
            if ( ($target == $canvasGradient) || (plugin.settings.orientation == 'horizontal')){
                svgX = '100%';
                svgY = '0%';
                webkitDir = 'right top';
                defDir = 'left';
                ieDir = '1';
            }            
            var svg = '<svg xmlns="http://www.w3.org/2000/svg">'+
            '<defs>' +
            '<linearGradient id="gradient" x1="0%" y1="0%" x2="'+svgX+'" y2="'+svgY+'">';                  
            var ieFilter = "progid:DXImageTransform.Microsoft.gradient( startColorstr='" + gradient[0][1] + "', endColorstr='" + gradient[gradient.length-1][1] + "',GradientType="+ieDir+")";
            var webkitCss = '-webkit-gradient(linear, left top, '+webkitDir;
            var defCss = '';
            $.each(gradient, function(i, el) {
                webkitCss += ', color-stop(' + el[0] + ', ' + el[1] + ')';      
                defCss += ',' + el[1] + ' ' + el[0] + '';
                svg += '<stop offset="'+el[0]+'" style="stop-color:'+ el[1]  + ';" />';
            });
            webkitCss += ')';
            defCss = defCss.substr(1); 
            svg += '</linearGradient>' +
            '</defs>';
            if ($target == $pointsInfosContent)
            {
                var tooltipRadius = parseInt($pointsInfosContent.css('borderRadius'));
                svg += '<rect fill="url(#gradient)" height="100%" width="100%" rx="'+tooltipRadius+'" ry="'+tooltipRadius+'" />';
            }
            else
            {                    
                svg += '<rect fill="url(#gradient)" height="100%" width="100%" />';
            }                
            svg += '</svg>';        
            svg = encode64(svg);
            $target.css('background', 'url(data:image/svg+xml;base64,'+svg+')');
            $target.css('background', webkitCss);
            $target.css('background', '-moz-linear-gradient('+defDir+',' + defCss + ')');
            $target.css('background', '-webkit-linear-gradient('+defDir+',' + defCss + ')');
            $target.css('background', '-o-linear-gradient('+defDir+',' + defCss + ')');
            $target.css('background', '-ms-linear-gradient('+defDir+',' + defCss + ')');
            $target.css('background', 'linear-gradient('+defDir+',' + defCss + ')');
        };        
        var renderToTarget = function()
        {
            if (plugin.settings.target != "") {
                var $target = $(plugin.settings.target);
                renderToElement($target,gradientPoints);    
            }
        };        
        var renderToCanvas = function(){
            var gradient = gradientCtx.createLinearGradient(0, 0, plugin.settings.width, 0);
            $.each(gradientPoints, function(i, el) {              
                gradient.addColorStop(parseInt(el[0])/100, el[1]);
            });
            gradientCtx.clearRect(0, 0, plugin.settings.width, plugin.settings.height);
            gradientCtx.fillStyle = gradient;
            gradientCtx.fillRect(0, 0, plugin.settings.width, plugin.settings.height);            
            
            plugin.settings.onChange(plugin.getStringGradient(),plugin.getCssGradient(),plugin.getArrayGradient());  
        };
        var getGradientFromString = function (gradient)
        {
            var gradientArray = new Array();
            var gradientPointsTmp = gradient.split(',');
            $.each(gradientPointsTmp,function(i,el){
                var position;
                if ( (el.substr(el.indexOf('%')-3,el.indexOf('%')) == '100') || (el.substr(el.indexOf('%')-3,el.indexOf('%')) == '100%')) {
                    position = '100%';
                }
                else if (el.indexOf('%') > 1)
                {
                    position = parseInt(el.substr(el.indexOf('%')-2,el.indexOf('%')));
                    position += '%';
                }
                else
                {
                    position = parseInt(el.substr(el.indexOf('%')-1,el.indexOf('%')));
                    position += '%';
                }
                var color = el.substr(el.indexOf('#'),7);
                gradientArray.push([position,color]); 
            });     
            return gradientArray;
        };        
        var rgbToHex = function(rgb) {            
            var R = rgb[0];
            var G = rgb[1];
            var B = rgb[2];            
            function toHex(n) {
                n = parseInt(n,10);
                if (isNaN(n)) return "00";
                n = Math.max(0,Math.min(n,255));
                return "0123456789ABCDEF".charAt((n-n%16)/16)
                + "0123456789ABCDEF".charAt(n%16);
            }
            function cutHex(h) {
                return (h.charAt(0)=="#") ? h.substring(1,7) : h
            }
            function hexToR(h) {
                return parseInt((cutHex(h)).substring(0,2),16)
            }
            function hexToG(h) {
                return parseInt((cutHex(h)).substring(2,4),16)
            }
            function hexToB(h) {
                return parseInt((cutHex(h)).substring(4,6),16)
            }            
            return '#'+toHex(R)+toHex(G)+toHex(B);
        };        
        var  sortByPosition= function(data_A, data_B) {
            if(parseInt(data_A[0]) < parseInt(data_B[0]))
                return -1;
            if(parseInt(data_A[0]) > parseInt(data_B[0]))
                return 1;
            return 0;
        };       
        var encode64 = function(input) {
            var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                }	
                else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output+=keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            }	
            return output;
        };   
        var isCanvasSupported = function  ()
        {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));  
        };
        plugin.init();        
    };
    $.fn.gradientCreator = function(options) {
        return this.each(function() {
            if(undefined == $(this).data('gradientCreator')) {
                var plugin = new $.gradientCreator(this, options);
                $(this).data('gradientCreator', plugin);
            }
        });
    };
})(jQuery);