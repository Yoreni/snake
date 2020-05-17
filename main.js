//the codes layout and a little bit of the actual code is from kittykatattacks learning pixi.js tutorial i also used pixi.js and collections.js

//alise
let Resources = PIXI.Loader.shared.resources
let Loader = PIXI.Loader.shared
let TextureCache = PIXI.utils.TextureCache
let Sprite = PIXI.Sprite
let Container = PIXI.Container
let Graphics = PIXI.Graphics

//varibles that will be used all over
let snake,snakePos,coin,scoreText,request,endScene,pbText,scored
let inputs = {};
let direction =
{
    right: 0,
    up: Math.PI * 0.5,
    left: Math.PI,
    down: Math.PI * 1.5,
}

var player =
{
    direction: "right",
    reverseSpeed: 8,
    length: 3,
    score: 0,
    pb: 0, 
}

let coinPos = 
{
    x: 0,
    y: 0
}
let frameInc = 0;

let style = new PIXI.TextStyle(
{
    fill: "#AAAAAA",
    fontSize: 200,
    fontFamily: "Calibri"
});

var app = new PIXI.Application({width: 512, height: 512, backgroundColor: 0xEEEEEE});;
document.body.appendChild(app.view);
var state = null;

Loader.add(["images/snake.png","images/snakeCorner.png","images/thing.png","images/snakeTail.png","images/snakeHead.png"]).load(setup);

function setup()
{
    app.stage.sortableChildren = true 

    gameScene = new Container()
    app.stage.addChild(gameScene)
    
    scoreText = new PIXI.Text("0",style)
    scoreText.position.set(256,256)
    scoreText.anchor.set(0.5,0.5)
    gameScene.addChild(scoreText)
    
    snake = new Container();
    snake.zIndex = 1
    snake.sortableChildren = true;
    gameScene.addChild(snake)
    
    snakePos = [{x:7,y:8},{x:8, y:8},{x:9, y:8}];
    for(let a = 0 ; a < player.length ; a++)
    {
        makeSnakePart();
    }
    
    respawnCoin();
    coin = new Sprite(Resources["images/thing.png"].texture)
    coin.position.set(coinPos.x * 16,coinPos.y * 16)
    coin.scale.set(0.5,0.5)
    coin.anchor.set(0.5,0.5)
    gameScene.addChild(coin)
        
    let edge = new Graphics()
    edge.lineStyle(16,0x111111,1)
    edge.drawRect(0,0,512,512)
    gameScene.addChild(edge);
    
    inputs.right = keyboard("ArrowRight");
    inputs.left = keyboard("ArrowLeft");
    inputs.up = keyboard("ArrowUp");
    inputs.down = keyboard("ArrowDown");
    
    endScene = new Container();
    endScene.sortableChildren = true
    endScene.zIndex = 2
    gameScene.addChild(endScene);
    endScene.visible = false;
    
    let bg = new Graphics()
    bg.beginFill(0x444444,0.7)
    bg.drawRect(0,0,512,512);
    bg.endFill()
    endScene.addChild(bg)
    
    let box = new Graphics()
    box.lineStyle(8,0x000000,1)
    box.beginFill(0xDDDDDD)
    box.drawRoundedRect(128,128,256,256,10)
    box.endFill()
    endScene.addChild(box)
    
    let gameover = new PIXI.Text("Game Over!",{fontSize: 36,fontWeight: "bold",fontFamily: "Calibri"})
    gameover.position.set(256,152)
    gameover.anchor.set(0.5,0.5)
    endScene.addChild(gameover)
    
    scored = new PIXI.Text("You scored: " + player.score,{align: "center",fontSize: 28,fontFamily: "Calibri"})
    scored.position.set(256,270)
    scored.anchor.set(0.5,0.5)
    endScene.addChild(scored)
    
    pbText = new PIXI.Text("",{align: "center",fontSize: 28,fontFamily: "Calibri"})
    pbText.position.set(256,242)
    pbText.anchor.set(0.5,0.5)
    endScene.addChild(pbText)
    
    let playagainButton = new Container();
    playagainButton.position.set(154,320)
    endScene.addChild(playagainButton)
    let box2 = new Graphics()
    box2.lineStyle(4,0x000000,1)
    box2.beginFill(0xebf287)
    box2.drawRoundedRect(0,0,200,50,10)
    box2.endFill()
    playagainButton.addChild(box2)
    
    let pa = new PIXI.Text("Play Again!",{fontSize: 24,fontWeight: "bold",fontFamily: "Calibri"})
    pa.position.set(45,12)
    playagainButton.addChild(pa)
    playagainButton.interactive = true;
    var filter = new PIXI.filters.ColorMatrixFilter();
    playagainButton.filters = [filter]
    
    playagainButton.on("pointerover",function() 
    {
        filter.brightness(1.3,false)
    });
    playagainButton.on("pointerout",function() 
    {
        filter.brightness(1,false)
    });
    
    playagainButton.on("mousedown",function() 
    {
        filter.brightness(0.8,false)
    });
                    
    playagainButton.on("mouseup",function() 
    {
        filter.brightness(1,false)
        if(player.score > player.pb) player.pb = player.score;
        player.score = 0;
        scoreText.text = "0"
        player.reverseSpeed = 8;
        player.length = 3;
        player.direction = "right";
        snake.removeChildren(0,snake.children.length)
        snakePos = [{x:7,y:8},{x:8, y:8},{x:9, y:8}];
        for(let a = 0 ; a < player.length ; a++)
        {
           makeSnakePart();
        }

        respawnCoin();
        coin.position.set(coinPos.x * 16,coinPos.y * 16)
        
        endScene.visible = false;
        
        state = play;
    })
    
    state = play
    app.ticker.add(delta => gameLoop(delta));
}

