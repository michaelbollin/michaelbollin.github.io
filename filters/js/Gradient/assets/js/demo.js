$(document).ready(function(){
    initSlidesAnchors(); 
    $('#demoHome').gradientCreator({
        gradient: '0% #02CDE8,50% #9303e6,100% #000',
        width: 500 
    });
});
function viewCode(link)
{
    if ($(link).next('.code').css('display') == 'block')
    {
        $(link).next('.code').slideUp(500);
        $(link).html('View source code');
    }
    else
    {
        $(link).next('.code').slideDown(500);
        $(link).html('Hide source code');
    }
}
function initSlidesAnchors()
{
    $('a[href*=#]').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'')
            && location.hostname == this.hostname) {
            var $target = $(this.hash);
            $target = $target.length && $target
            || $('[name=' + this.hash.slice(1) +']');
            if ($target.length) {
                var targetOffset = $target.offset().top;
                $('html,body')
                .animate({
                    scrollTop: targetOffset
                }, 500);
                return false;
            }
        }
    });
}
function isCanvasSupported ()
{
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));  
};
function drawHomeExample()
{
    if (isCanvasSupported()) {
        function drawLandscape() {                                
            var canvas = $('#demoCanvas');
            var ctx = canvas.get(0).getContext('2d');
                                
            // Draw Sky
            var skyGradient = ctx.createLinearGradient(0,0,0,canvas.height());                                
            skyGradient = getGradientFromPoints(skyGradient,skyGradientPoints);                                  
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width(), canvas.height());
                                
            // Draw Ground
            var groundGradient = ctx.createLinearGradient(0,2*canvas.height()/3,0,canvas.height());
            groundGradient = getGradientFromPoints(groundGradient,groundGradientPoints);                             
            ctx.fillStyle = groundGradient;
            ctx.beginPath();
            ctx.moveTo(0, 2*canvas.height()/3);
            ctx.bezierCurveTo(canvas.width()/3, canvas.height(), 2*canvas.width()/3, canvas.height()/2 , canvas.width(), 2*canvas.height()/3);
            ctx.lineTo(canvas.width(),canvas.height());
            ctx.lineTo(0,canvas.height());
            ctx.lineTo(0,canvas.height()/2);
            ctx.fill();
                                
            // Draw Sun
            var sunGradient = ctx.createRadialGradient(3*canvas.width()/4, canvas.height()/4, 0,3*canvas.width()/4, canvas.height()/4, 20);                               
            sunGradient = getGradientFromPoints(sunGradient,sunGradientPoints);                                  
            ctx.fillStyle = sunGradient;
            ctx.beginPath();
            ctx.arc(3*canvas.width()/4, canvas.height()/4, 20, 0, 2 * Math.PI, false);
            ctx.fill();
        }
        function getGradientFromPoints(gradient,gradientPoints)
        {
            $.each(gradientPoints,function (i,point){
                var position = point[0];
                var color = point[1];
                gradient.addColorStop(parseInt(position)/100, color); 
            });     
            return gradient;
        }
        
        $('#demoHome2').html('<canvas id="demoCanvas" width="300" height="180"></canvas><p>Sun :</p><div id="sunGradient"></div><p>Sky :</p><div id="skyGradient"></div><p>Ground :</p><div id="groundGradient"></div>  ');
                            
        // Default Gradients
        var sunGradientPoints = [['0%','#db8300'], ['100%','#ffdd00']];
        var skyGradientPoints = [['0%','#00d2f1'], ['100%','#FFFFFF']];
        var groundGradientPoints = [['0%','#15d215'], ['100%','#013f01']];
                            
        // Gradient Creators initialization
        $('#sunGradient').gradientCreator({
            gradient: sunGradientPoints,
            onChange: function(strColors,cssColors,ArrayColors)
            {
                sunGradientPoints = ArrayColors;
                drawLandscape();
            }
        });
        $('#skyGradient').gradientCreator({
            gradient: skyGradientPoints,
            onChange: function(strColors,cssColors,ArrayColors)
            {
                skyGradientPoints = ArrayColors;
                drawLandscape();
            }
        });
        $('#groundGradient').gradientCreator({
            gradient: groundGradientPoints,
            onChange: function(strColors,cssColors,ArrayColors)
            {
                groundGradientPoints = ArrayColors;
                drawLandscape();
            }
        });                            
        
    }
    else
    {
        $('#demoNoCanvasGrad').gradientCreator({
            gradient: '0% #082e66, 100% #000',
            target: '#demoNoCanvas'
        });
    }
}