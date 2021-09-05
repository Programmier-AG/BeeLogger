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