function makeSnakePart()
{
    let part = new Sprite(Resources["images/snake.png"].texture)
    part.scale.set(2,2)
    part.anchor.set(0.5,0.5)
    snake.addChild(part)
}

function gameLoop(delta)
{
    state(delta)
}

function play(delta)
{
    
    if(inputs.right.isDown && player.direction != "left") request = "right"
    if(inputs.left.isDown && player.direction != "right") request = "left"
    if(inputs.up.isDown && player.direction != "down") request = "up"
    if(inputs.down.isDown && player.direction != "up") request = "down"
    
    if(player.direction != null && frameInc >= player.reverseSpeed)
    {
        frameInc = 0;
        
        if(request != null)
        {
            player.direction = request;
            request = null;
        }
        
        let newPos =
        {
            x: snakePos[snakePos.length - 1].x,
            y: snakePos[snakePos.length - 1].y
        }
        
        switch(player.direction)
        {
            case "right":
                newPos.x++
                break;
            case "left":
                newPos.x--;
                break;
            case "down":
                newPos.y++;
                break;
            case "up":
                newPos.y--;
                break;
        }
        snakePos.push(newPos)
        
        //checks if the snake is touching the coin
        if(snakePos[snakePos.length - 1].x == coinPos.x && snakePos[snakePos.length - 1].y == coinPos.y)
        {
            var speedupReq = [900,600,300,160,95,50,20,10,5]
            player.score++
            scoreText.text = player.score
            player.length++
            respawnCoin();
            coin.position.set(coinPos.x * 16,coinPos.y * 16)
            if(player.reverseSpeed > 0 && speedupReq[player.reverseSpeed] == player.score) player.reverseSpeed--;
            makeSnakePart();
        }
        
        if(isGameover())
        {
            endScene.visible = true;
            state = end
        }
        
        if(snakePos.length > player.length) snakePos.shift()
    }
    else frameInc++;
    
    for(let a = 0 ; a < snake.children.length ; a++)
    {
        let part = snake.children[a]
        part.x = snakePos[a].x * 16
        part.y = snakePos[a].y * 16
        
        //if(a == 0) part.texture = TextureCache["images/snakeTail.png"]
        //else if(a == snake.length - 1) part.texture = TextureCache["images/snakeHead.png"]
        if(a > 0 && a < snake.children.length - 1)
        {
            partPos = []
            for(let b = -1; b < 2 ; b++)
            {
                partPos.push(
                {
                    x: snakePos[a + b].x - snakePos[a].x,
                    y: snakePos[a + b].y - snakePos[a].y,
                })
            }
            
            if((partPos[0].x == partPos[2].x * -1) || partPos[0].y == partPos[2].y * -1) 
            {
                part.texture = TextureCache["images/snake.png"]
                if(partPos[0].x > partPos[2].x) part.rotation = direction.right
                else if(partPos[0].x < partPos[2].x) part.rotation = direction.left
                else if(partPos[0].y > partPos[2].y) part.rotation = direction.up
                else if(partPos[0].y < partPos[2].y) part.rotation = direction.down
                
            }
            else 
            {
                part.texture = TextureCache["images/snakeCorner.png"]
                if((partPos[0].x == -1 && partPos[2].y == 1) || (partPos[0].y == 1 && partPos[2].x == -1)) part.rotation = direction.down
                if((partPos[0].x == 1 && partPos[2].y == 1) || (partPos[0].y == 1 && partPos[2].x == 1)) part.rotation = direction.left
                if((partPos[0].x == 1 && partPos[2].y == -1) || (partPos[0].y == -1 && partPos[2].x == 1)) part.rotation = direction.up
                if((partPos[0].x == -1 && partPos[2].y == -1) || (partPos[0].y == -1 && partPos[2].x == -1)) part.rotation = direction.right
            }
        }
    }
    snake.children[0].texture = TextureCache["images/snakeTail.png"]
    if(snake.children[0].x < snake.children[1].x) snake.children[0].rotation = direction.right
    else if(snake.children[0].x > snake.children[1].x) snake.children[0].rotation = direction.left
    else if(snake.children[0].y < snake.children[1].y) snake.children[0].rotation = direction.up
    else if(snake.children[0].y > snake.children[1].y) snake.children[0].rotation = direction.down
    let a = snake.children.length - 1
    snake.children[a].texture = TextureCache["images/snakeHead.png"]
    if(snake.children[a].x > snake.children[a - 1].x) snake.children[a].rotation = direction.right
    else if(snake.children[a].x < snake.children[a - 1].x) snake.children[a].rotation = direction.left
    else if(snake.children[a].y > snake.children[a - 1].y) snake.children[a].rotation = direction.up
    else if(snake.children[a].y < snake.children[a - 1].y) snake.children[a].rotation = direction.down
}

