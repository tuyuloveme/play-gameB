from flask import Flask, request, jsonify
from urllib import request as urlreq
from flask_cors import CORS
import json, os

app = Flask(__name__)
CORS(app)

DATA_DIR = 'data'

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        with open(path, 'w') as f:
            json.dump([], f)

    with open(path, 'r') as f:
        try:
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
        except Exception as e:
            print(f'❌ Gagal load {filename}, reset ke array kosong. Error: {e}')
            return []

def save_json(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

# ------------------------
# PS
# ------------------------
@app.route('/ps', methods=['GET'])
def get_ps():
    return jsonify(load_json('ps.json'))

@app.route('/ps', methods=['POST'])
def add_ps():
    data = load_json('ps.json')
    new_item = request.json
    data.append(new_item)
    save_json('ps.json', data)
    return jsonify(new_item)

@app.route('/ps/<string:id>', methods=['DELETE'])
def delete_ps(id):
    data = load_json('ps.json')
    data = [item for item in data if str(item['id']) != str(id)]
    save_json('ps.json', data)
    return jsonify({'success': True})

# ------------------------
# FNB
# ------------------------
@app.route('/fnb', methods=['GET'])
def get_fnb():
    return jsonify(load_json('fnb.json'))

@app.route('/fnb', methods=['POST'])
def add_fnb():
    data = load_json('fnb.json')
    new_item = request.json
    data.append(new_item)
    save_json('fnb.json', data)
    return jsonify(new_item)

@app.route('/fnb/<int:id>', methods=['PUT'])
def update_fnb(id):
    data = load_json('fnb.json')
    updated = request.json
    for i, item in enumerate(data):
        if item['id'] == id:
            data[i] = { **item, **updated }
            break
    save_json('fnb.json', data)
    return jsonify({'success': True})

@app.route('/fnb/<int:id>', methods=['DELETE'])
def delete_fnb(id):
    data = load_json('fnb.json')
    data = [item for item in data if item['id'] != id]
    save_json('fnb.json', data)
    return jsonify({'success': True})

# ------------------------
# TRANSAKSI
# ------------------------
@app.route('/transaksi', methods=['GET'])
def get_transaksi():
    return jsonify(load_json('transaksi.json'))

@app.route('/transaksi', methods=['POST'])
def add_transaksi():
    data = load_json('transaksi.json')
    new_trx = request.json
    data.append(new_trx)
    save_json('transaksi.json', data)
    return jsonify(new_trx)

@app.route('/transaksi/<string:id>', methods=['PUT'])  # ✅ ganti int -> string
def update_transaksi(id):
    data = load_json('transaksi.json')
    updated = request.json
    for i, trx in enumerate(data):
        if str(trx['id']) == str(id):  # ✅ pastikan ID dicocokkan sebagai string
            data[i] = { **trx, **updated }
            break
    save_json('transaksi.json', data)
    return jsonify({'success': True})

@app.route('/transaksi/<string:id>', methods=['DELETE'])  # ✅ ganti int -> string
def delete_transaksi(id):
    data = load_json('transaksi.json')
    data = [trx for trx in data if str(trx['id']) != str(id)]  # ✅ bandingkan string
    save_json('transaksi.json', data)
    return jsonify({'success': True})

# ------------------------
# RIWAYAT
# ------------------------
@app.route('/riwayat', methods=['GET'])
def get_riwayat():
    return jsonify(load_json('riwayat.json'))

@app.route('/riwayat', methods=['POST'])
def add_riwayat():
    data = load_json('riwayat.json')
    new_data = request.json

    # ✅ Cek apakah ID sudah ada
    existing = next((item for item in data if str(item['id']) == str(new_data['id'])), None)
    if existing:
        return jsonify(existing), 200  # Tidak simpan ulang, return data lama

    # ✅ Simpan hanya jika belum ada
    data.append(new_data)
    save_json('riwayat.json', data)
    return jsonify(new_data), 201

@app.route('/riwayat/<string:id>', methods=['DELETE'])  # ✅ untuk konsistensi juga
def delete_riwayat(id):
    data = load_json('riwayat.json')
    data = [item for item in data if str(item['id']) != str(id)]
    save_json('riwayat.json', data)
    return jsonify({'success': True})

# ------------------------
# ESP CONFIG
# ------------------------
@app.route('/esp', methods=['GET'])
def get_esp_ip():
    path = os.path.join(DATA_DIR, 'esp.json')
    default_ip = 'http://192.168.100.88'
    
    if not os.path.exists(path):
        return jsonify({ 'ip': default_ip })

    try:
        with open(path) as f:
            data = json.load(f)
            return jsonify({ 'ip': data.get('ip', default_ip) })
    except Exception as e:
        print(f'❌ Gagal load esp.json: {e}')
        return jsonify({ 'ip': default_ip })

@app.route('/esp', methods=['POST'])
def update_esp_ip():
    new_ip = request.json.get('ip')
    if not new_ip:
        return jsonify({ 'success': False, 'message': 'IP tidak boleh kosong' }), 400

    path = os.path.join(DATA_DIR, 'esp.json')
    try:
        with open(path, 'w') as f:
            json.dump({ 'ip': new_ip }, f, indent=2)
        return jsonify({ 'success': True })
    except Exception as e:
        print(f'❌ Gagal simpan esp.json: {e}')
        return jsonify({ 'success': False, 'message': str(e) }), 500
    
# ------------------------
# PING & TOGGLE RELAY DARI FLASK KE ESP
# ------------------------
@app.route('/ping-esp', methods=['GET'])
def ping_esp():
    ip = request.args.get('ip')
    if not ip:
        return jsonify({ 'success': False, 'message': 'IP ESP tidak ada' }), 400

    try:
        res = urlreq.urlopen(f"{ip}/ping", timeout=2)
        return jsonify({ 'success': True, 'status': res.read().decode() })
    except Exception as e:
        return jsonify({ 'success': False, 'message': str(e) }), 500

@app.route('/toggle-esp', methods=['GET'])
def toggle_esp():
    ip = request.args.get('ip')
    ps = request.args.get('ps')
    if not ip or not ps:
        return jsonify({ 'success': False, 'message': 'IP atau PS tidak ada' }), 400

    try:
        res = urlreq.urlopen(f"{ip}/power?ps={ps}", timeout=2)
        return jsonify({ 'success': True, 'status': res.read().decode() })
    except Exception as e:
        return jsonify({ 'success': False, 'message': str(e) }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
