var canvas,context;
var canvas2,context2;
var maxChildren = 1000;
var currentChildren = 0;
var bars;
var SX,SY;
var g;

var Bar = function(color,func){
    this.color = color;
    this.func = func;
    this.held = false;
    this.p = .5;
};

var mouse = {x:0,y:0,down:false};
Bar.prototype.update = function(c){
    c.save();
    c.translate(this.x,this.y);
    c.fillStyle = this.color;
    c.fillRect(-100,-10,200,20);
    c.fillStyle = "#fff";
    c.fillRect(-100 - 5 + 200 * this.p,-10,10,20);
    
    if (mouse.down && Math.abs(mouse.x - (this.x + SX - 250)) < 100 && Math.abs(mouse.y - (this.y + SY - 200)) < 10){
        this.p = (mouse.x - (this.x + SX - 250))/200 + .5;
        this.func(this.p);
    }
    
    c.restore();
};

var colorWeight = [256,256,256];
var init = function(){
    canvas = document.createElement("canvas");
    SX = window.innerWidth;
    SY = window.innerHeight;
    canvas.width = SX;
    canvas.height = SY;
    document.body.appendChild(canvas);
    context = canvas.getContext('2d');
    
    canvas2 = document.createElement("canvas");
    canvas2.width = 200;
    canvas2.height = 200;
    canvas2.style.position = "absolute";
    canvas2.style.left = SX - 250;
    canvas2.style.top = SY - 200;
    context2 = canvas2.getContext('2d');
    document.body.appendChild(canvas2);
    
    bars = [];
    
    var color = ["#f00","#0f0","#00f"];
    
    
    bars.push(new Bar(color[0],function(x){
        colorWeight[0] = x * 256;
    }));
    bars[bars.length - 1].p = 1;
    bars.push(new Bar(color[1],function(x){
        colorWeight[1] = x * 256;
    }));
    bars[bars.length - 1].p = 1;
    bars.push(new Bar(color[2],function(x){
        colorWeight[2] = x * 256;
    }));
    bars[bars.length - 1].p = 1;
    
    bars.push(new Bar("#aaa",function(x){
        maxChildren = 20 + (x*x) * (10000 - 20);
        if (currentChildren > maxChildren){
            g.children.splice(maxChildren,currentChildren - maxChildren);
            currentChildren = maxChildren;
        }
    }));
    bars[bars.length - 1].p = .316;
    
    bars.push(new Bar("#888",function(x){
        speed = .01 + (x*x) * (10);
    }));
    bars[bars.length - 1].p = .137;
    
    for (var i = 0;i<bars.length;i++){
        bars[i].x = 100;
        bars[i].y = i * 30 + 10;
    }
    context.fillRect(0,0,SX,SY);
    
    addEventListener("mousemove",function(e){
        mouse.x = e.pageX;
        mouse.y = e.pageY;
    });
    addEventListener("mousedown",function(e){
        mouse.x = e.pageX;
        mouse.y = e.pageY;
        mouse.down = true;
    });
    addEventListener("mouseup",function(e){
        mouse.x = e.pageX;
        mouse.y = e.pageY;
        mouse.down = false;
    });
    reset();
    setInterval(update,1000/60);
    
};
function reset(){
    g = new a();
    g.timeToDeath = 9999;
    context.fillStyle = "#131313";
    context.globalAlpha = 1;
    context.fillRect(0,0,SX,SY);
    currentChildren = 0;
}
var speed = 2 / 10;
var childChance = 0.01;
var a = function(x,y){
    this.x = x || 0;
    this.y = y || 0;
    this.timeToDeath = Math.random() * 1000;
    this.xs = 0;
    this.color = randomBrightHex();
    this.ys = 0;
    this.children = [];
};
function randomBrightHex(){
    var red = Math.floor(Math.random() * colorWeight[0]);
    var blue = Math.floor(Math.random() * colorWeight[1]);
    var green = Math.floor(Math.random() * colorWeight[2]);
    while(red!=255 && blue != 255 && green != 255){
        red++;
        blue++;
        green++;
    }
    var string = (red * 256 * 256 + blue * 256 + green).toString(16);
    while(string.length<6){
        string = "0" + string;
    }
    return "#" + string;
}
a.prototype.update = function(c){
    this.timeToDeath --;
    if (this.timeToDeath<=0){
        return true;
    }
    this.x += this.xs;
    this.y += this.ys;
    this.xs += (Math.random() - .5)*speed;
    this.ys += (Math.random() - .5)*speed;
    if (this.x + this.xs < -SX/2){
        this.xs = Math.abs(this.xs);
    }else if (this.x + this.xs > SX/2){
        this.xs = Math.abs(this.xs) * -1;
    }
    if (this.y + this.ys < -SY/2){
        this.ys = Math.abs(this.ys);
    }else if (this.y + this.ys > SY/2){
        this.ys = Math.abs(this.ys) * -1;
    }
    if (Math.random() < childChance && currentChildren < maxChildren){
        currentChildren ++;
        var child = new a(this.x,this.y);
        child.xs = this.xs /2;
        child.ys = this.ys /2;
        this.xs /=2;
        this.ys /=2;
        g.children.push(child);
    }
    c.fillStyle = this.color;
    c.fillRect(this.x-1,this.y-1,2,2);
    for (var i = this.children.length-1;i>=0;i--){
        if (this.children[i].update(c)){
            var removedChild = this.children.splice(i,1)[0];
            if (removedChild != null){
                for (var u = 0;u<removedChild.children.length;u++){
                    this.children.push(removedChild[u]);
                }
                currentChildren --;
            }
        }
    }
};

var timeSinceMouse = 0;
function update(){
    context.globalAlpha = .05;
    context.fillStyle = "#000";
    context.fillRect(0,0,SX,SY);
    context.save();
    context.globalAlpha = .1;
    context.translate(SX/2,SY/2);
    context.fillStyle = "#fff";
    if (g.update(context)){
        var n = new a();
        n.children = g.children;
        g = n;
    }
    
    if (mouse.down){
        function dot(k){
            var a = k.x - mouse.x + SX/2;
            var b = k.y - mouse.y + SY/2;
            var c = Math.sqrt(a*a+b*b);
            if (c<300 && c!=0){
                k.xs += a / (c*c) * 10;
                k.ys += b / (c*c) * 10;
            }
        }
        for (var i = 0;i<g.children.length;i++){
            dot(g.children[i]);
        }
        dot(g);
    }
    
    context.restore();
    
    if (mouse.x > SX - 250 && mouse.y > SY - 250 && timeSinceMouse > 0){
        timeSinceMouse --;
    }else if (timeSinceMouse < 30){
        timeSinceMouse ++;
    }
    if (timeSinceMouse < 30){
        context2.clearRect(0,0,200,200);
        context2.globalAlpha = .25 - timeSinceMouse/30/4;
        for (var i = 0;i<bars.length;i++){
            bars[i].update(context2);
        }
        context2.fillStyle = "#fff";
        context2.fillText("Press space to reset",10,180);
    }
    context.globalAlpha = .05;
    context.fillStyle = "#fff";
    context.fillText("By Severin Ibarluzea",10,SY-10);
}
window.onload = init;

function getImage(){
    window.open(canvas.toDataURL(),"_blank");
    window.focus();
}

window.addEventListener("keydown",function (e) { if (e.keyCode == 13){ getImage(); }else if(e.keyCode == 32){ setTimeout(reset,1000); } } );
//setInterval(getImage,10000);
//setInterval("window.location.reload(false);",1000 * 30);