function end()
{
    if(player.score > player.pb) pbText.text = "New Hi-Score";
    else pbText.text = "Hi-Score: " + player.pb
    
    scored.text = "You scored: " + player.score;
}

function isGameover()
{
    var head = snakePos[snakePos.length - 1]
    
    if((head.x < 1 || head.x > 31) ||( head.y < 1 || head.y > 31)) return true;
    
    var toLookAt = snakePos.slice(0,snakePos.length - 2);
    for(var part of toLookAt)
    {
        if(part.x == head.x && part.y == head.y)
        {
            return true;
        }
    }
    return false;
}

function respawnCoin()
{
    var pos = {}
    do
    {
        pos =
        {
            x: randomInt(1,31),
            y: randomInt(1,31)
        }
        var unrespawnable = false
        for(var part of snakePos)
        {
            if(pos.x == part.x && pos.y == part.y)
            {
                unrespawnable = true
            }
        }
    }
    while(unrespawnable)
    coinPos = pos;
}

function hitTestRectangle(r1, r2) 
{

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + (r1.width * r1.scale.x) / 2;
  r1.centerY = r1.y + (r1.height * r1.scale.y) / 2;
  r2.centerX = r2.x + (r2.width * r2.scale.x) / 2;
  r2.centerY = r2.y + (r2.height * r2.scale.y) / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = (r1.width * r1.scale.x) / 2;
  r1.halfHeight = (r1.height * r1.scale.y) / 2;
  r2.halfWidth = (r2.width * r2.scale.x) / 2;
  r2.halfHeight = (r2.height * r2.scale.y) / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) 
  {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) 
    {
      //There's definitely a collision happening
      hit = true;
    } 
    else 
    {

      //There's no collision on the y axis
      hit = false;
    }
  }
  else 
  {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};

function contain(sprite, container) 
{
  let collision = undefined;
  //Left
  if (sprite.x - (sprite.width / 2) < container.x) 
  {
    sprite.x = container.x + (sprite.width / 2);
    collision = "left";
  }
  //Top
  if (sprite.y - (sprite.width / 2)< container.y) 
  {
    sprite.y = container.y + (sprite.width / 2);
    collision = "top";
  }
  //Right
  if (sprite.x + (sprite.width / 2) > container.width)
  {
    sprite.x = container.width - (sprite.width / 2);
    collision = "right";
  }
  //Bottom
  if (sprite.y + (sprite.height / 2) > container.height) 
  {
    sprite.y = container.height - (sprite.height / 2);
    collision = "bottom";
  }
  //Return the `collision` value
  return collision;
}


//The `randomInt` helper function
function randomInt(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function keyboard(value) 
{
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  //The `downHandler`
  key.downHandler = event => 
  {
    if (event.key === key.value) 
    {
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = event => 
  {
    if (event.key === key.value) 
    {
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);
  
  window.addEventListener(
    "keydown", downListener, false
  );
  window.addEventListener(
    "keyup", upListener, false
  );
  
  // Detach event listeners
  key.unsubscribe = () => 
  {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };
  
  return key;
}