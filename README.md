# SGI 2023/2024

## Final Project

See a demo of the game:

[![Youtube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=n-0iz8mW5w0)

### Game Instructions

The game starts with a menu screen, where the user can choose to start the game, see some basic instructions or exit the game.
The user selects a name, a track, then difficulty and, if it is not in easy mode, a menu appears to drop obstacules on the track. Finally, when all demanded obstacules are placed, a garage opens up so the player can choose the car to play as.

The game then starts and the player can control the car with the AWSD keys (and also pause with ESC). The rival car is invincible and is not affected by any collisions or modifiers from powerups/obstacles. The player must avoid the obstacles and catch the powerups to win the game to maximize its chance of winning the race of 3 laps. The more powerups catched, the more obstacles appear on the map, so equilibrium is key to winning the game.

In the end, the player is presented with a podium with basic time stats and can choose to play again or exit the game. The scene has multiple elements to provide liveliness and immersion, like trees, mountains, skybox, water, fireworks, etc.
The game has sound effects, background music and a debug menu with useful options.

### Screenshots

![Menu](tp3/screenshots/garagem.png)
![Menu](tp3/screenshots/complete_scene.png)
![Menu](tp3/screenshots/Prepare-countdown.png)
![Menu](tp3/screenshots/inGamePlay.png)
![Menu](tp3/screenshots/outdoor.png)
![Menu](tp3/screenshots/HUD.png)
![Menu](tp3/screenshots/television.png)
![Menu](tp3/screenshots/water-reflection.png)
![Menu](tp3/screenshots/drop_down_menu.png)
![Menu](tp3/screenshots/menu_principal.png)
![Menu](tp3/screenshots/map-selection.png)
![Menu](tp3/screenshots/fogo-artificio.png)

### Implemented features

All demanded features were implemented:

- track creation with catmull-rom curves
- car movement (AWSD keys) with tire animations, steering, speed control and friction
- rival car movement (automatic) using soft keyframes animation
- multiple menus with mouse hover and click detection
- Raycasting picker for menu interaction
- car selection (with garage)
- lap count and time stats tracking and update on in-game HUD
- text based on spritesheet for better performance
- pause menu (ESC key)
- collision detection for cars, obstacles and out of track bounds
- powerups (speed boost, invincibility)
- obstacles (slowdown, control inversion)
- box pulsating shader with transparency for powerups and obstacles
- outdoor display with lap count and time stats. Also present in the HUD panel
- creation of a TV screen (with 3D effect for depth) using shaders of first-person camera view
- particle animation of colorful fireworks with explosion effect on the podium for the winner
- particle system using physics for realistic effects

### Extra features

Multiple extra features were implemented:

- multiple tracks in JSON format with a track parser for easy new track addition
- menu for selecting the multiple tracks with a catmull-rom curve to preview the track
- python script to convert png track drawings into track JSON files
- rival car calculates its own path to follow the track for adaptability
- car smoke particles when standing still
- countdown animation and win/lose animation
- water lake shader with reflection, refraction and waves
- sound effects in menus and game
- background game music for immersive experience
- using of pre-made objects for a more detailed/good-looking scene
- Nametag sprites above cars
- immersive scenary with billboard trees, skybox and mountains surrounding the track
- debug flight camera with useful information like position
- debug menu with useful options and toggles
- shader loader for code organization

## [Side Project 1](tp1/README.md)

### Project information

- **Exploration of different types of textures**. Namely, simple textures, video textures and normal maps.
- **Exploration of different types of materials**. For instance, metalic materials for the chair and table support, a wood material for the table top, ceil and floor, a red cloath material for the chair, a clay material for the jar and a glass translucide material for the window.
- **Exploration of different types of lights and shadows**. Namely, spotlights, point lights and directional lights. With lights entering the room from the windows, giving more realism for the scen and shadows being casted in the scene.
- **Exploration of different types of cameras**. Namely, perspective cameras, first person camera and orthographic cameras for frontal and back view
- **Exploration of lines**. Namely, the use of lines to draw a frame of a car, a folded newspaper, a spring and a vase with a flower in it.

### Scene description

- A scene with a wooden table and 4 red chairs, a carpet, a clay jar with a sunflower, a workign television and 3 frames (of a dog, cat and a car drawn with lines). On the table is a cake on a plate, a jornal with multiple pages and a spring. There are 4 lights on the corners of the room and one spotlight on top of the cake. Sunlight is streaming into the room through the window.
- Its possible to see the outside of the window moving around, following the camera. A skybox is used to give the parallax illusion of a landscape outside the window.

![view](tp1/screenshots/general_view.png)
![view](tp1/screenshots/cake_jornal.png)
![view](tp1/screenshots/spring.png)
![view](tp1/screenshots/realistic_fire.png)
![view](tp1/screenshots/portraits.png)
![view](tp1/screenshots/tv_vase.png)

### Extra features

- The camera has a **first person view** that can be moved around the scene using the keyboard (WASD + Arrows + SHIFT + Space) .
- Use of a **skybox** to give the illusion of a landscape outside the window
- Use of a **video texture** for the television
- Use of a **normal maps** for floor, wood table top and chair
- Optional **shader** for a more realistic fire in the candle

### [Side Project 2](tp2/README.md)

#### Implemented Features

- Scene graph hierarchy organization
- Scene graph material, texture, transformation, shadows inheritance
- Node duplication to resolve scene tree issues in ThreeJS
- Utilization of various materials
- Implementation of LOD (Level of Detail) on two objects (a spaceship with three levels and a statue with two levels)
- Implementation of a Space Skybox displaying stars
- Integration of simple textures
- Implementation of Mip-Map Texture with four different resolutions for a holographic table (including a small mark - for easier assessment)
- Application of Bump Map textures on the metal floor, garage door, and sand floor
- Integration of Video texture on a door's code and on the energy orb on the main statue
- Display of a Wireframe object in a holographic globe projection
- Implementation of Buffer Geometry
- Introduction of a GUI for interaction and scene control

#### Scene description

![view](tp2/screenshots/main_room.png)
![view](tp2/screenshots/living_room.png)
![view](tp2/screenshots/lod.png)
![view](tp2/screenshots/statue.png)

#### Special features

- Nurbs used for statue and spaceship for extra geometry detail
- Fully Implemented YASF (XML) features
- Creative scene


## Group T04G08

| Name          | Number    | E-Mail                     |
| ------------- | --------- | -------------------------- |
| Marco André   | 202004891 | <up202004891@edu.fe.up.pt> |
| Ricardo Matos | 202007962 | <up202007962@edu.fe.up.pt> |
