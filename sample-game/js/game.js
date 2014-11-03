var actor = null;
(function(){
  var dpr = window.devicePixelRatio;
  var w = window.innerWidth;
  var h = window.innerHeight;
  var canvas = document.createElement('canvas');

  canvas.width= w;
  canvas.height= h;
  var scale = Math.min(window.innerHeight/h,window.innerWidth/w);
  document.body.appendChild(canvas);

  var alpha = 0;
  var beta = 0;
  var gamma = 0;

  var speed = 3/2;
  var position = {
    x: 0,
    y: 0
  };

  var keys = [0,0,0,0]; // left, up, right, down
  var sensitivity = 30;

  window.addEventListener('deviceorientation', function (event) {
    alpha = event.alpha;
    beta = Math.round(event.beta*10);
    gamma = Math.round(event.gamma*10);
    if(gamma < -sensitivity){
      keys[0] = 1;
      keys[2] = 0
    }else if(gamma > sensitivity){
      keys[0] = 0;
      keys[2] = 1;
    }else{
      keys[0] = 0;
      keys[2] = 0;
    }

    if(beta < -sensitivity){
      keys[1] = 1;
      keys[3] = 0
    }else if(beta > sensitivity){
      keys[1] = 0;
      keys[3] = 1;
    }else{
      keys[1] = 0;
      keys[3] = 0;
    }

  },true);
  window.addEventListener('load',__scene1,false);
  window.addEventListener('keydown', __keyDown, false);
  window.addEventListener('keyup', __keyUp, false);

  Cocoon.App.on("activated", function(){
    console.log("application activated.");
    Cocoon.App.resume();
    console.log("application resumed.");
  });
  Cocoon.App.on("suspending", function(){
    console.log("application suspending.");
  });
  Cocoon.App.on("suspended", function(){
    console.log("application suspended.");
    Cocoon.App.pause();
    console.log("applciation paused.");
  });


  CAAT.DEBUG=0;

  function __keyDown(e){
    if(e.keyCode >= 37 && e.keyCode <= 40)
      keys[e.keyCode-37] = 1;
  }

  function __keyUp(e){
    if(e.keyCode >= 37 && e.keyCode <= 40)
      keys[e.keyCode-37] = 0;
  }
  function __scene1() {

      //var actor= null;

      CAAT.Foundation.Actor.extend(
          {
            d_x: 0,
            d_y: 0,
            tmp_x: 0,
            tmp_y: 0,
            tmp_anim: 'stand',
            stopAnimationCoef: 10000,
            paint : function(director,time) {

              CAAT.Dude.superclass.paint.call(this,director,time);
            },
            slowAnimation: function(n){
              this.backgroundImage.changeFPS = this.backgroundImage.animationsMap[this.tmp_anim].time * n;
            },
            startAnimation: function(){
              this.backgroundImage.changeFPS = this.backgroundImage.animationsMap[this.tmp_anim].time;
            },
            move: function (){
              this.d_x = 0;
              this.d_y = 0;
              this.tmp_anim = "stand";
              this.tmp_y = this.y;
              this.tmp_x = this.x;
              if(keys[0]==1){
                this.tmp_x -= speed;
                if(this.tmp_x >= 0){
                  this.setImageTransformation(CAAT.Foundation.SpriteImage.TR_FLIP_HORIZONTAL);
                  this.d_x = -1;
                  this.tmp_anim = "run_f";
                }else{
                  this.tmp_x += speed;
                }
              }else if(keys[2]==1){
                this.tmp_x += speed;
                if(this.tmp_x <= w - this.width){
                  this.setImageTransformation(CAAT.Foundation.SpriteImage.TR_NONE);
                  this.d_x = 1;
                  this.tmp_anim = "run_f";
                }else{
                  this.tmp_x -= speed;
                }
              }

              if(keys[1]==1){
                this.tmp_y -= speed;
                if(this.tmp_y >= 0){
                  this.d_y = -1;
                  this.tmp_anim = "wall_ud";
                }else{
                  this.tmp_y += speed;
                }
              }else if(keys[3]==1){
                this.tmp_y += speed;
                if(this.tmp_y <= h - actor.height){
                  this.d_y = 1;
                  this.tmp_anim = "wall_ud";
                }else{
                  this.tmp_y -= speed;
                }
              }

              if(this.d_x!=0 && this.d_y!=0){
                this.tmp_anim = "wall_lr";
              }else{
                this.tmp_x += this.d_x * speed;
                this.tmp_y += this.d_y * speed;
              }

              if(this.tmp_anim == "run_f" && this.tmp_y != h - actor.height){
                this.tmp_anim = "wall_lr";
              }

              if(this.x!=this.tmp_x || this.y!=this.tmp_y){
                this.playAnimation(this.tmp_anim);
                this.startAnimation();
                this.setLocation(this.tmp_x,this.tmp_y);
              }else{
                if(this.y< h - actor.height){
                  this.slowAnimation(10000);
                }else{
                  this.playAnimation("stand");
                }
              }
            }
          },
          null,
          "CAAT.Dude"
      );

      new CAAT.Module.Preloader.Preloader().
              addElement("dude", "imgs/dude.png").
              addElement('cake1',"imgs/cake1.png").
              addElement('cake2',"imgs/cake2.png").
              addElement('cake3',"imgs/cake3.png").
              addElement('cake4',"imgs/cake4.png").
              addElement('cake5',"imgs/cake5.png").
              load( __load);

      function __load(images) {
        var director= new CAAT.Foundation.Director().initialize(w,h,canvas);
        var scene = director.createScene();

        var reset= function(spriteImage, time) {
            spriteImage.playAnimation("stand");
        };
        var root= new CAAT.ActorContainer().setBounds(0,0,director.width,director.height);
        root.setFillStyle('#FFF');
        scene.addChild(root);

        var si= new CAAT.Foundation.SpriteImage().initialize( images[0].image, 21, 7).
                addAnimation("stand",   [123,124,125, 126,127,128,129,130,131,132, 133,134,135,136,137,138,139, 140,141,142,143,144], 100).
                addAnimation("fall",    [0,1,2,3,4,5,6,7], 100, reset).
                addAnimation("wall_ud", [74,75,76, 77,78,79,80,81], 100).
                addAnimation("wall_lr", [82,83, 84,85,86,87,88,89], 100).
                addAnimation("wall_stop", [74], 30).
                addAnimation("tidy",    [42,43,44,45,46,47,48, 49,50], 100, reset).
                addAnimation("die",     [68,69, 70,71,72,73], 100, reset).
                addAnimation("jump",    [95,94,93,92,91, 90], 100, reset).
                addAnimation("run_b",   [96,97, 98,99,100,101,102,103,104, 105,106,107,108,109,110,111, 112,113,114,115,116,117,118, 119,120,121,122], 30).
                addAnimation("run_f",   [122,121,120,119, 118,117,116,115,114,113,112, 111,110,109,108,107,106,105, 104,103,102,101,100,99,98, 97,96], 30).
                addAnimation("sad",     [26,27, 28,29,30,31,32,33], 100);

        actor = new CAAT.Dude().
            setBackgroundImage(si).
            setLocation( 0, h-si.getHeight() ).
            enableEvents(false).
            playAnimation("fall");
        root.addChild(actor);
        position.x = actor.x;
        position.y = actor.y;

        scene.onRenderEnd = function(time) {
          actor.move();
        };

        CAAT.loop(60);
    }
  }

})();
