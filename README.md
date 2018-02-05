# piano-language
Do pianos speak of electric-sheep

# development

## Demo app

To run the Flask app with next word prediction in debug mode:

1. `cd app`
2. `export FLASK_APP=app.py; FLASK_DEBUG=1 flask run`
3. Visit `http://localhost:5000`
4. In another tab, visit [http://www.multiplayerpiano.com](http://www.multiplayerpiano.com) in a new tab, and click: "Play Alone" 

The `app/mytextgenrnn` folder contains a the [textgenrnn](https://github.com/minimaxir/textgenrnn) package, modified to more efficiently generate next word predictions.

## Music Generation server

To run the http server with next melody prediction:

1. `cd music_generation`

Install dependendencies (once) with:

2. `./install.sh`

Start the server on port 5001 with:

3. `./run.sh`