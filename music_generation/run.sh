pip install -r requirements.txt > /dev/null

mkdir -p outputs
# python magenta/models/melody_rnn/melody_rnn_generate.py --config attention_rnn --bundle_file ./attention_rnn.mag --output_dir ./outputs

python melody_rnn/server.py --config attention_rnn --bundle_file ./attention_rnn.mag --output_dir ./outputs
