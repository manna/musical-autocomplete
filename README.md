# piano-language
Do pianos speak of electric-sheep

# development

To run the Flask app with next word prediction in debug mode:

1. `cd app`
2. `export FLASK_APP=app.py; FLASK_DEBUG=1 flask run`
3. Visit `http://localhost:5000`

The `app/mytextgenrnn` folder contains a the [textgenrnn](https://github.com/minimaxir/textgenrnn) package, modified to more efficiently generate next word predictions.
