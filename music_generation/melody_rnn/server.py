from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import tensorflow as tf
from melody_rnn_generate import get_generator, run_with_flags
import json
import simplejson
import urlparse
from multiprocessing import Pool

FLAGS = tf.app.flags.FLAGS
tf.app.flags.DEFINE_string(
    'run_dir', None,
    'Path to the directory where the latest checkpoint will be loaded from.')
tf.app.flags.DEFINE_string(
    'checkpoint_file', None,
    'Path to the checkpoint file. run_dir will take priority over this flag.')
tf.app.flags.DEFINE_string(
    'bundle_file', None,
    'Path to the bundle file. If specified, this will take priority over '
    'run_dir and checkpoint_file, unless save_generator_bundle is True, in '
    'which case both this flag and either run_dir or checkpoint_file are '
    'required')
tf.app.flags.DEFINE_boolean(
    'save_generator_bundle', False,
    'If true, instead of generating a sequence, will save this generator as a '
    'bundle file in the location specified by the bundle_file flag')
tf.app.flags.DEFINE_string(
    'bundle_description', None,
    'A short, human-readable text description of the bundle (e.g., training '
    'data, hyper parameters, etc.).')
tf.app.flags.DEFINE_string(
    'output_dir', '/tmp/melody_rnn/generated',
    'The directory where MIDI files will be saved to.')
tf.app.flags.DEFINE_integer(
    'num_outputs', 1,
    'The number of melodies to generate. One MIDI file will be created for '
    'each.')
tf.app.flags.DEFINE_integer(
    'num_steps', 48,
    'The total number of steps the generated melodies should be, priming '
    'melody length + generated steps. Each step is a 16th of a bar.')
tf.app.flags.DEFINE_string(
    'primer_melody', '',
    'A string representation of a Python list of '
    'magenta.music.Melody event values. For example: '
    '"[60, -2, 60, -2, 67, -2, 67, -2]". If specified, this melody will be '
    'used as the priming melody. If a priming melody is not specified, '
    'melodies will be generated from scratch.')
tf.app.flags.DEFINE_string(
    'primer_midi', '',
    'The path to a MIDI file containing a melody that will be used as a '
    'priming melody. If a primer melody is not specified, melodies will be '
    'generated from scratch.')
tf.app.flags.DEFINE_float(
    'qpm', None,
    'The quarters per minute to play generated output at. If a primer MIDI is '
    'given, the qpm from that will override this flag. If qpm is None, qpm '
    'will default to 120.')
tf.app.flags.DEFINE_float(
    'temperature', 1.0,
    'The randomness of the generated melodies. 1.0 uses the unaltered softmax '
    'probabilities, greater than 1.0 makes melodies more random, less than 1.0 '
    'makes melodies less random.')
tf.app.flags.DEFINE_integer(
    'beam_size', 1,
    'The beam size to use for beam search when generating melodies.')
tf.app.flags.DEFINE_integer(
    'branch_factor', 1,
    'The branch factor to use for beam search when generating melodies.')
tf.app.flags.DEFINE_integer(
    'steps_per_iteration', 1,
    'The number of melody steps to take per beam search iteration.')
tf.app.flags.DEFINE_string(
    'log', 'INFO',
    'The threshold for what messages will be logged DEBUG, INFO, WARN, ERROR, '
    'or FATAL.')
tf.app.flags.DEFINE_integer(
    'port', 5000,
    'Server port')

def generate_melody((generator, primer_melody, num_steps)):
    FLAGS.num_outputs = 1
    FLAGS.primer_melody = str(primer_melody)
    FLAGS.num_steps = int(num_steps)
    return list(run_with_flags(FLAGS, generator))[0]

pool = Pool(2)

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_POST(self):
        """
        Example usage:

        curl -d "{\"num_outputs\":10,
                  \"primer_melody\":[60]
                  \"num_steps\":48}"
             -H "Content-Type: application/json"
             -X POST http://localhost:5000/data
        
        @return generated_melodies: [ [notes, loglik, midi_path], ... ]
        such that:
            - len(generated_melodies) = data["num_outputs"]
            - each `notes` is data["num_steps"] long
            - each `notes` starts with data["primer_melody"]
        """
        
        self._set_headers()
        print "in post method"
        self.data_string = self.rfile.read(int(self.headers['Content-Length']))

        self.send_response(200)
        self.end_headers()

        data = simplejson.loads(self.data_string)
        
        num_outputs = data['num_outputs'];
        primer_melody = data['primer_melody'];
        num_steps = data['num_steps'];

        generated_melodies = list(
            pool.map(generate_melody, [(generator,primer_melody,num_steps)]*num_outputs)
            )

        # Single process:
        # generated_melodies = list(run_with_flags(FLAGS, generator))        

        self.wfile.write(json.dumps(generated_melodies))

def run(unused_argv, server_class=HTTPServer, handler_class=S):
    server_address = ('', FLAGS.port)
    httpd = server_class(server_address, handler_class)
    
    global generator
    generator = get_generator(FLAGS)

    print 'Starting melody server on port', FLAGS.port 
    httpd.serve_forever()

if __name__ == "__main__":
  tf.app.run(run)
