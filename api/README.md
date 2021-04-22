# BeeLogger API Documentation

## [GET] /api/data/get
### Params: ```from, to```
This route accepts two parameters. **_'from'_** defines where the returned data is supposed to start and **_'to'_** where it's supposed to end.

A call to this route is formated like this:
> /api/data/get/?from=day-month-year&to=day-month-year

Example:
> /api/data/get/?from=03-08-2004&to=23-01-2020

<br>

## [GET] /api/data/insert
### Params: ```token, t, w, h```
This route allows the hardware to post the data to the server so that it can save it in the corresponding MySQL database.
* ```token```: Value defined as _'insert_token'_ in config.py
* ```t```: The temperature
* ```w```: The weight
* ```h```: The humidity

<br>

## [GET] /api/data/scales
### Params: ```token, w, n```
In the case of multiple scales being attached to the system, this endpoint can be used to send data from other scales. The row in the database that contains the data for this measurement will be updated accordingly. In case the main data for this measurement (temp, weight of scale 1 and humidity) isn't in yet and there is no row, the system takes care of this automatically.
* ```token```: Value defined as _'insert_token'_ in config.py
* ```w```: The weight this scale has determined
* ```n```: The number/id/name of the scale (a column with the name of this value has to exist otherwise the data won't be accepted)

<br>

## [GET] /api/gallery/list
### Params: ```token```
Returns a list of all categories (subdirectories) and the images contained in them. The image files and optionally their corresponding subdirectories go into the **_gallery_** folder.

```token``` requires the value defined as _'display_token'_ in config.py.