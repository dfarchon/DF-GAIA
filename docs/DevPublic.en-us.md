# DevPublic

## Overview

The main DevPublic interface is shown below:

<p align="center">
    <img src="https://user-images.githubusercontent.com/25214732/171418895-4a901cdf-8f97-49a7-85a5-bd51244a8ede.png" width=300 >
</p

The top half of the panel is the function selection area, where you can select different buttons to use the corresponding function; the bottom green part is the logging area, where the logs are printed in real time while the plugin is working.

## Standalone modules

### **planet info**

- Function overview
  - Quickly view information about the target planet
- How to use
  1. Select the planet of interest
  2. Click on the `plane info` button
  3. The information about the corresponding planet will be printed in the output window
  4. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/25214732/171419159-7e3b478d-3fea-4a06-810d-344d9a590fca.gif" width=400><p>

### **hard fresh**

- Function Description
  - Forces a planet to be refreshed, re-reading the latest status of the planet from the contract
- How to use
  1. Select the planet to be refreshed
  2. Click the `hard fresh` button
  3. When `[RP] refresh planet end` is displayed in the log area, the refresh is complete
  4. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/25214732/171419813-81fa3e31-ced1-4286-b623-4f83fba145c6.gif" width=400 ><p>


### **center view**

- Function Description
  - Automatically calculates the centre of your planet group, and adjusts the view
- How to use
  1. Click the `center view` button
  2. Wait for `[CV] == center view finish ==' to be output in the log area, the view is finished
  3. Example usage

<p align="center"><img src="https://user-images.githubusercontent.com/25214732/171419936-a5f31190-28d9-4c3b-959b-5d888b6b7b77.gif" width=500 ><p>


### **move silver**

- Function Overview
  - Automatically distributes silver ore to planets and black holes
- How to use
  1. Click on the `move silver` button
  2. The log area will output an overview of the current silver mines, and will start automatically distributing silver mines to the top three silver producing planets. Priority will be given to planets, followed by black holes.
  Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171436959-99dc0106-e4b8-4bc3-b777-f6e4d75fccf3.gif" width=500 ><p>

    
### **show cluster**

- Function Description
  - Use the clustering algorithm to cluster your own planets and show the results
- How to use
  1. Click on the `show cluster` button
  2. The results of the clustering will be displayed in the log section, and the planets of different classes will be marked on the map
  3. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171437310-a933829c-d849-44fd-a878-cfec8581c389.gif" width=500 ><p>


### **move silver to blackhole**

- Function Description
  - Automatically move silver to blackhole
- How to use
  1. Click on the `move silver to blackhole` button
  2. The first three ore producing planets with the most silver will be operated and the silver will start to move to the blackhole automatically
  3. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171437501-6a8967c7-340f-487a-9835-3284c9c5715d.gif" width=500 ><p>


### **withdraw silver**

- Function Description
  - Automatic extraction of silver ore
- How to use
  1. Click the `withdraw silver` button
  2. Automatically draw silver from the top 6 black holes with the highest number of silver ores
  3. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171437751-8fb4db32-6ebc-4b5f-91ca-0f6997aca9be.gif" width=500 ><p>


### **upgrade**

- Feature Description
  - Automatic planet upgrade
- How to use
  1. Click the `upgrade` button
  2. Sort the planets by their rank, and the plugin will automatically upgrade the first 6 planets that meet the criteria to upgrade the distance rank, followed by the speed rank.
  3. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171437948-1bf2c7d8-abbb-43b0-a612-8ec2cec68b80.gif" width=500 ><p>

    
### **invade/capture**

- Function Description
  - Automatically invade/capture eligible planets
- How to use
  1. Click the `invade/capture` button
  2. The plugin will automatically invade/capture all eligible planets
  3. Example usage

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171438090-a6275339-c13a-416b-ba31-2b39c11b60b2.gif" width=500 ><p>

    
### **abandon50**

- Function Description
  - Automatically abandon low level/captured planets, releasing at least 50 junk values
- How to use
  1. Click the `abandon50` button
  2. The plugin will automatically abandon low level planets, the default maximum level is 4, which can be manually adjusted in the `async function abandon50` function.
  3. Example usage (note the change in junk value)

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171438226-de86b432-f137-412e-82ef-a065d8c8c7ad.gif" width=500 ><p



    
### **catch yellow selected**

- Function Description
  - Automatically captures planets within the yellow zone
- How to use
  1. Select the planet to attack
  2. Click the 'catch yellow selected' button
  3. The plug-in will use the selected planet as the attack initiation point and send energy to capture planets in the nearby yellow zone
  4. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171438520-6af0e16a-ba43-4693-911a-c1f5c4a2ca18.gif" width=500><p>

    
### **catch invade candidates/selected**

- Function Description
  - Automatically captures planets that do not currently have an owner and have met the capture condition (have been invaded and have met the duration condition)
- How to use
  1. Click on the `catch yellow candidates/selected` button
  2. The plugin will automatically calculate the appropriate attack plan and send energy to capture planets in the nearby yellow zone, or if `selected`, to attack from the specified planet
  3. Example of use (same as catch yellow selected)
    
>Note: It may be necessary to combine devShow.js to find planets that meet the criteria.

### **center energy&silver selected**

- Function Description
  - Focuses energy and silver ore to the selected planet
- How to use
  1. Select the target planet
  2. Click on the `center energy&silver selected` button
  3. The plug-in will concentrate energy and silver to the selected planet 
  4. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171438778-ab6bf279-17ef-47b0-b072-b1602f3af0b7.gif" width=500 ><p

    
### **collect6**

- Function Description
  - Concentrate energy and silver ore to the selected planet
- How to use
  1. Click on the collect6 button
  2. The planets belonging to me are sorted according to certain rules (using the planet rank as the main sorting basis, taking into account the relevant status of capture) and the energy is automatically pooled to the top 6 planets.
  3. Example of use

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171439098-331f66e1-df66-4d24-8dc7-feeca037e711.gif" width=500 ><p

    
### **gossip** module

- Functionality overview
  - The gossip module is a comprehensive auto-expansion module that allows the player to select one or more planets as the target direction each time, and run the module to automatically expand in the direction of the selected planet.
- How to use
  1. Select a target planet, click `add 1` to add it to the queue
  2. Click on `gossip` to automatically expand in the selected direction
  3. Use `clear 1` to remove the selected planet from the queue, or `clear all` to remove all the planets
  4. Example usage

<p align="center"><img src="https://user-images.githubusercontent.com/30570177/171443691-1e376945-2500-4fc3-9b69-7602c3eb7d59.gif" width=500 ><p>


## Logging area (green output window)

- Features
 
  
